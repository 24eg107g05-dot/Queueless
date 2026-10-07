package com.queueless.service;

import com.queueless.dto.response.AdminStatsResponse;
import com.queueless.dto.request.RoleUpdateRequest;
import com.queueless.entity.ServiceEntity;
import com.queueless.entity.User;
import com.queueless.enums.Role;
import com.queueless.enums.TokenStatus;
import com.queueless.exception.ResourceNotFoundException;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.ServiceRepository;
import com.queueless.repository.TokenRepository;
import com.queueless.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private ServiceManagementService serviceManagementService;

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalTokens = tokenRepository.count();
        long activeQueues = queueRepository.count();
        long completed = tokenRepository.countByStatus(TokenStatus.COMPLETED);
        long cancelled = tokenRepository.countByStatus(TokenStatus.CANCELLED);

        List<ServiceEntity> services = serviceRepository.findAll();
        List<Map<String, Object>> tokensByService = services.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", s.getName());
            map.put("tokens", tokenRepository.findByServiceEntityIdOrderByCreatedAtDesc(s.getId()).size());
            return map;
        }).collect(Collectors.toList());

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalTokensToday(totalTokens)
                .activeQueues(activeQueues)
                .completedToday(completed)
                .cancelledToday(cancelled)
                .avgWaitTime(15)
                .tokensByService(tokensByService)
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void updateUserRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void deleteService(Long serviceId) {
        serviceManagementService.deleteService(serviceId);
    }
}
