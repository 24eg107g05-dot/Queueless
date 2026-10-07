package com.queueless.repository;

import com.queueless.entity.Token;
import com.queueless.enums.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByUserIdAndServiceEntityIdAndStatus(Long userId, Long serviceEntityId, TokenStatus status);

    List<Token> findByServiceEntityIdAndStatusOrderByCreatedAtAsc(Long serviceEntityId, TokenStatus status);

    List<Token> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Token> findByServiceEntityIdOrderByCreatedAtDesc(Long serviceEntityId);

    List<Token> findByStatusOrderByCalledAtAsc(TokenStatus status);

    List<Token> findByStatus(TokenStatus status);

    long countByServiceEntityIdAndStatus(Long serviceEntityId, TokenStatus status);

    long countByStatus(TokenStatus status);
}
