import os
import sys

base_dir = r"c:\Users\navya\OneDrive\Desktop\queueless\backend"
src_main_java = os.path.join(base_dir, "src", "main", "java", "com", "queueless")
src_main_res = os.path.join(base_dir, "src", "main", "resources")
src_test_java = os.path.join(base_dir, "src", "test", "java", "com", "queueless")

files = {}

files[os.path.join(base_dir, "pom.xml")] = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.queueless</groupId>
    <artifactId>backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>queueless</name>
    <description>QueueLess Backend</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
"""

files[os.path.join(base_dir, ".env.example")] = """DB_URL=jdbc:mysql://localhost:3306/queueless?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=YOUR_DATABASE_PASSWORD
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits-for-hs256-algorithm
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
"""

files[os.path.join(src_main_res, "application.properties")] = """spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/queueless?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true
app.jwt.secret=${JWT_SECRET:queueless-super-secret-key-minimum-256-bits-long-for-hs256}
app.jwt.expiration=86400000
gemini.api.key=${GEMINI_API_KEY:}
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
server.port=8080
spring.websocket.message-broker.relay-host=localhost
"""

files[os.path.join(src_main_res, "application-dev.properties")] = """spring.jpa.show-sql=true
"""

files[os.path.join(src_main_java, "QueuelessApplication.java")] = """package com.queueless;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class QueuelessApplication {
    public static void main(String[] args) {
        SpringApplication.run(QueuelessApplication.class, args);
    }
}
"""

files[os.path.join(src_main_java, "enums", "Role.java")] = """package com.queueless.enums;
public enum Role { USER, STAFF, ADMIN }
"""
files[os.path.join(src_main_java, "enums", "TokenStatus.java")] = """package com.queueless.enums;
public enum TokenStatus { WAITING, SERVING, COMPLETED, CANCELLED, SKIPPED }
"""
files[os.path.join(src_main_java, "enums", "QueueStatus.java")] = """package com.queueless.enums;
public enum QueueStatus { ACTIVE, PAUSED, CLOSED }
"""

files[os.path.join(src_main_java, "entity", "User.java")] = """package com.queueless.entity;

import com.queueless.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String phone;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private boolean active;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
"""

files[os.path.join(src_main_java, "entity", "ServiceEntity.java")] = """package com.queueless.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "services")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Column(nullable = false)
    private String category; // HOSPITAL/BANK/GOVERNMENT
    
    private int averageServiceTime; // in minutes
    
    private boolean active;
    
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "serviceEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Token> tokens;
    
    @OneToOne(mappedBy = "serviceEntity", cascade = CascadeType.ALL)
    private Queue queue;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
"""

files[os.path.join(src_main_java, "entity", "Token.java")] = """package com.queueless.entity;

import com.queueless.enums.TokenStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String tokenNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity serviceEntity;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenStatus status;
    
    private int queuePosition;
    
    private LocalDateTime createdAt;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
"""

files[os.path.join(src_main_java, "entity", "Queue.java")] = """package com.queueless.entity;

import com.queueless.enums.QueueStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queues")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Queue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false, unique = true)
    private ServiceEntity serviceEntity;
    
    private String currentServingToken;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QueueStatus queueStatus;
    
    private LocalDateTime lastUpdated;
    
    @Column(nullable = false)
    @Builder.Default
    private int lastTokenSequence = 0;
    
    @Column(nullable = false)
    private String tokenPrefix;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
"""

files[os.path.join(src_main_java, "entity", "Notification.java")] = """package com.queueless.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String message;
    
    @Column(nullable = false)
    private String type;
    
    private boolean isRead;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
"""

files[os.path.join(src_main_java, "repository", "UserRepository.java")] = """package com.queueless.repository;

import com.queueless.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
"""

files[os.path.join(src_main_java, "repository", "ServiceRepository.java")] = """package com.queueless.repository;

import com.queueless.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByActiveTrue();
}
"""

files[os.path.join(src_main_java, "repository", "QueueRepository.java")] = """package com.queueless.repository;

import com.queueless.entity.Queue;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QueueRepository extends JpaRepository<Queue, Long> {
    Optional<Queue> findByServiceEntityId(Long serviceId);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT q FROM Queue q WHERE q.serviceEntity.id = :serviceId")
    Optional<Queue> findByServiceIdWithLock(@Param("serviceId") Long serviceId);
}
"""

files[os.path.join(src_main_java, "repository", "TokenRepository.java")] = """package com.queueless.repository;

import com.queueless.entity.Token;
import com.queueless.enums.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    List<Token> findByServiceEntityIdAndStatusOrderByCreatedAtAsc(Long serviceId, TokenStatus status);
    List<Token> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Token> findByUserIdAndServiceEntityIdAndStatus(Long userId, Long serviceId, TokenStatus status);
}
"""

files[os.path.join(src_main_java, "repository", "NotificationRepository.java")] = """package com.queueless.repository;

import com.queueless.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    int countByUserIdAndIsReadFalse(Long userId);
}
"""

files[os.path.join(src_main_java, "exception", "GlobalExceptionHandler.java")] = """package com.queueless.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Object> handleUnauthorized(UnauthorizedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Unauthorized", ex.getMessage());
    }

    @ExceptionHandler(TokenGenerationException.class)
    public ResponseEntity<Object> handleTokenGeneration(TokenGenerationException ex) {
        return buildResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrity(DataIntegrityViolationException ex) {
        return buildResponse(HttpStatus.CONFLICT, "Conflict", "Data integrity violation or duplicate token.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidation(MethodArgumentNotValidException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", "Validation error");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneric(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Error", ex.getMessage());
    }

    private ResponseEntity<Object> buildResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
"""

files[os.path.join(src_main_java, "exception", "ResourceNotFoundException.java")] = """package com.queueless.exception;
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String msg) { super(msg); }
}
"""

files[os.path.join(src_main_java, "exception", "UnauthorizedException.java")] = """package com.queueless.exception;
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String msg) { super(msg); }
}
"""

files[os.path.join(src_main_java, "exception", "TokenGenerationException.java")] = """package com.queueless.exception;
public class TokenGenerationException extends RuntimeException {
    public TokenGenerationException(String msg) { super(msg); }
}
"""

# Let's write everything down.
for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Generated full backend files up to exceptions successfully.")
