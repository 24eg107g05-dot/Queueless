package com.queueless.service;

import com.queueless.entity.Queue;
import com.queueless.entity.ServiceEntity;
import com.queueless.entity.Token;
import com.queueless.enums.TokenStatus;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.ServiceRepository;
import com.queueless.repository.TokenRepository;
import com.queueless.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RuleBasedAiAssistantService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    public String generateResponse(String userMessage, Long tokenId, Long serviceId, Long userId) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Hello! I am your QueueLess assistant. How can I help you today? You can ask about current queue statuses, estimated wait times, available services, or how to manage and cancel tokens.";
        }

        String msg = userMessage.toLowerCase(Locale.ROOT).trim();

        // 1. Greetings
        if (msg.matches("^(hi|hello|hey|greetings|good (morning|afternoon|evening)).*")) {
            return "Hello! Welcome to QueueLess. I can help you with live queue statuses, estimated waiting times, browsing available services, and guiding you on token generation or cancellation. What would you like to know?";
        }

        // 2. Cancel token inquiry (checked before 'my token' so 'how do I cancel my token' triggers cancellation guidance)
        if (msg.contains("cancel") || msg.contains("cancellation") || msg.contains("cancelling")) {
            return "To cancel a token:\n" +
                    "1. Go to the 'My Tokens' or 'Dashboard' page in the top menu.\n" +
                    "2. Locate your active waiting token.\n" +
                    "3. Click the red 'Cancel' button.\n" +
                    "Once cancelled, your position will be removed and your spot will be freed up for the next person.";
        }

        // 3. Currently Serving inquiry
        if (msg.contains("currently being served") || msg.contains("is being served") ||
            msg.contains("who is being served") || msg.contains("which token is being served") ||
            msg.contains("what is currently serving") || msg.contains("who is currently being served") ||
            msg.contains("currently serving") || msg.contains("now serving") ||
            (msg.contains("current token") && (msg.contains("for") || msg.contains("is") || msg.contains("serving")))) {
            return handleCurrentlyServingInquiry(msg, serviceId);
        }

        // 4. Specific token or "my token" / "my status" inquiry
        if (msg.contains("my token") || msg.contains("my status") || msg.contains("my position") || msg.contains("am i next") || (tokenId != null && (msg.contains("status") || msg.contains("wait") || msg.contains("position")))) {
            return handleUserTokenInquiry(tokenId, userId);
        }

        // 4. How queue works / explain queue
        if (msg.contains("how") && (msg.contains("work") || msg.contains("queue works") || msg.contains("system works"))) {
            return "Here is how QueueLess works:\n" +
                    "• Step 1: Select a service from the Services catalog (e.g., Cardiology, General Consultation, Banking).\n" +
                    "• Step 2: Generate a virtual token with one click.\n" +
                    "• Step 3: Track your real-time queue position and estimated wait time without standing in physical lines.\n" +
                    "• Step 4: When staff calls your token, you will be notified live via WebSocket updates.";
        }

        // 5. Available services query
        if (msg.contains("service") || msg.contains("available") || msg.contains("catalog") || msg.contains("departments")) {
            return handleAvailableServicesInquiry();
        }

        // 6. Wait time or queue status query for specific or all services
        if (msg.contains("wait") || msg.contains("time") || msg.contains("queue") || msg.contains("status") || msg.contains("line") || msg.contains("crowd")) {
            return handleQueueWaitTimesInquiry(msg, serviceId);
        }

        // 7. Booking / generating new token
        if (msg.contains("book") || msg.contains("generate") || msg.contains("get token") || msg.contains("appointment") || msg.contains("take a token")) {
            return "To get a new token:\n" +
                    "1. Navigate to the 'Services' tab in the navigation bar.\n" +
                    "2. Choose the service you need.\n" +
                    "3. Click 'Get Token'. Your live token number, position, and wait time will be displayed right away under 'My Tokens'.";
        }

        // 8. Help / Capabilities
        if (msg.contains("help") || msg.contains("what can you do") || msg.contains("support")) {
            return "I can assist you with:\n" +
                    "• Live queue statuses and current serving tokens\n" +
                    "• Estimated wait times across departments\n" +
                    "• Checking your active token details\n" +
                    "• Instructions for booking or cancelling tokens\n" +
                    "• Overview of all available services";
        }

        // 9. Fallback with helpful general overview
        return buildGeneralOverviewResponse();
    }

    private String handleUserTokenInquiry(Long tokenId, Long userId) {
        if (tokenId != null) {
            Optional<Token> tokenOpt = tokenRepository.findById(tokenId);
            if (tokenOpt.isPresent()) {
                Token token = tokenOpt.get();
                ServiceEntity service = token.getServiceEntity();
                Queue queue = service != null ? queueRepository.findByServiceEntityId(service.getId()).orElse(null) : null;
                int avgTime = service != null ? service.getAverageServiceTime() : 10;
                int waitTime = token.getQueuePosition() * avgTime;
                String currentServing = (queue != null && queue.getCurrentServingToken() != null) ? queue.getCurrentServingToken() : "None yet";

                return String.format(
                        "Token %s (%s):\n• Status: %s\n• Queue Position: %d\n• Currently Serving: %s\n• Estimated Wait: ~%d minutes",
                        token.getTokenNumber(),
                        service != null ? service.getName() : "Service",
                        token.getStatus(),
                        token.getQueuePosition(),
                        currentServing,
                        waitTime
                );
            }
        }

        if (userId != null) {
            List<Token> userTokens = tokenRepository.findByUserIdOrderByCreatedAtDesc(userId);
            List<Token> active = userTokens.stream()
                    .filter(t -> t.getStatus() == TokenStatus.WAITING || t.getStatus() == TokenStatus.SERVING)
                    .collect(Collectors.toList());

            if (!active.isEmpty()) {
                StringBuilder sb = new StringBuilder("Here is your active token status:\n");
                for (Token t : active) {
                    ServiceEntity s = t.getServiceEntity();
                    Queue q = s != null ? queueRepository.findByServiceEntityId(s.getId()).orElse(null) : null;
                    String serving = (q != null && q.getCurrentServingToken() != null) ? q.getCurrentServingToken() : "None";
                    int wait = t.getQueuePosition() * (s != null ? s.getAverageServiceTime() : 10);
                    sb.append(String.format("• Token %s for %s: %s (Position: %d, Serving: %s, Est. Wait: ~%d min)\n",
                            t.getTokenNumber(), s != null ? s.getName() : "Service", t.getStatus(), t.getQueuePosition(), serving, wait));
                }
                return sb.toString().trim();
            }
        }

        return "You currently do not have any active tokens waiting in the queue. You can select an available service from the Services menu to generate a token.";
    }

    private String handleCurrentlyServingInquiry(String msg, Long preferredServiceId) {
        List<ServiceEntity> services = serviceRepository.findByActiveTrue();
        ServiceEntity matchedService = null;
        for (ServiceEntity s : services) {
            String sName = s.getName().toLowerCase(Locale.ROOT);
            if (msg.contains(sName) || sName.contains(msg) ||
                    java.util.Arrays.stream(sName.split("\\s+")).anyMatch(w -> w.length() > 3 && msg.contains(w))) {
                matchedService = s;
                break;
            }
            if (s.getCategory() != null && msg.contains(s.getCategory().toLowerCase(Locale.ROOT))) {
                matchedService = s;
                break;
            }
        }

        if (matchedService == null && preferredServiceId != null) {
            matchedService = serviceRepository.findById(preferredServiceId).orElse(null);
        }

        // Specific service requested (e.g. "What is the current token for Cardiology?")
        if (matchedService != null) {
            List<Token> servingList = tokenRepository.findByServiceEntityIdAndStatusOrderByCalledAtAsc(matchedService.getId(), TokenStatus.SERVING);
            if (servingList.isEmpty()) {
                return String.format("No token is currently being served for %s.", matchedService.getName());
            }
            StringBuilder sb = new StringBuilder(String.format("Currently serving for %s:\n", matchedService.getName()));
            for (Token t : servingList) {
                String counter = t.getCounter();
                if (counter == null || counter.trim().isEmpty()) {
                    long cNum = (matchedService.getId() % 5 == 0) ? 5 : (matchedService.getId() % 5);
                    counter = "Counter " + cNum;
                }
                sb.append(String.format("🟢 %s — Token %s — %s\n", matchedService.getName(), t.getTokenNumber(), counter));
            }
            return sb.toString().trim();
        }

        // All currently serving tokens
        List<Token> allServing = tokenRepository.findByStatusOrderByCalledAtAsc(TokenStatus.SERVING);
        if (allServing.isEmpty()) {
            return "No token is currently being served.";
        }

        StringBuilder sb = new StringBuilder("Currently Serving:\n");
        for (Token t : allServing) {
            ServiceEntity s = t.getServiceEntity();
            String sName = (s != null) ? s.getName() : "Service";
            String counter = t.getCounter();
            if (counter == null || counter.trim().isEmpty()) {
                long sId = (s != null && s.getId() != null) ? s.getId() : 1L;
                long cNum = (sId % 5 == 0) ? 5 : (sId % 5);
                counter = "Counter " + cNum;
            }
            sb.append(String.format("🟢 %s — Token %s — %s\n", sName, t.getTokenNumber(), counter));
        }
        return sb.toString().trim();
    }

    private String getCurrentlyServingTextForService(Long serviceId, Queue q) {
        List<Token> servingTokens = tokenRepository.findByServiceEntityIdAndStatusOrderByCalledAtAsc(serviceId, TokenStatus.SERVING);
        if (!servingTokens.isEmpty()) {
            return servingTokens.stream()
                    .map(t -> {
                        String counter = t.getCounter();
                        return t.getTokenNumber() + (counter != null ? " (" + counter + ")" : "");
                    })
                    .collect(Collectors.joining(", "));
        }
        if (q != null && q.getCurrentServingToken() != null && !q.getCurrentServingToken().trim().isEmpty()) {
            return q.getCurrentServingToken();
        }
        return "None";
    }

    private String handleAvailableServicesInquiry() {
        List<ServiceEntity> services = serviceRepository.findByActiveTrue();
        if (services.isEmpty()) {
            return "There are currently no active services configured in the system.";
        }

        StringBuilder sb = new StringBuilder("Currently available services in QueueLess:\n");
        for (ServiceEntity s : services) {
            Queue q = queueRepository.findByServiceEntityId(s.getId()).orElse(null);
            int waiting = tokenRepository.findByServiceEntityIdAndStatusOrderByCreatedAtAsc(s.getId(), TokenStatus.WAITING).size();
            String serving = getCurrentlyServingTextForService(s.getId(), q);
            sb.append(String.format("• %s (%s) — Serving: %s | Waiting: %d | Avg time: %d min\n",
                    s.getName(), s.getCategory(), serving, waiting, s.getAverageServiceTime()));
        }
        sb.append("\nYou can click 'Get Token' on any service from the Services page to join its queue.");
        return sb.toString();
    }

    private String handleQueueWaitTimesInquiry(String msg, Long preferredServiceId) {
        List<ServiceEntity> services = serviceRepository.findByActiveTrue();
        if (services.isEmpty()) {
            return "No active services found.";
        }

        // Try to find if user asked about a specific service name (e.g. "cardiology", "general consultation")
        ServiceEntity matchedService = null;
        for (ServiceEntity s : services) {
            String sName = s.getName().toLowerCase(Locale.ROOT);
            if (msg.contains(sName) || sName.contains(msg) ||
                    java.util.Arrays.stream(sName.split("\\s+")).anyMatch(w -> w.length() > 3 && msg.contains(w))) {
                matchedService = s;
                break;
            }
            if (s.getCategory() != null && msg.contains(s.getCategory().toLowerCase(Locale.ROOT))) {
                matchedService = s;
                break;
            }
        }

        if (matchedService == null && preferredServiceId != null) {
            matchedService = serviceRepository.findById(preferredServiceId).orElse(null);
        }

        if (matchedService != null) {
            Queue q = queueRepository.findByServiceEntityId(matchedService.getId()).orElse(null);
            int waiting = tokenRepository.findByServiceEntityIdAndStatusOrderByCreatedAtAsc(matchedService.getId(), TokenStatus.WAITING).size();
            String serving = getCurrentlyServingTextForService(matchedService.getId(), q);
            int estWait = waiting * matchedService.getAverageServiceTime();

            return String.format(
                    "Current status for %s (%s):\n• Currently Serving: %s\n• People Waiting: %d\n• Average Service Duration: %d min\n• Estimated Wait for New Tokens: ~%d minutes",
                    matchedService.getName(),
                    matchedService.getCategory(),
                    serving,
                    waiting,
                    matchedService.getAverageServiceTime(),
                    estWait
            );
        }

        // Otherwise return a summary of all active queues
        StringBuilder sb = new StringBuilder("Here is the live queue and wait time summary across all services:\n");
        for (ServiceEntity s : services) {
            Queue q = queueRepository.findByServiceEntityId(s.getId()).orElse(null);
            int waiting = tokenRepository.findByServiceEntityIdAndStatusOrderByCreatedAtAsc(s.getId(), TokenStatus.WAITING).size();
            String serving = getCurrentlyServingTextForService(s.getId(), q);
            int totalEstWait = waiting * s.getAverageServiceTime();
            sb.append(String.format("• %s: Serving %s | %d in queue | Est. wait: ~%d min\n",
                    s.getName(), serving, waiting, totalEstWait));
        }
        return sb.toString();
    }

    private String buildGeneralOverviewResponse() {
        List<ServiceEntity> services = serviceRepository.findByActiveTrue();
        int totalWaiting = 0;
        for (ServiceEntity s : services) {
            totalWaiting += tokenRepository.findByServiceEntityIdAndStatusOrderByCreatedAtAsc(s.getId(), TokenStatus.WAITING).size();
        }

        return String.format(
                "QueueLess Smart Assistant:\n" +
                "There are currently %d active services with %d total people waiting in lines.\n\n" +
                "You can ask me:\n" +
                "• \"What is currently being served?\"\n" +
                "• \"What services are available right now?\"\n" +
                "• \"How long is the wait for Cardiology?\"\n" +
                "• \"What is my queue status?\"\n" +
                "• \"How do I cancel my token?\"\n" +
                "• \"Explain how the queue works.\"",
                services.size(), totalWaiting
        );
    }
}
