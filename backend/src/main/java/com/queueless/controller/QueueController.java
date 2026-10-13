package com.queueless.controller;

import com.queueless.dto.response.CurrentlyServingResponse;
import com.queueless.dto.response.QueueStatusResponse;
import com.queueless.entity.Queue;
import com.queueless.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    @Autowired
    private QueueService queueService;

    @GetMapping("/serving")
    public ResponseEntity<List<CurrentlyServingResponse>> getCurrentlyServing() {
        return ResponseEntity.ok(queueService.getCurrentlyServingTokens());
    }

    @GetMapping("/{serviceId}/serving")
    public ResponseEntity<List<CurrentlyServingResponse>> getCurrentlyServingByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(queueService.getCurrentlyServingTokensByService(serviceId));
    }

    @GetMapping("/{serviceId}/status")
    public ResponseEntity<Queue> getStatus(@PathVariable Long serviceId) {
        return ResponseEntity.ok(queueService.getQueueStatus(serviceId));
    }

    @GetMapping("/{serviceId}")
    public ResponseEntity<QueueStatusResponse> getQueueByServiceId(@PathVariable Long serviceId) {
        return ResponseEntity.ok(queueService.getDetailedQueueStatus(serviceId));
    }

    @PostMapping("/{serviceId}/next")
    public ResponseEntity<Void> callNext(
            @PathVariable Long serviceId,
            @RequestParam(required = false) String counter) {
        queueService.callNextToken(serviceId, counter);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/token/{tokenId}/complete")
    public ResponseEntity<Void> completeToken(@PathVariable Long tokenId) {
        queueService.completeToken(tokenId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/token/{tokenId}/skip")
    public ResponseEntity<Void> skipToken(@PathVariable Long tokenId) {
        queueService.skipToken(tokenId);
        return ResponseEntity.ok().build();
    }
}
