package com.example.minigarden.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.minigarden.entity.CartItem;

import java.util.List;
import java.util.Optional;
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    Optional<CartItem> findByCartIdAndProductId(int cartId, int productId);

    List<CartItem> findByCartId(int cartId);

}