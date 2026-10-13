package com.queueless.service;

import com.queueless.dto.response.CurrentlyServingResponse;
import com.queueless.entity.Queue;
import com.queueless.entity.ServiceEntity;
import com.queueless.entity.Token;
import com.queueless.entity.User;
import com.queueless.enums.QueueStatus;
import com.queueless.enums.Role;
import com.queueless.enums.TokenStatus;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.ServiceRepository;
import com.queueless.repository.TokenRepository;
import com.queueless.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class QueueServiceCurrentlyServingTest {

    @Autowired
    private QueueService queueService;

    @Autowired
    private RuleBasedAiAssistantService aiAssistantService;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @Transactional
    public void testCurrentlyServingFlowAndAiResponses() {
        // 1. Create unique test services
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        ServiceEntity cardio = serviceRepository.save(ServiceEntity.builder()
                .name("Cardiology " + suffix)
                .category("HOSPITAL")
                .averageServiceTime(15)
                .active(true)
                .build());

        ServiceEntity general = serviceRepository.save(ServiceEntity.builder()
                .name("General Consultation " + suffix)
                .category("HOSPITAL")
                .averageServiceTime(10)
                .active(true)
                .build());

        Queue cardioQueue = queueRepository.save(Queue.builder()
                .serviceEntity(cardio)
                .queueStatus(QueueStatus.ACTIVE)
                .tokenPrefix("C")
                .lastTokenSequence(0)
                .build());

        Queue generalQueue = queueRepository.save(Queue.builder()
                .serviceEntity(general)
                .queueStatus(QueueStatus.ACTIVE)
                .tokenPrefix("G")
                .lastTokenSequence(0)
                .build());

        User user1 = userRepository.save(User.builder()
                .name("Test Patient 1")
                .email("p1-" + suffix + "@test.com")
                .password("pass")
                .role(Role.USER)
                .active(true)
                .build());

        User user2 = userRepository.save(User.builder()
                .name("Test Patient 2")
                .email("p2-" + suffix + "@test.com")
                .password("pass")
                .role(Role.USER)
                .active(true)
                .build());

        // 2. Query empty serving tokens for this service
        List<CurrentlyServingResponse> cardioServingEmpty = queueService.getCurrentlyServingTokensByService(cardio.getId());
        assertNotNull(cardioServingEmpty);
        assertTrue(cardioServingEmpty.isEmpty(), "Should return empty list, not null, when no tokens serving");

        // Test AI assistant response when no token is serving for specific service
        String emptyAiReply = aiAssistantService.generateResponse("What is the current token for Cardiology " + suffix + "?", null, cardio.getId(), user1.getId());
        assertNotNull(emptyAiReply);
        assertTrue(emptyAiReply.contains("No token is currently being served"), "Should say no token is currently being served");
        assertFalse(emptyAiReply.contains("Currently Serving: None"), "Must not say Currently Serving: None");

        // 3. Create waiting tokens for both services
        Token tokenC1 = tokenRepository.save(Token.builder()
                .tokenNumber("C012")
                .user(user1)
                .serviceEntity(cardio)
                .status(TokenStatus.WAITING)
                .queuePosition(1)
                .createdAt(LocalDateTime.now())
                .build());

        Token tokenG1 = tokenRepository.save(Token.builder()
                .tokenNumber("G008")
                .user(user2)
                .serviceEntity(general)
                .status(TokenStatus.WAITING)
                .queuePosition(1)
                .createdAt(LocalDateTime.now())
                .build());

        // Call next for Cardio with Counter 2
        queueService.callNextToken(cardio.getId(), "Counter 2");

        // Call next for General with Counter 1
        queueService.callNextToken(general.getId(), "Counter 1");

        // 4. Verify Currently Serving list returns both active tokens
        List<CurrentlyServingResponse> allServing = queueService.getCurrentlyServingTokens();
        assertNotNull(allServing);
        assertTrue(allServing.size() >= 2);

        CurrentlyServingResponse cardioServing = allServing.stream()
                .filter(s -> s.getTokenNumber().equals("C012"))
                .findFirst()
                .orElse(null);

        assertNotNull(cardioServing);
        assertEquals("Cardiology " + suffix, cardioServing.getServiceName());
        assertEquals("C012", cardioServing.getTokenNumber());
        assertEquals("Counter 2", cardioServing.getCounter());
        assertEquals("SERVING", cardioServing.getStatus());

        CurrentlyServingResponse generalServing = allServing.stream()
                .filter(s -> s.getTokenNumber().equals("G008"))
                .findFirst()
                .orElse(null);

        assertNotNull(generalServing);
        assertEquals("General Consultation " + suffix, generalServing.getServiceName());
        assertEquals("G008", generalServing.getTokenNumber());
        assertEquals("Counter 1", generalServing.getCounter());
        assertEquals("SERVING", generalServing.getStatus());

        // 5. Test AI queries with live data
        // "What is currently being served?"
        String replyWhat = aiAssistantService.generateResponse("What is currently being served?", null, null, null);
        System.out.println("DEBUG_REPLY_WHAT: " + replyWhat);
        assertNotNull(replyWhat);
        assertTrue(replyWhat.contains("Currently Serving"), "Should contain Currently Serving header");
        assertTrue(replyWhat.contains("C012") && replyWhat.contains("Counter 2"));
        assertTrue(replyWhat.contains("G008") && replyWhat.contains("Counter 1"));

        // "Which token is being served?"
        String replyWhich = aiAssistantService.generateResponse("Which token is being served?", null, null, null);
        assertNotNull(replyWhich);
        assertTrue(replyWhich.contains("Currently Serving"));
        assertTrue(replyWhich.contains("C012"));

        // "Who is currently being served?"
        String replyWho = aiAssistantService.generateResponse("Who is currently being served?", null, null, null);
        assertNotNull(replyWho);
        assertTrue(replyWho.contains("Currently Serving"));
        assertTrue(replyWho.contains("C012"));

        // "What is the current token for Cardiology?"
        String replyCardio = aiAssistantService.generateResponse("What is the current token for Cardiology " + suffix + "?", null, cardio.getId(), null);
        System.out.println("DEBUG_REPLY_CARDIO: " + replyCardio);
        assertNotNull(replyCardio);
        assertTrue(replyCardio.contains("C012") && replyCardio.contains("Counter 2"));

        // 6. Complete Cardio token and verify it disappears from serving list
        queueService.completeToken(tokenC1.getId());

        List<CurrentlyServingResponse> afterComplete = queueService.getCurrentlyServingTokens();
        boolean c1StillServing = afterComplete.stream().anyMatch(s -> s.getTokenNumber().equals("C012"));
        assertFalse(c1StillServing, "Completed token C012 must no longer be in currently serving list");

        // General token should still be serving
        boolean g1StillServing = afterComplete.stream().anyMatch(s -> s.getTokenNumber().equals("G008"));
        assertTrue(g1StillServing, "Token G008 should still be in currently serving list");

        // Complete General token
        queueService.completeToken(tokenG1.getId());
        List<CurrentlyServingResponse> afterAllComplete = queueService.getCurrentlyServingTokensByService(cardio.getId());
        assertTrue(afterAllComplete.isEmpty());
    }
}
