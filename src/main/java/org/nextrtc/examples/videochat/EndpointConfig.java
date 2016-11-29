package org.nextrtc.examples.videochat;

import org.nextrtc.signalingserver.NextRTCConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

@Configuration
@Import(NextRTCConfig.class)
public class EndpointConfig {
    @Bean
    public MyEndpoint myEndpoint() {
        return new MyEndpoint();
    }

    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}