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
public class OpenAiService {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(OpenAiService.class);

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    public String getModel() {
        return model;
    }

    public String chat(String userMessage, String systemContext) {
        if (!isConfigured()) {
            return null;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey.trim());

            String systemPrompt = "You are QueueLess Smart Assistant, helping users navigate a smart queue and appointment management system. "
                    + "Be helpful, accurate, polite, and concise. "
                    + (systemContext != null && !systemContext.trim().isEmpty() ? "\n" + systemContext : "");

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userMessage)
                    ),
                    "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ParameterizedTypeReference<Map<String, Object>> responseType = new ParameterizedTypeReference<>() {};
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    responseType
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("choices")) {
                Object choicesObj = body.get("choices");
                if (choicesObj instanceof List<?> choices && !choices.isEmpty()) {
                    Object firstChoice = choices.get(0);
                    if (firstChoice instanceof Map<?, ?> choiceMap) {
                        Object messageObj = choiceMap.get("message");
                        if (messageObj instanceof Map<?, ?> messageMap) {
                            Object contentObj = messageMap.get("content");
                            if (contentObj != null) {
                                return contentObj.toString().trim();
                            }
                        }
                    }
                }
            }
            return null;
        } catch (org.springframework.web.client.HttpStatusCodeException httpEx) {
            logger.error("OpenAI API HTTP error (status {}): {}", httpEx.getStatusCode(), httpEx.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            logger.error("OpenAI API error (falling back to next provider): {}", e.getMessage(), e);
            return null;
        }
    }
}
