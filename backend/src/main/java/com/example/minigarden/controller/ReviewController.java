package com.example.minigarden.controller;

import com.example.minigarden.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsByProduct(@PathVariable Integer productId) {
        try {
            return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tải danh sách đánh giá"));
        }
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<?> getMyReviews(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            return ResponseEntity.ok(reviewService.getMyReviews(principal.getName()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tải lịch sử đánh giá"));
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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
            return ResponseEntity.ok(reviewService.createReview(principal.getName(), productId, rating, comment, files));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi gửi đánh giá"));
        }
    }

    @PostMapping(value = "/order-items/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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
            return ResponseEntity.ok(reviewService.reviewOrderItem(principal.getName(), itemId, rating, comment, files));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi đánh giá"));
        }
    }

    @PutMapping(value = "/{reviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateReview(
            @PathVariable Integer reviewId,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "images", required = false) MultipartFile[] files,
            @RequestParam(value = "keptImages", required = false) String keptImages,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            return ResponseEntity.ok(reviewService.updateReview(principal.getName(), reviewId, rating, comment, files, keptImages));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi cập nhật đánh giá"));
        }
    }
}