package com.queueless.controller;

import com.queueless.dto.request.AiChatRequest;
import com.queueless.dto.response.AiChatResponse;
import com.queueless.security.CustomUserDetails;
import com.queueless.service.AiAssistantRouterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiAssistantRouterService aiAssistantRouterService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request, Authentication authentication) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AiChatResponse.builder()
                    .reply("Please provide a valid question or message.")
                    .response("Please provide a valid question or message.")
                    .provider(aiAssistantRouterService.getActiveProviderName())
                    .configured(aiAssistantRouterService.isGeminiConfigured() || aiAssistantRouterService.isOpenAiConfigured())
                    .timestamp(LocalDateTime.now())
                    .build());
        }

        Long userId = null;
        if (authentication != null && authentication.isAuthenticated()) {
            if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
                userId = userDetails.getId();
            } else {
                try {
                    userId = Long.parseLong(authentication.getName());
                } catch (NumberFormatException ignored) {}
            }
        }

        String reply = aiAssistantRouterService.getChatResponse(
                request.getMessage(),
                request.getTokenId(),
                request.getServiceId(),
                userId
        );

        return ResponseEntity.ok(AiChatResponse.builder()
                .reply(reply)
                .response(reply)
                .provider(aiAssistantRouterService.getActiveProviderName())
                .configured(aiAssistantRouterService.isGeminiConfigured() || aiAssistantRouterService.isOpenAiConfigured())
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/status")
    public ResponseEntity<java.util.Map<String, Object>> status() {
        boolean hasExternal = aiAssistantRouterService.isGeminiConfigured() || aiAssistantRouterService.isOpenAiConfigured();
        return ResponseEntity.ok(java.util.Map.of(
                "active", true,
                "provider", aiAssistantRouterService.getActiveProviderName(),
                "externalAiConfigured", hasExternal,
                "geminiConfigured", aiAssistantRouterService.isGeminiConfigured(),
                "openAiConfigured", aiAssistantRouterService.isOpenAiConfigured()
        ));
    }
}
