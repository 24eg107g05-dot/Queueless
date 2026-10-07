package com.queueless.service;

import com.queueless.entity.Queue;
import com.queueless.entity.ServiceEntity;
import com.queueless.entity.User;
import com.queueless.enums.QueueStatus;
import com.queueless.enums.Role;
import com.queueless.repository.QueueRepository;
import com.queueless.repository.ServiceRepository;
import com.queueless.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DataInitializerService {
    @Autowired private UserRepository userRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private QueueRepository queueRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder().name("Admin").email("admin@queueless.com").password(passwordEncoder.encode("Admin@123")).role(Role.ADMIN).active(true).build());
            userRepository.save(User.builder().name("Staff").email("staff@queueless.com").password(passwordEncoder.encode("Staff@123")).role(Role.STAFF).active(true).build());
            userRepository.save(User.builder().name("User").email("user@queueless.com").password(passwordEncoder.encode("User@123")).role(Role.USER).active(true).build());
        }

        if (serviceRepository.count() == 0) {
            List<ServiceEntity> services = Arrays.asList(
                    createService("General Consultation", "HOSPITAL", 5, "H-GEN"),
                    createService("Cardiology", "HOSPITAL", 15, "H-CAR"),
                    createService("Account Services", "BANK", 10, "B-ACC"),
                    createService("Certificate Application", "GOVERNMENT", 20, "G-CERT")
            );
            
            for(ServiceEntity svc : services) {
                ServiceEntity saved = serviceRepository.save(svc);
                Queue q = Queue.builder()
                    .serviceEntity(saved)
                    .queueStatus(QueueStatus.ACTIVE)
                    .tokenPrefix(svc.getCategory().substring(0,1))
                    .build();
                queueRepository.save(q);
            }
        }
    }
    
    private ServiceEntity createService(String name, String category, int avgTime, String prefix) {
        return ServiceEntity.builder()
                .name(name)
                .category(category)
                .averageServiceTime(avgTime)
                .active(true)
                .build();
    }
}
