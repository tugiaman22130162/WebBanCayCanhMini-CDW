package com.example.minigarden.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.minigarden.entity.Cart;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
     Optional<Cart> findByUserId(int userId);
    
}
