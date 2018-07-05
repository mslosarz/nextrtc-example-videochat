package org.nextrtc.examples.videochat;

import org.nextrtc.signalingserver.api.NextRTCServer;
import org.nextrtc.signalingserver.domain.Connection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;


public class MyEndpoint extends TextWebSocketHandler {
    private static class SessionWrapper implements Connection {

        private final WebSocketSession session;

        public SessionWrapper(WebSocketSession session) {
            this.session = session;
        }

        @Override
        public String getId() {
            return session.getId();
        }

        @Override
        public boolean isOpen() {
            return session.isOpen();
        }

        @Override
        public void sendObject(Object object) {
            try {
                session.sendMessage(new TextMessage(NextRTCServer.MessageEncoder.encode(object)));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private final NextRTCServer server;

    @Autowired
    MyEndpoint(NextRTCServer server) {
        this.server = server;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        server.register(new SessionWrapper(session));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        server.handle(NextRTCServer.MessageDecoder.decode(message.getPayload()), new SessionWrapper(session));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        server.unregister(new SessionWrapper(session), status.getReason());
    }
}
