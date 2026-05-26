package com.example.minigarden.controller;

import com.example.minigarden.dto.ProductResponse;
import com.example.minigarden.service.ProductFavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class ProductFavoriteController {

    private final ProductFavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getFavorites(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(authentication.getName()));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Integer productId, Authentication authentication) {
        favoriteService.addFavorite(authentication.getName(), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Integer productId, Authentication authentication) {
        favoriteService.removeFavorite(authentication.getName(), productId);
        return ResponseEntity.ok().build();
    }
}