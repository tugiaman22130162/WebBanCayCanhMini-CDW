package com.example.minigarden.repository;

import com.example.minigarden.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;


@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetToken(String token);
    
    int countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}