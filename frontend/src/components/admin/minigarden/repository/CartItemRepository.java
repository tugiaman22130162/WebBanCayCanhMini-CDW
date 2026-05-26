package com.example.minigarden.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.minigarden.entity.CartItems;

import java.util.List;
import java.util.Optional;
public interface CartItemRepository extends JpaRepository<CartItems, Integer> {

    Optional<CartItems> findByCartIdAndProductId(int cartId, int productId);

    List<CartItems> findByCartId(int cartId);

}