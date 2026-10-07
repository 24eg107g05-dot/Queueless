package com.queueless.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalTokensToday;
    private long activeQueues;
    private long completedToday;
    private long cancelledToday;
    private int avgWaitTime;
    private List<Map<String, Object>> tokensByService;
}
