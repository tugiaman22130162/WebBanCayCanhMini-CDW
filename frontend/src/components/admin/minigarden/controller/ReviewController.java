package com.example.minigarden.controller;

import com.example.minigarden.dto.ReviewReplyRequest;
import com.example.minigarden.dto.ReviewResponse;
import com.example.minigarden.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> toggleStatus(@PathVariable Integer id) {
        reviewService.toggleVisible(id);
        return ResponseEntity.ok("Cập nhật trạng thái đánh giá thành công!");
    }

    @PostMapping("/reply")
    public ResponseEntity<String> replyToReview(
            @RequestBody ReviewReplyRequest request, 
            Authentication authentication) {
        reviewService.reply(request.getReviewId(), request.getComment(), authentication.getName());
        return ResponseEntity.ok("Đã gửi phản hồi thành công!");
    }
}