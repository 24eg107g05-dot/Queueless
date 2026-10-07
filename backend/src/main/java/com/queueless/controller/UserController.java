package com.queueless.controller;

import com.queueless.dto.request.ProfileUpdateRequest;
import com.queueless.entity.User;
import com.queueless.exception.ResourceNotFoundException;
import com.queueless.repository.UserRepository;
import com.queueless.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody ProfileUpdateRequest request, Authentication authentication) {
        final Long userId;
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            userId = userDetails.getId();
        } else {
            userId = Long.parseLong(authentication.getName());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }
}
