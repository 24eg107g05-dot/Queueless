package com.queueless.service;

import com.queueless.entity.Queue;
import com.queueless.entity.ServiceEntity;
import com.queueless.enums.QueueStatus;
import com.queueless.exception.ResourceNotFoundException;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServiceManagementService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private QueueRepository queueRepository;

    public List<ServiceEntity> getAllActiveServices() {
        return serviceRepository.findByActiveTrue();
    }

    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    public ServiceEntity getServiceById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    @Transactional
    public ServiceEntity createService(ServiceEntity serviceEntity) {
        ServiceEntity saved = serviceRepository.save(serviceEntity);
        Queue queue = Queue.builder()
                .serviceEntity(saved)
                .queueStatus(QueueStatus.ACTIVE)
                .tokenPrefix(saved.getCategory() != null && !saved.getCategory().isEmpty() ? saved.getCategory().substring(0, 1).toUpperCase() : "S")
                .lastTokenSequence(0)
                .build();
        queueRepository.save(queue);
        return saved;
    }

    @Transactional
    public void deleteService(Long id) {
        ServiceEntity service = getServiceById(id);
        service.setActive(false);
        serviceRepository.save(service);
    }
}
