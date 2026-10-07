package com.queueless.service;

import com.queueless.dto.response.TokenResponse;
import com.queueless.entity.Queue;
import com.queueless.entity.ServiceEntity;
import com.queueless.entity.Token;
import com.queueless.entity.User;
import com.queueless.enums.TokenStatus;
import com.queueless.exception.ResourceNotFoundException;
import com.queueless.exception.TokenGenerationException;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.ServiceRepository;
import com.queueless.repository.TokenRepository;
import com.queueless.repository.UserRepository;
import com.queueless.websocket.WebSocketEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TokenService {
    @Autowired private TokenRepository tokenRepository;
    @Autowired private QueueRepository queueRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private WebSocketEventPublisher eventPublisher;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TokenResponse generateToken(Long serviceId, Long userId) {
        Optional<Token> activeToken = tokenRepository.findByUserIdAndServiceEntityIdAndStatus(userId, serviceId, TokenStatus.WAITING);
        if (activeToken.isPresent()) {
            throw new TokenGenerationException("User already has an active token for this service");
        }

        Queue queue = queueRepository.findByServiceIdWithLock(serviceId)
            .orElseThrow(() -> new ResourceNotFoundException("Queue not found for service id: " + serviceId));
            
        ServiceEntity service = queue.getServiceEntity();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        queue.setLastTokenSequence(queue.getLastTokenSequence() + 1);
        String tokenNumber = queue.getTokenPrefix() + "-" + queue.getLastTokenSequence();
        queueRepository.save(queue);

        long waitingCount = tokenRepository.findByServiceEntityIdAndStatusOrderByCreatedAtAsc(serviceId, TokenStatus.WAITING).size();
        
        Token token = Token.builder()
                .tokenNumber(tokenNumber)
                .user(user)
                .serviceEntity(service)
                .status(TokenStatus.WAITING)
                .queuePosition((int) waitingCount + 1)
                .createdAt(LocalDateTime.now())
                .build();
                
        tokenRepository.save(token);

        notificationService.createNotification(userId, "Your token " + tokenNumber + " is generated.", "TOKEN_CREATED");
        eventPublisher.publishQueueUpdate(serviceId);

        return mapToTokenResponse(token, queue, service, userId);
    }

    public List<TokenResponse> getUserTokens(Long userId) {
        List<Token> tokens = tokenRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return tokens.stream().map(token -> {
            ServiceEntity service = token.getServiceEntity();
            Queue queue = service != null ? queueRepository.findByServiceEntityId(service.getId()).orElse(null) : null;
            return mapToTokenResponse(token, queue, service, userId);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void cancelToken(Long tokenId, Long userId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found with id: " + tokenId));
        
        if (token.getUser() != null && !token.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this token");
        }

        token.setStatus(TokenStatus.CANCELLED);
        tokenRepository.save(token);

        Long serviceId = token.getServiceEntity().getId();
        notificationService.createNotification(userId, "Your token " + token.getTokenNumber() + " has been cancelled.", "TOKEN_CANCELLED");
        eventPublisher.publishQueueUpdate(serviceId);
    }

    private TokenResponse mapToTokenResponse(Token token, Queue queue, ServiceEntity service, Long userId) {
        String currentServing = queue != null ? queue.getCurrentServingToken() : null;
        int avgTime = service != null ? service.getAverageServiceTime() : 10;
        int waitTime = token.getQueuePosition() * avgTime;

        return TokenResponse.builder()
                .id(token.getId())
                .tokenNumber(token.getTokenNumber())
                .status(token.getStatus())
                .queuePosition(token.getQueuePosition())
                .currentServingToken(currentServing)
                .estimatedWaitMinutes(waitTime)
                .estimatedWaitTime(waitTime)
                .serviceName(service != null ? service.getName() : "Unknown Service")
                .serviceId(service != null ? service.getId() : null)
                .userId(userId)
                .createdAt(token.getCreatedAt())
                .build();
    }
}
