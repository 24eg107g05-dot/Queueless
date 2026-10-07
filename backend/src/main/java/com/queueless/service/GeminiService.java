package com.queueless.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    public String chat(String userMessage, String queueContext) {
        if (!isConfigured()) {
            return null;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey.trim());

            String systemPrompt = "You are QueueLess AI Assistant, a helpful and friendly assistant for the QueueLess Smart Queue & Appointment System. " +
                    "Your responsibilities:\n" +
                    "1. Help users understand available services and their details\n" +
                    "2. Provide information about queue positions and estimated wait times\n" +
                    "3. Guide users on how to book tokens and manage appointments\n" +
                    "4. Answer general questions about how the QueueLess system works\n" +
                    "5. Provide helpful tips for a better queue experience\n\n" +
                    "Guidelines:\n" +
                    "- Be concise and helpful\n" +
                    "- Use the actual system data provided below when answering questions about services, queues, or tokens\n" +
                    "- If you don't have specific real-time data, say so honestly\n" +
                    "- Don't make up queue positions, wait times, or service details\n" +
                    "- Guide users to use the app features (like the Services page, My Tokens page, etc.)\n" +
                    "- Be friendly and professional\n" +
                    (queueContext != null && !queueContext.trim().isEmpty() ? "\nCurrent live system data:\n" + queueContext : "");
            String fullPrompt = systemPrompt + "\n\nUser question: " + userMessage;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", fullPrompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "maxOutputTokens", 1024
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ParameterizedTypeReference<Map<String, Object>> responseType = new ParameterizedTypeReference<>() {};
            
            String targetUrl = apiUrl.trim();
            if (!targetUrl.contains("key=")) {
                targetUrl = targetUrl + (targetUrl.contains("?") ? "&" : "?") + "key=" + apiKey.trim();
            }

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    targetUrl,
                    HttpMethod.POST,
                    entity,
                    responseType
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                Object candidatesObj = body.get("candidates");
                if (candidatesObj instanceof List<?> candidates && !candidates.isEmpty()) {
                    Object firstCandidate = candidates.get(0);
                    if (firstCandidate instanceof Map<?, ?> candidateMap) {
                        Object contentObj = candidateMap.get("content");
                        if (contentObj instanceof Map<?, ?> contentMap) {
                            Object partsObj = contentMap.get("parts");
                            if (partsObj instanceof List<?> parts && !parts.isEmpty()) {
                                Object firstPart = parts.get(0);
                                if (firstPart instanceof Map<?, ?> partMap) {
                                    Object textObj = partMap.get("text");
                                    if (textObj != null) {
                                        return textObj.toString();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // Could not parse response — fall back to rule-based
            return null;
        } catch (org.springframework.web.client.HttpStatusCodeException httpEx) {
            logger.error("Gemini API HTTP error (status {}): {}", httpEx.getStatusCode(), httpEx.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            logger.error("Gemini API error (falling back to next provider): {}", e.getMessage(), e);
            return null;
        }
    }
}
