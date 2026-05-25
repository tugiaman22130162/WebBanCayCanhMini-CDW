package com.example.minigarden.service;

import com.example.minigarden.entity.OrderItem;
import com.example.minigarden.entity.OrderStatus;
import com.example.minigarden.entity.Products;
import com.example.minigarden.entity.Reviews;
import com.example.minigarden.entity.User;
import com.example.minigarden.entity.NotificationType;
import com.example.minigarden.repository.OrderItemRepository;
import com.example.minigarden.repository.ProductRepository;
import com.example.minigarden.repository.ReviewsRepository;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewsRepository reviewsRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getReviewsByProduct(Integer productId) {
        List<Reviews> reviews = reviewsRepository.findByProductId(productId);
        return reviews.stream()
                .filter(r -> r.getStatus() == null || r.getStatus())
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("rating", r.getRating());
                    map.put("comment", r.getComment());
                    map.put("createdAt", r.getCreated_at());
                    map.put("updatedAt", r.getUpdated_at());
                    map.put("editCount", r.getEditCount() != null ? r.getEditCount() : 0);
                    
                    if (r.getImages() != null && !r.getImages().isEmpty()) {
                        map.put("reviewImages", Arrays.asList(r.getImages().split(",")));
                    } else {
                        map.put("reviewImages", new ArrayList<>());
                    }

                    User user = r.getUser_id() != null ? userRepository.findById(Objects.requireNonNull(r.getUser_id())).orElse(null) : null;
                    if (user != null) {
                        map.put("userName", user.getFullName());
                        map.put("userAvatar", user.getAvatar());
                    } else {
                        map.put("userName", "Khách hàng");
                    }
                    return map;
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyReviews(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        List<Reviews> reviews = reviewsRepository.findByUserId(user.getId());

        return reviews.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("status", r.getStatus() != null && r.getStatus() ? "Đã duyệt" : "Chờ duyệt");
            map.put("createdAt", r.getCreated_at());
            map.put("updatedAt", r.getUpdated_at());
            map.put("editCount", r.getEditCount() != null ? r.getEditCount() : 0);
            
            if (r.getImages() != null && !r.getImages().isEmpty()) {
                map.put("reviewImages", Arrays.asList(r.getImages().split(",")));
            } else {
                map.put("reviewImages", new ArrayList<>());
            }

            if (r.getProduct() != null) {
                map.put("productName", r.getProduct().getName());
                if (r.getProduct().getImages() != null && !r.getProduct().getImages().isEmpty()) {
                    map.put("image", r.getProduct().getImages().get(0).getImage_url());
                }
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createReview(String email, Integer productId, Integer rating, String comment, MultipartFile[] files) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Products product = productRepository.findById(Objects.requireNonNull(productId))
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        String imagesUrl = uploadImages(files);

        Reviews review = Reviews.builder()
                .user_id(user.getId())
                .product(product)
                .rating(rating)
                .comment(comment)
                .images(imagesUrl)
                .build();
        
        Reviews savedReview = reviewsRepository.save(Objects.requireNonNull(review));

        return Map.of(
                "message", "Đánh giá thành công",
                "id", savedReview.getId(),
                "images", imagesUrl
        );
    }

    @Transactional
    public Map<String, Object> reviewOrderItem(String email, Integer itemId, Integer rating, String comment, MultipartFile[] files) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        String imagesUrl = uploadImages(files);

        OrderItem item = orderItemRepository.findById(Objects.requireNonNull(itemId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong đơn hàng"));

        if (!item.getOrder().getUserId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền đánh giá sản phẩm này");
        }

        if (item.getOrder().getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Chỉ có thể đánh giá sản phẩm khi đơn hàng đã giao");
        }

        if (Boolean.TRUE.equals(item.getIsReviewed())) {
            throw new RuntimeException("Sản phẩm này đã được đánh giá");
        }

        Reviews review = Reviews.builder()
                .user_id(user.getId())
                .product(item.getProduct())
                .rating(rating)
                .comment(comment)
                .images(imagesUrl)
                .build();
        reviewsRepository.save(Objects.requireNonNull(review));

        item.setIsReviewed(true);
        orderItemRepository.save(Objects.requireNonNull(item));

        notificationService.createNotification(
                "Khách hàng " + user.getFullName() + " vừa Đánh giá đơn hàng " + item.getOrder().getOrderCode(),
                "/admin/reviews",
                NotificationType.REVIEW
        );

        return Map.of(
                "message", "Đánh giá thành công",
                "images", imagesUrl
        );
    }

    @Transactional
    public Map<String, Object> updateReview(String email, Integer reviewId, Integer rating, String comment, MultipartFile[] files, String keptImages) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Reviews review = reviewsRepository.findById(Objects.requireNonNull(reviewId))
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));

        if (!review.getUser_id().equals(user.getId())) {
            throw new RuntimeException("Không có quyền chỉnh sửa đánh giá này");
        }

        int currentEdits = review.getEditCount() != null ? review.getEditCount() : 0;
        if (currentEdits >= 2) {
            throw new RuntimeException("Bạn đã hết lượt chỉnh sửa cho đánh giá này");
        }

        List<String> finalImages = new ArrayList<>();
        
        if (keptImages != null && !keptImages.trim().isEmpty()) {
            finalImages.addAll(Arrays.asList(keptImages.split(",")));
        }

        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadReviewImage(file);
                finalImages.add(uploadedImage.secureUrl());
            }
        }

        review.setRating(rating);
        review.setComment(comment);
        review.setImages(String.join(",", finalImages));
        review.setUpdated_at(LocalDateTime.now());
        review.setEditCount(currentEdits + 1);

        Reviews savedReview = reviewsRepository.save(review);

        return Map.of(
                "message", "Cập nhật đánh giá thành công",
                "images", savedReview.getImages()
        );
    }

    private String uploadImages(MultipartFile[] files) {
        if (files != null && files.length > 0) {
            List<String> uploadedUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadReviewImage(file);
                uploadedUrls.add(uploadedImage.secureUrl());
            }
            return String.join(",", uploadedUrls);
        }
        return "";
    }
}
