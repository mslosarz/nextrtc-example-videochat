'use strict';
//require('webrtc-adapter');

var NextRTC = function NextRTC(config) {
    if (!(this instanceof NextRTC)) {
        return new NextRTC(config);
    }
    var that = this;
    this.mediaConfig = config.mediaConfig !== undefined ? config.mediaConfig : null;
    this.type = config.type;

    this.signaling = new WebSocket(config.wsURL);
    this.peerConnections = {};
    this.localStream = null;
    this.signals = {};
    this.channelReady = false;
    this.waiting = [];

    this.call = function(event, data) {
        for ( var signal in this.signals) {
            if (event === signal) {
                return this.signals[event](this, data);
            }
        }
        console.log('Event ' + event + ' do not have defined function');
    };

    this.request = function(signal, to, convId, custom) {
        var req = JSON.stringify({
            signal: signal,
            to: to,
            content: convId,
            custom: custom });
        if(!this.channelReady){
            this.waiting.push(req);
        } else {
            console.log("req: " + req);
            this.signaling.send(req);
        }
    };

    this.signaling.onmessage = function(event) {
        console.log("res: " + event.data);
        var signal = JSON.parse(event.data);
        that.call(signal.signal, signal);
    };

    this.signaling.onopen = function() {
        console.log("channel ready");
        that.setChannelReady();
    };

    this.signaling.onclose = function(event) {
        that.call('close', event);
    };

    this.signaling.onerror = function(event) {
        that.call('error', event);
    };

    this.setChannelReady = function(){
        for(var w in that.waiting){
            console.log("req: " + w);
            that.signaling.send(w);
        }
        that.channelReady = true;
    }

    this.preparePeerConnection = function(nextRTC, member) {
        if (nextRTC.peerConnections[member] == undefined) {
            var pc = new RTCPeerConnection(config.peerConfig);
            pc.onaddstream = function(evt) {
                nextRTC.call('remoteStream', {
                    member : member,
                    stream : evt.stream
                });
            };
            pc.onicecandidate = function(evt) {
                handle(pc, evt);

                function handle(pc, evt){
                    if((pc.signalingState || pc.readyState) == 'stable'
                        && nextRTC.peerConnections[member]['rem'] == true){
                        nextRTC.onIceCandidate(nextRTC, member, evt);
                        return;
                    }
                    setTimeout(function(){ handle(pc, evt); }, 2000);
                }
            };
            nextRTC.peerConnections[member] = {}
            nextRTC.peerConnections[member]['pc'] = pc;
            nextRTC.peerConnections[member]['rem'] = false;
        }
        return nextRTC.peerConnections[member];
    };

    this.offerRequest = function(nextRTC, from) {
        nextRTC.offerResponse(nextRTC, from);
    };

    this.offerResponse = function(nextRTC, signal) {
        var pc = nextRTC.preparePeerConnection(nextRTC, signal.from);
        pc['pc'].addStream(nextRTC.localStream);
        pc['pc'].createOffer({offerToReceiveAudio: 1, offerToReceiveVideo: 1})
            .then(function(desc) {
                pc['pc'].setLocalDescription(desc)
                    .then(function() {
                        nextRTC.request('offerResponse', signal.from, desc.sdp);
                    }, that.error);
            });
    };

    this.answerRequest = function(nextRTC, signal) {
        nextRTC.answerResponse(nextRTC, signal);
    };

    this.answerResponse = function(nextRTC, signal) {
        var pc = nextRTC.preparePeerConnection(nextRTC, signal.from);
        pc['pc'].addStream(nextRTC.localStream);
        pc['pc'].setRemoteDescription(new RTCSessionDescription({
            type : 'offer',
            sdp : signal.content
        })).then(function() {
            pc['rem'] = true;
            pc['pc'].createAnswer().then(function(desc) {
                pc['pc'].setLocalDescription(desc).then(function() {
                    nextRTC.request('answerResponse', signal.from, desc.sdp);
                });
              });
          });
    };

    this.finalize = function(nextRTC, signal) {
        var pc = nextRTC.preparePeerConnection(nextRTC, signal.from);
        pc['pc'].setRemoteDescription(new RTCSessionDescription({
            type : 'answer',
            sdp : signal.content
        })).then(function(){
            pc['rem'] = true;
        });
    };

    this.close = function(nextRTC, event) {
        nextRTC.signaling.close();
        if(nextRTC.localStream != null){
            nextRTC.localStream.stop();
        }
    };

    this.candidate = function(nextRTC, signal) {
        var pc = nextRTC.preparePeerConnection(nextRTC, signal.from);
        pc['pc'].addIceCandidate(new RTCIceCandidate(JSON.parse(signal.content.replace(new RegExp('\'', 'g'), '"'))), that.success, that.error);
    }

    this.init = function() {
        this.on('offerRequest', this.offerRequest);
        this.on('answerRequest', this.answerRequest);
        this.on('finalize', this.finalize);
        this.on('candidate', this.candidate);
        this.on('close', this.close);
        this.on('error', this.error);
        this.on('ping', function(){});
    };

    this.onIceCandidate = function(nextRTC, member, event) {
        if (event.candidate) {
            nextRTC.request('candidate', member, JSON.stringify(event.candidate));
        }
    }

    this.init();

    this.error = function(arg){
        console.log('error: ' + arg);
    }

    this.success = function(arg){
        console.log('success: ' + arg);
    }

    that.onReady = function() {
        console.log('It is highly recommended to override method NextRTC.onReady');
    };


    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', function() {
            that.onReady();
        });
    }
};

NextRTC.prototype.on = function on(signal, operation) {
    this.signals[signal] = operation;
};

NextRTC.prototype.create = function create(convId, custom) {
    var nextRTC = this;
    navigator.mediaDevices.getUserMedia(nextRTC.mediaConfig).then(function(stream) {
    nextRTC.localStream = stream;
    nextRTC.call('localStream', {
        stream : stream
    });
    nextRTC.request('create', null, convId, custom);
    }, this.error);
};

NextRTC.prototype.join = function join(convId, custom) {
    var nextRTC = this;
    navigator.mediaDevices.getUserMedia(nextRTC.mediaConfig).then(function(stream) {
        nextRTC.localStream = stream;
        nextRTC.call('localStream', {
            stream : stream
        });
        nextRTC.request('join', null, convId, custom);
    }, this.error);
};

NextRTC.prototype.leave = function leave() {
    var nextRTC = this;
    nextRTC.request('left');
    nextRTC.signaling.close();
    if(nextRTC.localStream != null){
        nextRTC.localStream.stop();
    }
};

//module.exports.NextRTC = NextRTC;