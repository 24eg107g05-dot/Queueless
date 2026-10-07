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
public class CurrentlyServingResponse {
    private Long tokenId;
    private String tokenNumber;
    private Long serviceId;
    private String serviceName;
    private String category;
    private String counter;
    private String staffName;
    private String status;
    private LocalDateTime calledAt;
}
