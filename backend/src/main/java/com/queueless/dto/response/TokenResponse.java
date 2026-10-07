package com.queueless.dto.response;

import com.queueless.enums.TokenStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private Long id;
    private String tokenNumber;
    private TokenStatus status;
    private int queuePosition;
    private String currentServingToken;
    private int estimatedWaitMinutes;
    private String serviceName;
    private Long serviceId;
    private Long userId;
    private LocalDateTime createdAt;
    private Integer estimatedWaitTime;
}
