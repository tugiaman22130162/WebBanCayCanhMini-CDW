package com.example.minigarden.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.minigarden.dto.AddToCartRequest;
import com.example.minigarden.dto.CartResponse;
import com.example.minigarden.service.CartService;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request) {
        String result = cartService.addToCart(request);
        return ResponseEntity.ok(result);
    }

    // Lấy danh sách giỏ hàng
    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Integer userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    // Tăng giảm số lượng
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<String> updateQuantity(@PathVariable Integer cartItemId, @RequestParam int delta) { 
        cartService.updateCartItemQuantity(cartItemId, delta);
        return ResponseEntity.ok("Cập nhật số lượng thành công");
    }

    // Xóa một sản phẩm khỏi giỏ
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<String> removeCartItem(@PathVariable Integer cartItemId) {
        cartService.removeCartItem(cartItemId);
        return ResponseEntity.ok("Xóa sản phẩm thành công");
    }
}
