package com.example.minigarden.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import com.example.minigarden.entity.Promotion;
import com.example.minigarden.entity.PromotionType;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    Optional<Promotion> findByName(String name);

    List<Promotion> findByNameContainingIgnoreCase(String keyword);

    List<Promotion> findByType(PromotionType type);

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.startDate <= CURRENT_TIMESTAMP AND p.endDate >= CURRENT_TIMESTAMP")
    List<Promotion> findActivePromotions();

}
