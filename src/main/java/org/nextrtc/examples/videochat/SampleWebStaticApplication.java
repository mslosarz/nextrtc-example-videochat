package org.nextrtc.examples.videochat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

@Configuration
@EnableAutoConfiguration
@EnableWebSocket
@Import(MyWebSocketConfigurator.class)
public class SampleWebStaticApplication {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(SampleWebStaticApplication.class, args);
    }
}
