package com.example.minigarden.repository;

import com.example.minigarden.entity.ProductFavorites;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductFavoriteRepository extends JpaRepository<ProductFavorites, Integer> {
    List<ProductFavorites> findByUserId(Integer userId);
    Optional<ProductFavorites> findByUserIdAndProductId(Integer userId, Integer productId);
    boolean existsByUserIdAndProductId(Integer userId, Integer productId);
}