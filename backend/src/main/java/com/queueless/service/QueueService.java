package com.queueless.service;

import com.queueless.dto.response.CurrentlyServingResponse;
import com.queueless.dto.response.QueueStatusResponse;
import com.queueless.dto.response.TokenResponse;
import com.queueless.entity.Queue;
import com.queueless.entity.ServiceEntity;
import com.queueless.entity.Token;
import com.queueless.enums.TokenStatus;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.TokenRepository;
import com.queueless.websocket.WebSocketEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QueueService {
    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private WebSocketEventPublisher eventPublisher;

    public Queue getQueueStatus(Long serviceId) {
        return queueRepository.findByServiceEntityId(serviceId).orElseThrow();
    }

    public QueueStatusResponse getDetailedQueueStatus(Long serviceId) {
        Queue queue = queueRepository.findByServiceEntityId(serviceId)
                .orElseThrow(() -> new RuntimeException("Queue not found for service id " + serviceId));
        ServiceEntity service = queue.getServiceEntity();

        List<Token> waitingTokensList = tokenRepository.findByServiceEntityIdAndStatusOrderByCreatedAtAsc(serviceId, TokenStatus.WAITING);
        List<Token> servingTokensList = tokenRepository.findByServiceEntityIdAndStatusOrderByCreatedAtAsc(serviceId, TokenStatus.SERVING);

        Token servingToken = servingTokensList.isEmpty() ? null : servingTokensList.get(0);

        List<TokenResponse> waitingResponses = waitingTokensList.stream().map(t -> TokenResponse.builder()
                .id(t.getId())
                .tokenNumber(t.getTokenNumber())
                .status(t.getStatus())
                .queuePosition(t.getQueuePosition())
                .currentServingToken(queue.getCurrentServingToken())
                .estimatedWaitMinutes(t.getQueuePosition() * service.getAverageServiceTime())
                .estimatedWaitTime(t.getQueuePosition() * service.getAverageServiceTime())
                .serviceName(service.getName())
                .serviceId(service.getId())
                .userId(t.getUser() != null ? t.getUser().getId() : null)
                .createdAt(t.getCreatedAt())
                .build()).collect(Collectors.toList());

        return QueueStatusResponse.builder()
                .serviceId(service.getId())
                .serviceName(service.getName())
                .currentServingToken(queue.getCurrentServingToken())
                .currentlyServing(queue.getCurrentServingToken())
                .servingTokenId(servingToken != null ? servingToken.getId() : null)
                .waitingCount(waitingTokensList.size())
                .queueStatus(queue.getQueueStatus())
                .tokens(waitingResponses)
                .waitingTokens(waitingResponses)
                .build();
    }

    public List<CurrentlyServingResponse> getCurrentlyServingTokens() {
        List<Token> servingTokens = tokenRepository.findByStatusOrderByCalledAtAsc(TokenStatus.SERVING);
        if (servingTokens == null || servingTokens.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return servingTokens.stream()
                .map(this::mapToCurrentlyServingResponse)
                .collect(Collectors.toList());
    }

    public List<CurrentlyServingResponse> getCurrentlyServingTokensByService(Long serviceId) {
        List<Token> servingTokens = tokenRepository.findByServiceEntityIdAndStatusOrderByCalledAtAsc(serviceId, TokenStatus.SERVING);
        if (servingTokens == null || servingTokens.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return servingTokens.stream()
                .map(this::mapToCurrentlyServingResponse)
                .collect(Collectors.toList());
    }

    private CurrentlyServingResponse mapToCurrentlyServingResponse(Token token) {
        ServiceEntity service = token.getServiceEntity();
        String counter = token.getCounter();
        if (counter == null || counter.trim().isEmpty()) {
            long sId = (service != null && service.getId() != null) ? service.getId() : 1L;
            long cNum = (sId % 5 == 0) ? 5 : (sId % 5);
            counter = "Counter " + cNum;
        }
        return CurrentlyServingResponse.builder()
                .tokenId(token.getId())
                .tokenNumber(token.getTokenNumber())
                .serviceId(service != null ? service.getId() : null)
                .serviceName(service != null ? service.getName() : "Unknown Service")
                .category(service != null ? service.getCategory() : "GENERAL")
                .counter(counter)
                .staffName(null)
                .status(token.getStatus() != null ? token.getStatus().name() : "SERVING")
                .calledAt(token.getCalledAt())
                .build();
    }

    @Transactional
    public void callNextToken(Long serviceId) {
        List<Token> waitingTokens = tokenRepository.findByServiceEntityIdAndStatusOrderByCreatedAtAsc(serviceId, TokenStatus.WAITING);
        if (!waitingTokens.isEmpty()) {
            Token nextToken = waitingTokens.get(0);
            nextToken.setStatus(TokenStatus.SERVING);
            nextToken.setCalledAt(LocalDateTime.now());
            if (nextToken.getCounter() == null) {
                long cNum = (serviceId % 5 == 0) ? 5 : (serviceId % 5);
                nextToken.setCounter("Counter " + cNum);
            }
            tokenRepository.save(nextToken);

            Queue queue = queueRepository.findByServiceEntityId(serviceId).orElseThrow();
            queue.setCurrentServingToken(nextToken.getTokenNumber());
            queueRepository.save(queue);

            eventPublisher.publishQueueUpdate(serviceId);
            eventPublisher.publishServingUpdate(getCurrentlyServingTokens());
        }
    }

    @Transactional
    public void completeToken(Long tokenId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found: " + tokenId));
        token.setStatus(TokenStatus.COMPLETED);
        token.setCompletedAt(LocalDateTime.now());
        tokenRepository.save(token);

        Long serviceId = token.getServiceEntity().getId();
        Queue queue = queueRepository.findByServiceEntityId(serviceId).orElse(null);
        if (queue != null) {
            List<Token> otherServing = tokenRepository.findByServiceEntityIdAndStatusOrderByCalledAtAsc(serviceId, TokenStatus.SERVING);
            if (!otherServing.isEmpty()) {
                queue.setCurrentServingToken(otherServing.get(0).getTokenNumber());
            } else {
                queue.setCurrentServingToken(null);
            }
            queueRepository.save(queue);
        }

        eventPublisher.publishQueueUpdate(serviceId);
        eventPublisher.publishServingUpdate(getCurrentlyServingTokens());
    }

    @Transactional
    public void skipToken(Long tokenId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found: " + tokenId));
        token.setStatus(TokenStatus.SKIPPED);
        tokenRepository.save(token);

        Long serviceId = token.getServiceEntity().getId();
        Queue queue = queueRepository.findByServiceEntityId(serviceId).orElse(null);
        if (queue != null) {
            List<Token> otherServing = tokenRepository.findByServiceEntityIdAndStatusOrderByCalledAtAsc(serviceId, TokenStatus.SERVING);
            if (!otherServing.isEmpty()) {
                queue.setCurrentServingToken(otherServing.get(0).getTokenNumber());
            } else {
                queue.setCurrentServingToken(null);
            }
            queueRepository.save(queue);
        }

        eventPublisher.publishQueueUpdate(serviceId);
        eventPublisher.publishServingUpdate(getCurrentlyServingTokens());
    }
}
