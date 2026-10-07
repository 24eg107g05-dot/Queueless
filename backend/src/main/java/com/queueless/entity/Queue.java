package com.queueless.entity;

import com.queueless.enums.QueueStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "queues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Queue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false, unique = true)
    private ServiceEntity serviceEntity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QueueStatus queueStatus = QueueStatus.ACTIVE;

    @Column(nullable = false)
    @Builder.Default
    private String tokenPrefix = "A";

    @Builder.Default
    private int lastTokenSequence = 0;

    private String currentServingToken;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
