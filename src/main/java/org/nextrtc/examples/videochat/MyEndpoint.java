package org.nextrtc.examples.videochat;

import javax.websocket.server.ServerEndpoint;

import org.nextrtc.signalingserver.api.NextRTCEndpoint;
import org.nextrtc.signalingserver.codec.MessageDecoder;
import org.nextrtc.signalingserver.codec.MessageEncoder;

@ServerEndpoint(value = "/signaling",//
decoders = MessageDecoder.class,//
encoders = MessageEncoder.class)
public class MyEndpoint extends NextRTCEndpoint {
}
