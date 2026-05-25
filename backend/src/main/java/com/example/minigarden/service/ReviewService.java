package com.example.minigarden.service;

import com.example.minigarden.entity.OrderItem;
import com.example.minigarden.entity.OrderStatus;
import com.example.minigarden.entity.Reviews;
import com.example.minigarden.repository.OrderItemRepository;
import com.example.minigarden.repository.ReviewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewsRepository reviewsRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public void reviewOrderItem(Integer itemId, Integer userId, Integer rating, String comment, String images) {
        OrderItem item = orderItemRepository.findById(Objects.requireNonNull(itemId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong đơn hàng"));

        if (!item.getOrder().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền đánh giá sản phẩm này");
        }

        if (item.getOrder().getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Chỉ có thể đánh giá sản phẩm khi đơn hàng đã giao");
        }

        if (Boolean.TRUE.equals(item.getIsReviewed())) {
            throw new RuntimeException("Sản phẩm này đã được đánh giá");
        }

        Reviews review = Reviews.builder()
                .user_id(userId)
                .product(item.getProduct())
                .rating(rating)
                .comment(comment)
                .images(images)
                .build();
        reviewsRepository.save(Objects.requireNonNull(review));

        item.setIsReviewed(true);
        orderItemRepository.save(Objects.requireNonNull(item));
    }
}
