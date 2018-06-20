package org.nextrtc.examples.videochat;

import org.nextrtc.signalingserver.NextRTCConfig;
import org.nextrtc.signalingserver.api.NextRTCServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;
import org.springframework.web.socket.server.standard.ServerEndpointRegistration;

@Configuration
@Import(NextRTCConfig.class)
public class MyWebSocketConfigurator implements WebSocketConfigurer {
    @Autowired
    private NextRTCServer server;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(customEndpoint(), "/signaling").setAllowedOrigins("*");
    }

    @Bean
    public MyEndpoint customEndpoint() {
        return new MyEndpoint(server);
    }
}