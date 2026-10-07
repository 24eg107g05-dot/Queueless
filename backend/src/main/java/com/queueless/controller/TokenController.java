package com.queueless.controller;

import com.queueless.dto.request.TokenRequest;
import com.queueless.dto.response.TokenResponse;
import com.queueless.security.CustomUserDetails;
import com.queueless.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tokens")
public class TokenController {

    @Autowired
    private TokenService tokenService;

    private Long extractUserId(Authentication authentication) {
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        return Long.parseLong(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<TokenResponse> generateToken(
            @RequestParam(required = false) Long serviceId,
            @RequestBody(required = false) TokenRequest tokenRequest,
            Authentication authentication) {
        
        Long sId = (tokenRequest != null && tokenRequest.getServiceId() != null) ? tokenRequest.getServiceId() : serviceId;
        if (sId == null) {
            throw new IllegalArgumentException("serviceId must be provided");
        }
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(tokenService.generateToken(sId, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TokenResponse>> getMyTokens(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(tokenService.getUserTokens(userId));
    }

    @PostMapping("/{tokenId}/cancel")
    public ResponseEntity<Void> cancelToken(@PathVariable Long tokenId, Authentication authentication) {
        Long userId = extractUserId(authentication);
        tokenService.cancelToken(tokenId, userId);
        return ResponseEntity.ok().build();
    }
}
