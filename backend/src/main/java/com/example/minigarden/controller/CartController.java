package com.example.minigarden.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.minigarden.dto.AddToCartRequest;
import com.example.minigarden.service.CartService;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request) {
        try {
            String result = cartService.addToCart(request);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Lấy danh sách giỏ hàng
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Integer userId) {
        try {
            return ResponseEntity.ok(cartService.getCart(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Tăng giảm số lượng
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<?> updateQuantity(@PathVariable Integer cartItemId, @RequestParam int delta) { 
        try {
            cartService.updateCartItemQuantity(cartItemId, delta);
            return ResponseEntity.ok(Map.of("message", "Cập nhật số lượng thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Xóa một sản phẩm khỏi giỏ
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeCartItem(@PathVariable Integer cartItemId) {
        try {
            cartService.removeCartItem(cartItemId);
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
