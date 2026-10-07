package com.queueless.controller;

import com.queueless.dto.request.LoginRequest;
import com.queueless.dto.request.RegisterRequest;
import com.queueless.dto.response.AuthResponse;
import com.queueless.entity.User;
import com.queueless.security.CustomUserDetails;
import com.queueless.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.registerUser(registerRequest));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        final Long userId;
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            userId = userDetails.getId();
        } else {
            userId = Long.parseLong(authentication.getName());
        }
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }
}
