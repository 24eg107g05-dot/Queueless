package com.queueless.controller;

import com.queueless.dto.request.RoleUpdateRequest;
import com.queueless.dto.response.AdminStatsResponse;
import com.queueless.entity.User;
import com.queueless.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Void> updateUserRole(@PathVariable Long userId, @RequestBody RoleUpdateRequest request) {
        adminService.updateUserRole(userId, request.getRole());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/services/{serviceId}")
    public ResponseEntity<Void> deleteService(@PathVariable Long serviceId) {
        adminService.deleteService(serviceId);
        return ResponseEntity.ok().build();
    }
}
