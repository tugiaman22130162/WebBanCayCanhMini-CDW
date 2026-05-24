package com.example.minigarden.controller;

import com.example.minigarden.entity.Reviews;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.ReviewsRepository;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewsRepository reviewsRepository;
    private final UserRepository userRepository;

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
}