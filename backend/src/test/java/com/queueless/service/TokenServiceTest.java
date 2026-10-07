package com.queueless.service;

import com.queueless.entity.Queue;
import com.queueless.entity.ServiceEntity;
import com.queueless.entity.User;
import com.queueless.enums.QueueStatus;
import com.queueless.enums.Role;
import com.queueless.exception.TokenGenerationException;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.ServiceRepository;
import com.queueless.repository.UserRepository;
import com.queueless.dto.response.TokenResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TokenServiceTest {

    @Autowired private TokenService tokenService;
    @Autowired private UserRepository userRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private QueueRepository queueRepository;

    @Test
    public void testDuplicateTokenPrevention() {
        String uniqueEmail = "test-" + UUID.randomUUID() + "@queueless.com";
        User u = userRepository.save(User.builder()
                .name("Test User")
                .email(uniqueEmail)
                .password("pwd")
                .role(Role.USER)
                .active(true)
                .build());

        ServiceEntity s = serviceRepository.save(ServiceEntity.builder()
                .name("Service " + UUID.randomUUID())
                .category("TEST")
                .averageServiceTime(5)
                .active(true)
                .build());

        queueRepository.save(Queue.builder()
                .serviceEntity(s)
                .queueStatus(QueueStatus.ACTIVE)
                .tokenPrefix("T")
                .lastTokenSequence(0)
                .build());
        
        TokenResponse t = tokenService.generateToken(s.getId(), u.getId());
        assertNotNull(t);
        assertNotNull(t.getTokenNumber());
        
        TokenGenerationException ex = assertThrows(TokenGenerationException.class, 
                () -> tokenService.generateToken(s.getId(), u.getId()));
        assertEquals("User already has an active token for this service", ex.getMessage());
    }
}
