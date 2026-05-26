package com.example.minigarden.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.minigarden.entity.Carts;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Carts, Integer> {
     Optional<Carts> findByUserId(int userId);
    
}
