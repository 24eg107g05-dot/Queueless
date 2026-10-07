package com.queueless.controller;

import com.queueless.dto.response.NotificationResponse;
import com.queueless.security.CustomUserDetails;
import com.queueless.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    private Long extractUserId(Authentication authentication) {
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        return Long.parseLong(authentication.getName());
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        Long userId = extractUserId(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
