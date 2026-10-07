package com.queueless.controller;

import com.queueless.entity.ServiceEntity;
import com.queueless.service.ServiceManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceManagementService serviceManagementService;

    @GetMapping
    public ResponseEntity<List<ServiceEntity>> getServices() {
        return ResponseEntity.ok(serviceManagementService.getAllActiveServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceEntity> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceManagementService.getServiceById(id));
    }
}
