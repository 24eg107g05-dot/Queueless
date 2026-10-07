package com.queueless.service;

import com.queueless.entity.Queue;
import com.queueless.entity.ServiceEntity;
import com.queueless.entity.User;
import com.queueless.enums.QueueStatus;
import com.queueless.enums.Role;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.ServiceRepository;
import com.queueless.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AiAssistantRouterServiceTest {

    @Autowired
    private AiAssistantRouterService aiAssistantRouterService;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Test
    public void testRuleBasedFallbackWhenNoApiKey() {
        // Setup service and queue
        String name = "Cardiology Test " + UUID.randomUUID();
        ServiceEntity service = serviceRepository.save(ServiceEntity.builder()
                .name(name)
                .category("HOSPITAL")
                .averageServiceTime(15)
                .active(true)
                .build());

        queueRepository.save(Queue.builder()
                .serviceEntity(service)
                .queueStatus(QueueStatus.ACTIVE)
                .tokenPrefix("C")
                .lastTokenSequence(0)
                .build());

        User user = userRepository.save(User.builder()
                .name("AI Tester")
                .email("aitester-" + UUID.randomUUID() + "@queueless.com")
                .password("pass")
                .role(Role.USER)
                .active(true)
                .build());

        // Ask for available services
        String servicesReply = aiAssistantRouterService.getChatResponse("What services are available right now?", null, null, user.getId());
        assertNotNull(servicesReply);
        assertTrue(servicesReply.toLowerCase().contains("available services"));

        // Ask for how to cancel
        String cancelReply = aiAssistantRouterService.getChatResponse("How do I cancel my token?", null, null, user.getId());
        assertNotNull(cancelReply);
        assertTrue(cancelReply.toLowerCase().contains("cancel"));

        // Ask how queue works
        String howWorksReply = aiAssistantRouterService.getChatResponse("Explain how the queue works.", null, null, user.getId());
        assertNotNull(howWorksReply);
        assertTrue(howWorksReply.toLowerCase().contains("step"));

        // Ask for wait time for cardiology
        String waitReply = aiAssistantRouterService.getChatResponse("How long is the wait for Cardiology?", null, null, user.getId());
        assertNotNull(waitReply);
        assertTrue(waitReply.toLowerCase().contains("wait") || waitReply.toLowerCase().contains("serving"));

        // Generate a token and test user token status inquiry
        var tokenResp = tokenService.generateToken(service.getId(), user.getId());
        assertNotNull(tokenResp);

        String myTokenReply = aiAssistantRouterService.getChatResponse("What is my token status?", tokenResp.getId(), null, user.getId());
        assertNotNull(myTokenReply);
        assertTrue(myTokenReply.toLowerCase().contains("token") || myTokenReply.toLowerCase().contains("position"));
    }
}
