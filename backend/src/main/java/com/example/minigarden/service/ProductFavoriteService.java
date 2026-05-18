package com.example.minigarden.service;

import com.example.minigarden.dto.ProductResponse;
import com.example.minigarden.entity.ProductFavorites;
import com.example.minigarden.entity.Products;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.ProductFavoriteRepository;
import com.example.minigarden.repository.ProductRepository;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductFavoriteService {

    private final ProductFavoriteRepository productFavoritesRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getUserFavorites(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<ProductFavorites> favorites = productFavoritesRepository.findByUserId(user.getId());
        
        return favorites.stream()
                .map(ProductFavorites::getProduct)
                .map(product -> ProductResponse.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .description(product.getDescription())
                        .price(product.getPrice() != null ? product.getPrice().doubleValue() : null)
                        .quantity(product.getQuantity())
                        .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                        .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                        .images(product.getImages() != null ? product.getImages().stream().map(img -> img.getImage_url()).collect(Collectors.toList()) : new ArrayList<>())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(String email, Integer productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (productFavoritesRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return; // Sản phẩm đã nằm trong danh sách yêu thích
        }

        Products product = productRepository.findById(Objects.requireNonNull(productId))
                .orElseThrow(() -> new RuntimeException("Product not found"));

        ProductFavorites favorite = ProductFavorites.builder()
                .userId(user.getId())
                .product(product)
                .build();

        productFavoritesRepository.save(Objects.requireNonNull(favorite));
    }

    @Transactional
    public void removeFavorite(String email, Integer productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProductFavorites favorite = productFavoritesRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));

        productFavoritesRepository.delete(Objects.requireNonNull(favorite));
    }
}