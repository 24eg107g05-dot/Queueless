package com.queueless.repository;

import com.queueless.entity.Queue;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QueueRepository extends JpaRepository<Queue, Long> {
    Optional<Queue> findByServiceEntityId(Long serviceEntityId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT q FROM Queue q WHERE q.serviceEntity.id = :serviceId")
    Optional<Queue> findByServiceIdWithLock(@Param("serviceId") Long serviceId);
}
