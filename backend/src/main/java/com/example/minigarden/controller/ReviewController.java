package com.example.minigarden.controller;

import com.example.minigarden.entity.Reviews;
import com.example.minigarden.entity.User;
import com.example.minigarden.entity.Products;
import com.example.minigarden.repository.ProductRepository;
import com.example.minigarden.repository.ReviewsRepository;
import com.example.minigarden.repository.UserRepository;
import com.example.minigarden.service.CloudinaryService;
import com.example.minigarden.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewsRepository reviewsRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;
    private final ReviewService reviewService;

    @GetMapping("/my-reviews")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyReviews(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            List<Reviews> reviews = reviewsRepository.findByUserId(user.getId());

            List<Map<String, Object>> response = reviews.stream().map(r -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", r.getId());
                map.put("rating", r.getRating());
                map.put("comment", r.getComment());
                map.put("status", r.getStatus() != null && r.getStatus() ? "Đã duyệt" : "Chờ duyệt");
                map.put("createdAt", r.getCreated_at());
                
                if (r.getImages() != null && !r.getImages().isEmpty()) {
                    map.put("reviewImages", java.util.Arrays.asList(r.getImages().split(",")));
                } else {
                    map.put("reviewImages", new java.util.ArrayList<>());
                }

                if (r.getProduct() != null) {
                    map.put("productName", r.getProduct().getName());
                    if (r.getProduct().getImages() != null && !r.getProduct().getImages().isEmpty()) {
                        map.put("image", r.getProduct().getImages().get(0).getImage_url());
                    }
                }
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tải lịch sử đánh giá"));
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> createReview(
            @RequestParam("productId") Integer productId,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "images", required = false) MultipartFile[] files,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            Products product = productRepository.findById(Objects.requireNonNull(productId))
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

            String imagesUrl = "";
            if (files != null && files.length > 0) {
                List<String> uploadedUrls = new java.util.ArrayList<>();
                for (MultipartFile file : files) {
                    CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadReviewImage(file);
                    uploadedUrls.add(uploadedImage.secureUrl());
                }
                imagesUrl = String.join(",", uploadedUrls);
            }

            Reviews review = Reviews.builder()
                    .user_id(user.getId())
                    .product(product)
                    .rating(rating)
                    .comment(comment)
                    .images(imagesUrl)
                    .build();
            
            Reviews savedReview = reviewsRepository.save(Objects.requireNonNull(review));

            return ResponseEntity.ok(Map.of(
                    "message", "Đánh giá thành công",
                    "id", savedReview.getId(),
                    "images", imagesUrl
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi gửi đánh giá"));
        }
    }

    // API đánh giá sản phẩm sau khi hoàn thành đơn hàng
    @PostMapping(value = "/order-items/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> reviewOrderItem(
            @PathVariable Integer itemId,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "images", required = false) MultipartFile[] files,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            String imagesUrl = "";
            if (files != null && files.length > 0) {
                List<String> uploadedUrls = new java.util.ArrayList<>();
                for (MultipartFile file : files) {
                    CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadReviewImage(file);
                    uploadedUrls.add(uploadedImage.secureUrl());
                }
                imagesUrl = String.join(",", uploadedUrls);
            }

            reviewService.reviewOrderItem(itemId, user.getId(), rating, comment, imagesUrl);
            return ResponseEntity.ok(Map.of(
                    "message", "Đánh giá thành công",
                    "images", imagesUrl
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi đánh giá"));
        }
    }
}