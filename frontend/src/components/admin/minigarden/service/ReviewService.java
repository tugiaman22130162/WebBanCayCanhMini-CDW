package com.example.minigarden.service;

import com.example.minigarden.dto.ReviewResponse;
import com.example.minigarden.entity.ReviewReply;
import com.example.minigarden.entity.Reviews;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.ReviewReplyRepository;
import com.example.minigarden.repository.ReviewsRepository;
import com.example.minigarden.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewsRepository reviewsRepository;
    private final UserRepository userRepository;
    private final ReviewReplyRepository reviewReplyRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAll() {
        return reviewsRepository.findAll()
            .stream()
                .map(r -> {
                    User user = userRepository.findById(r.getUser_id()).orElse(null);
                    String prodName = "Sản phẩm không tồn tại";
                    String imgUrl = "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop";
                    if (r.getProduct() != null) {
                        prodName = r.getProduct().getName();
                        if (r.getProduct().getImages() != null && !r.getProduct().getImages().isEmpty()) {
                            imgUrl = r.getProduct().getImages().get(0).getImage_url();
                        }
                    }
                    return ReviewResponse.builder()
                    .id(r.getId())
                        .userName(user != null ? user.getFullName() : "Khách hàng")
                            .productName(prodName)
                    .rating(r.getRating())
                    .comment(r.getComment())
                        .visible(r.getStatus())
                            .createdAt(r.getCreated_at())
                            .image(imgUrl)
                        .build();
                })
            .toList();
    }

    @Transactional
    public void toggleVisible(Integer id) {
        Reviews r = reviewsRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));

        r.setStatus(!r.getStatus());
        reviewsRepository.save(r);
    }

    @Transactional
    public void reply(Integer reviewId, String comment, String email) {

        Reviews review = reviewsRepository.findById(Objects.requireNonNull(reviewId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));

        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quản trị viên"));

    ReviewReply reply = ReviewReply.builder()
            .review(review)
            .user(admin)
            .comment(comment)
            .isVisible(true)
            .build();

        reviewReplyRepository.save(Objects.requireNonNull(reply));
    }
}
