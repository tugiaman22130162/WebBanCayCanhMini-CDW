package com.example.minigarden.repository;

import com.example.minigarden.entity.Products;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Products, Integer> {
    boolean existsByName(String name);

    @Query("SELECT DISTINCT p FROM Products p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.images WHERE p.status = true")
    List<Products> findAllForList();

    @Query("SELECT oi.product FROM OrderItem oi WHERE oi.order.id IN (SELECT p.order.id FROM Payments p WHERE p.status = 'SUCCESS') GROUP BY oi.product ORDER BY SUM(oi.quantity) DESC")
    List<Products> findBestSellingProducts(Pageable pageable);

    //đếm số lượng sản phẩm theo category
     int countByStatusTrue();

     @Transactional
     @Modifying
     @Query("UPDATE Products p SET p.quantity = p.quantity - :amount WHERE p.id = :id AND p.quantity >= :amount AND p.status = true")
     int deductInventory(@Param("id") Integer id, @Param("amount") int amount);
     
     @Transactional
     @Modifying
     @Query("UPDATE Products p SET p.quantity = p.quantity + :amount WHERE p.id = :id")
     int restoreInventory(@Param("id") Integer id, @Param("amount") int amount);
}