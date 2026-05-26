package com.example.minigarden.repository;

import com.example.minigarden.entity.PromotionProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface PromotionProductRepository extends JpaRepository<PromotionProduct, Integer> {
    @Transactional
    @Modifying
    @Query("DELETE FROM PromotionProduct p WHERE p.promotion.id = :promotionId")
    void deleteByPromotionId(Integer promotionId);

    boolean existsByPromotionIdAndProductId(Integer promotionId, Integer productId);

    List<PromotionProduct> findByPromotionId(Integer promotionId);
}