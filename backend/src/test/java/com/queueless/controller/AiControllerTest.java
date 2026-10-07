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
}
