package com.example.minigarden.repository;

import com.example.minigarden.entity.Products;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Products, Integer> {
    boolean existsByName(String name);

    @Query("SELECT DISTINCT p FROM Products p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.images WHERE p.status = true")
    List<Products> findAllForList();
}