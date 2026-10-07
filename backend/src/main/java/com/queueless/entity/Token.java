package com.queueless.entity;

import com.queueless.enums.TokenStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens", indexes = {
        @Index(name = "idx_token_service_status", columnList = "service_id, status"),
        @Index(name = "idx_token_user_service_status", columnList = "user_id, service_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tokenNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity serviceEntity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TokenStatus status = TokenStatus.WAITING;

    @Column(nullable = false)
    private int queuePosition;

    private String counter;

    private LocalDateTime calledAt;

    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
