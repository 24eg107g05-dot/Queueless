package com.queueless.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {
    private String reply;
    private String response;
    private String provider;
    private Boolean configured;
    private LocalDateTime timestamp;
}
