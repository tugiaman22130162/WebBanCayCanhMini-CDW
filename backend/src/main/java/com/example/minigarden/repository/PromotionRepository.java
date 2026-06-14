package com.example.minigarden.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import com.example.minigarden.entity.Promotion;
import com.example.minigarden.entity.PromotionType;

import java.time.LocalDateTime;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    Optional<Promotion> findByName(String name);

    List<Promotion> findByNameContainingIgnoreCase(String keyword);

    List<Promotion> findByType(PromotionType type);

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.startDate <= CURRENT_TIMESTAMP AND p.endDate >= CURRENT_TIMESTAMP")
    List<Promotion> findActivePromotions();

    @Query("SELECT p FROM Promotion p " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY p.createdAt DESC")
    List<Promotion> searchPromotions(@Param("keyword") String keyword);

    @Query("SELECT p FROM Promotion p " +
           "WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<Promotion> searchPromotionsWithDate(@Param("keyword") String keyword, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Transactional
    @Modifying
    @Query("""
                UPDATE Promotion p
                SET p.usedCount = p.usedCount + 1,
                    p.isActive = CASE WHEN (p.quantity IS NOT NULL AND (p.usedCount + 1) >= p.quantity) THEN false ELSE p.isActive END
                WHERE p.id = :id
                  AND (p.quantity IS NULL OR p.usedCount < p.quantity)
                  AND p.isActive = true
            """)
    int claimPromotion(@Param("id") Integer id);

    // Lệnh Atomic để hoàn lại lượt sử dụng khi huỷ đơn hàng
    @Transactional
    @Modifying
    @Query("""
                UPDATE Promotion p 
                SET p.usedCount = p.usedCount - 1,
                    p.isActive = CASE WHEN (p.quantity IS NOT NULL AND (p.usedCount - 1) < p.quantity) THEN true ELSE p.isActive END
                WHERE p.name = :name 
                  AND p.usedCount > 0
            """)
    int restorePromotionUsageByName(@Param("name") String name);

}
