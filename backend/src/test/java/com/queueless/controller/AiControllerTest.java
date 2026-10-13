package com.queueless.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.dto.request.AiChatRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testAiChatEndpointReturnsValidResponse() throws Exception {
        AiChatRequest request = AiChatRequest.builder()
                .message("What services are available right now?")
                .build();

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").isNotEmpty())
                .andExpect(jsonPath("$.response").isNotEmpty())
                .andExpect(jsonPath("$.provider").isNotEmpty());
    }

    @Test
    public void testAiChatEndpointEmptyMessageValidation() throws Exception {
        AiChatRequest request = AiChatRequest.builder()
                .message("")
                .build();

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.reply").value("Please provide a valid question or message."));
    }

    @Test
    public void testAiStatusEndpoint() throws Exception {
        mockMvc.perform(get("/api/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.provider").isNotEmpty());
    }

    @Test
    public void testAiChatCurrentlyServingInquiries() throws Exception {
        // 1. "What is currently being served?"
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AiChatRequest.builder()
                                .message("What is currently being served?")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").isNotEmpty())
                .andExpect(jsonPath("$.response").value(org.hamcrest.Matchers.anyOf(
                        org.hamcrest.Matchers.containsString("Currently Serving"),
                        org.hamcrest.Matchers.containsString("No token is currently being served")
                )));

        // 2. "Which token is being served?"
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AiChatRequest.builder()
                                .message("Which token is being served?")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").isNotEmpty());

        // 3. "Who is currently being served?"
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AiChatRequest.builder()
                                .message("Who is currently being served?")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").isNotEmpty());

        // 4. "What is the current token for Cardiology?"
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AiChatRequest.builder()
                                .message("What is the current token for Cardiology?")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").isNotEmpty())
                .andExpect(jsonPath("$.response").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Currently Serving: None"))));
    }
}
