package com.example.minigarden.controller;

import com.example.minigarden.dto.ReviewReplyRequest;
import com.example.minigarden.dto.ReviewResponse;
import com.example.minigarden.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import java.security.Principal;
import java.util.List;
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

    @GetMapping("/all")
    public ResponseEntity<?> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAll());
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteMyReview(@PathVariable Integer reviewId, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            reviewService.deleteMyReview(reviewId, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Đã xóa đánh giá thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi xóa đánh giá"));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> toggleStatus(@PathVariable Integer id) {
        reviewService.toggleVisible(id);
        return ResponseEntity.ok("Cập nhật trạng thái đánh giá thành công!");
    }

    @PostMapping("/reply")
    public ResponseEntity<?> replyToReview(
            @RequestBody ReviewReplyRequest request, 
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            reviewService.reply(request.getReviewId(), request.getComment(), principal.getName());
            return ResponseEntity.ok(Map.of("message", "Đã gửi phản hồi thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi phản hồi"));
        }
    }

    @PutMapping("/reply/{replyId}")
    public ResponseEntity<?> editReply(
            @PathVariable Integer replyId,
            @RequestBody Map<String, String> request, 
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            reviewService.editReply(replyId, request.get("comment"), principal.getName());
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật phản hồi thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi cập nhật phản hồi"));
        }
    }

    @DeleteMapping("/reply/{replyId}")
    public ResponseEntity<?> deleteReply(@PathVariable Integer replyId, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            reviewService.deleteReply(replyId, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Đã xóa phản hồi thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi xóa phản hồi"));
        }
    }
}