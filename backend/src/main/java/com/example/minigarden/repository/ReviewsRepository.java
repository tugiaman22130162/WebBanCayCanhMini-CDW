package com.example.minigarden.repository;

import com.example.minigarden.entity.Reviews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewsRepository extends JpaRepository<Reviews, Integer> {
    @Query("SELECT r FROM Reviews r WHERE r.user_id = :userId ORDER BY r.created_at DESC")
    List<Reviews> findByUserId(@Param("userId") Integer userId);

    List<Reviews> findByProductId(Integer productId);
}