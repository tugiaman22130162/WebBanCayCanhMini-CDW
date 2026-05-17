package com.example.minigarden.repository;

import com.example.minigarden.entity.PromotionCategory;
import com.example.minigarden.entity.PromotionProduct;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface PromotionCategoryRepository extends JpaRepository<PromotionCategory, Integer> {
    @Transactional
    @Modifying
    @Query("DELETE FROM PromotionCategory p WHERE p.promotion.id = :promotionId")
    void deleteByPromotionId(Integer promotionId);

    boolean existsByPromotionIdAndCategoryId(Integer promotionId, Integer categoryId);

    List<PromotionCategory> findByPromotionId(Integer promotionId);

}