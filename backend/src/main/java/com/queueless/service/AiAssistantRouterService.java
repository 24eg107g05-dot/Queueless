package com.queueless.service;

import com.queueless.entity.Queue;
import com.queueless.entity.ServiceEntity;
import com.queueless.entity.Token;
import com.queueless.enums.TokenStatus;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.ServiceRepository;
import com.queueless.repository.TokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiAssistantRouterService {

    private static final Logger logger = LoggerFactory.getLogger(AiAssistantRouterService.class);

    @Autowired
    private OpenAiService openAiService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private RuleBasedAiAssistantService ruleBasedService;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private TokenRepository tokenRepository;

    public String getChatResponse(String userMessage, Long tokenId, Long serviceId, Long userId) {
        logger.info("Processing AI chat - OpenAI configured: {}, Gemini configured: {}", 
                openAiService.isConfigured(), geminiService.isConfigured());
        
        String liveContext = buildLiveSystemContext(tokenId, serviceId, userId);

        // 1. Prefer OpenAI if configured
        if (openAiService.isConfigured()) {
            logger.debug("Attempting OpenAI...");
            String openAiReply = openAiService.chat(userMessage, liveContext);
            if (openAiReply != null && !openAiReply.trim().isEmpty()) {
                logger.info("Response from OpenAI");
                return openAiReply;
            }
            logger.warn("OpenAI returned empty response, falling back");
        }

        // 2. Fall back to Gemini if configured
        if (geminiService.isConfigured()) {
            logger.debug("Attempting Gemini...");
            String geminiReply = geminiService.chat(userMessage, liveContext);
            if (geminiReply != null && !geminiReply.trim().isEmpty()) {
                logger.info("Response from Gemini");
                return geminiReply;
            }
            logger.warn("Gemini returned empty response, falling back");
        }

        // 3. If no external API key is configured or both return null, provide intelligent rule-based responses using live database data
        logger.info("Using rule-based AI assistant (no external AI provider configured)");
        return ruleBasedService.generateResponse(userMessage, tokenId, serviceId, userId);
    }

    private String buildLiveSystemContext(Long tokenId, Long serviceId, Long userId) {
        StringBuilder sb = new StringBuilder("Current QueueLess live system status:\n");

        List<ServiceEntity> services = serviceRepository.findByActiveTrue();
        sb.append("Active services count: ").append(services.size()).append(".\n");

        List<Token> allServing = tokenRepository.findByStatusOrderByCalledAtAsc(TokenStatus.SERVING);
        if (allServing.isEmpty()) {
            sb.append("Currently Serving across system: No token is currently being served.\n");
        } else {
            sb.append("Currently Serving across system:\n");
            for (Token t : allServing) {
                ServiceEntity s = t.getServiceEntity();
                String sName = (s != null) ? s.getName() : "Service";
                String counter = t.getCounter();
                if (counter == null || counter.trim().isEmpty()) {
                    long cNum = (s != null && s.getId() != null) ? (s.getId() % 5 == 0 ? 5 : s.getId() % 5) : 1;
                    counter = "Counter " + cNum;
                }
                sb.append(String.format("  * %s — Token %s — %s\n", sName, t.getTokenNumber(), counter));
            }
        }

        for (ServiceEntity s : services) {
            Queue q = queueRepository.findByServiceEntityId(s.getId()).orElse(null);
            int waiting = tokenRepository.findByServiceEntityIdAndStatusOrderByCreatedAtAsc(s.getId(), TokenStatus.WAITING).size();
            List<Token> sServing = tokenRepository.findByServiceEntityIdAndStatusOrderByCalledAtAsc(s.getId(), TokenStatus.SERVING);
            String serving;
            if (!sServing.isEmpty()) {
                serving = sServing.stream().map(t -> "Token " + t.getTokenNumber() + " (" + (t.getCounter() != null ? t.getCounter() : "Counter 1") + ")").collect(java.util.stream.Collectors.joining(", "));
            } else if (q != null && q.getCurrentServingToken() != null && !q.getCurrentServingToken().trim().isEmpty()) {
                serving = "Token " + q.getCurrentServingToken();
            } else {
                serving = "No token is currently being served";
            }
            sb.append(String.format("- %s (ID: %d, Category: %s, Avg duration: %d min): Serving %s, Waiting count %d.\n",
                    s.getName(), s.getId(), s.getCategory(), s.getAverageServiceTime(), serving, waiting));
        }

        if (tokenId != null) {
            tokenRepository.findById(tokenId).ifPresent(t -> {
                ServiceEntity s = t.getServiceEntity();
                String sName = (s != null) ? s.getName() : "Unknown";
                int avg = (s != null) ? s.getAverageServiceTime() : 10;
                int waitEst = t.getQueuePosition() * avg;
                sb.append(String.format("User's selected Token: %s (Service: %s, Status: %s, Queue Position: %d, Est. Wait: ~%d min).\n",
                        t.getTokenNumber(), sName, t.getStatus(), t.getQueuePosition(), waitEst));
            });
        }

        if (userId != null) {
            List<Token> userTokens = tokenRepository.findByUserIdOrderByCreatedAtDesc(userId);
            List<Token> active = userTokens.stream()
                    .filter(t -> t.getStatus() == TokenStatus.WAITING || t.getStatus() == TokenStatus.SERVING)
                    .toList();
            if (!active.isEmpty()) {
                sb.append("User currently has active tokens in the system:\n");
                for (Token t : active) {
                    ServiceEntity s = t.getServiceEntity();
                    String sName = (s != null) ? s.getName() : "Unknown";
                    int avg = (s != null) ? s.getAverageServiceTime() : 10;
                    int waitEst = t.getQueuePosition() * avg;
                    sb.append(String.format("  - Token %s for %s: Status %s, Position %d, Est. Wait ~%d min.\n",
                            t.getTokenNumber(), sName, t.getStatus(), t.getQueuePosition(), waitEst));
                }
            }
        }

        return sb.toString();
    }

    public String getActiveProviderName() {
        if (openAiService.isConfigured()) {
            return "OpenAI (" + openAiService.getModel() + ")";
        }
        if (geminiService.isConfigured()) {
            return "Google Gemini";
        }
        return "Smart Built-in Assistant";
    }

    public boolean isGeminiConfigured() {
        return geminiService.isConfigured();
    }

    public boolean isOpenAiConfigured() {
        return openAiService.isConfigured();
    }
}
