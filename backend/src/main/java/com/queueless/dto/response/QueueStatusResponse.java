package com.queueless.dto.response;

import com.queueless.enums.QueueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueStatusResponse {
    private Long serviceId;
    private String serviceName;
    private String currentServingToken;
    private String currentlyServing;
    private Long servingTokenId;
    private int waitingCount;
    private QueueStatus queueStatus;
    private List<TokenResponse> tokens;
    private List<TokenResponse> waitingTokens;
}
