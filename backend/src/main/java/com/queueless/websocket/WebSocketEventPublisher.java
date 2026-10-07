package com.queueless.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class WebSocketEventPublisher {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void publishQueueUpdate(Long serviceId) {
        messagingTemplate.convertAndSend("/topic/queue/" + serviceId, "UPDATE");
    }

    public void publishServingUpdate(Object servingTokens) {
        messagingTemplate.convertAndSend("/topic/serving", servingTokens != null ? servingTokens : java.util.Collections.emptyList());
    }
}
