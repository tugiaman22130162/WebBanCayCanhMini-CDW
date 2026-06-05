package com.example.minigarden.service;

import com.example.minigarden.entity.OrderItem;
import com.example.minigarden.entity.OrderStatus;
import com.example.minigarden.entity.Products;
import com.example.minigarden.entity.ReviewReply;
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
import com.example.minigarden.repository.ReviewReplyRepository;


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
    private final ReviewReplyRepository reviewReplyRepository;


    @Transactional(readOnly = true)
    public List<Map<String, Object>> getReviewsByProduct(Integer productId) {
        List<Reviews> reviews = reviewsRepository.findByProductId(productId);
        List<ReviewReply> allReplies = reviewReplyRepository.findAll();

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

                    List<ReviewReply> replies = allReplies.stream().filter(rep -> rep.getReview().getId().equals(r.getId()) && (rep.getIsVisible() == null || rep.getIsVisible())).toList();
                    if (!replies.isEmpty()) {
                        List<Map<String, Object>> repliesList = new ArrayList<>();
                        for (ReviewReply rep : replies) {
                            Map<String, Object> replyMap = new HashMap<>();
                            replyMap.put("id", rep.getId());
                            replyMap.put("content", rep.getComment());
                    String replierName = "Admin";
                    boolean isAdmin = true;
                    if (rep.getUser() != null) {
                        if (rep.getUser().getRole() != null && "ADMIN".equals(rep.getUser().getRole().name())) {
                            replierName = "Quản trị viên " + rep.getUser().getFullName();
                            isAdmin = true;
                        } else {
                            replierName = rep.getUser().getFullName();
                            isAdmin = false;
                        }
                    }
                    replyMap.put("shopName", replierName);
                    replyMap.put("isAdmin", isAdmin);
                            replyMap.put("userId", rep.getUser() != null ? rep.getUser().getId() : null);
                            replyMap.put("date", rep.getCreatedAt() != null ? rep.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
                            replyMap.put("avatar", rep.getUser() != null ? rep.getUser().getAvatar() : null);
                    replyMap.put("updatedAt", rep.getUpdatedAt() != null ? rep.getUpdatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : null);
                    replyMap.put("editCount", rep.getEditCount() != null ? rep.getEditCount() : 0);
                            repliesList.add(replyMap);
                        }
                        map.put("replies", repliesList);
                    }

                    return map;
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyReviews(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        List<Reviews> reviews = reviewsRepository.findByUserId(user.getId());
        List<ReviewReply> allReplies = reviewReplyRepository.findAll();

        return reviews.stream()
            .filter(r -> r.getStatus() == null || r.getStatus()) // Ẩn khỏi danh sách của user nếu đã bị xóa/ẩn
            .map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("status", r.getStatus() != null && r.getStatus() ? "Đang hiện" : "Đã ẩn");
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

            List<ReviewReply> replies = allReplies.stream().filter(rep -> rep.getReview().getId().equals(r.getId()) && (rep.getIsVisible() == null || rep.getIsVisible())).toList();
            if (!replies.isEmpty()) {
                List<Map<String, Object>> repliesList = new ArrayList<>();
                for (ReviewReply rep : replies) {
                    Map<String, Object> replyMap = new HashMap<>();
                    replyMap.put("id", rep.getId());
                    replyMap.put("content", rep.getComment());
                    String replierName = "Admin";
                    boolean isAdmin = true;
                    if (rep.getUser() != null) {
                        if (rep.getUser().getRole() != null && "ADMIN".equals(rep.getUser().getRole().name())) {
                            replierName = "Quản trị viên " + rep.getUser().getFullName();
                            isAdmin = true;
                        } else {
                            replierName = rep.getUser().getFullName();
                            isAdmin = false;
                        }
                    }
                    replyMap.put("shopName", replierName);
                    replyMap.put("isAdmin", isAdmin);
                    replyMap.put("userId", rep.getUser() != null ? rep.getUser().getId() : null);
                    replyMap.put("date", rep.getCreatedAt() != null ? rep.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
                    replyMap.put("avatar", rep.getUser() != null ? rep.getUser().getAvatar() : null);
                    replyMap.put("updatedAt", rep.getUpdatedAt() != null ? rep.getUpdatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : null);
                    replyMap.put("editCount", rep.getEditCount() != null ? rep.getEditCount() : 0);
                    repliesList.add(replyMap);
                }
                map.put("replies", repliesList);
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

        // Tạo thông báo cho Admin
        notificationService.createNotification(
                "Khách hàng " + user.getFullName() + " vừa đánh giá sản phẩm " + product.getName(),
                "/admin/reviews",
                NotificationType.REVIEW
        );

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

        // Tạo thông báo cho Admin
        notificationService.createNotification(
                "Khách hàng " + user.getFullName() + " vừa chỉnh sửa đánh giá cho sản phẩm " + review.getProduct().getName(),
                "/admin/reviews",
                NotificationType.REVIEW
        );

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

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAll() {
        List<ReviewReply> allReplies = reviewReplyRepository.findAll();

        return reviewsRepository.findAll()
            .stream()
                .map(r -> {
                    User user = r.getUser_id() != null ? userRepository.findById(Objects.requireNonNull(r.getUser_id())).orElse(null) : null;
                    String prodName = "Sản phẩm không tồn tại";
                    String imgUrl = "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop";
                    if (r.getProduct() != null) {
                        prodName = r.getProduct().getName();
                        if (r.getProduct().getImages() != null && !r.getProduct().getImages().isEmpty()) {
                            imgUrl = r.getProduct().getImages().get(0).getImage_url();
                        }
                    }

                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("userName", user != null ? user.getFullName() : "Khách hàng");
                    map.put("productName", prodName);
                    map.put("rating", r.getRating());
                    map.put("comment", r.getComment());
                    map.put("visible", r.getStatus());
                    map.put("status", r.getStatus());
                    map.put("createdAt", r.getCreated_at());
                    map.put("updatedAt", r.getUpdated_at());
                    map.put("editCount", r.getEditCount() != null ? r.getEditCount() : 0);
                    map.put("image", imgUrl);

                    List<ReviewReply> replies = allReplies.stream().filter(rep -> rep.getReview().getId().equals(r.getId()) && (rep.getIsVisible() == null || rep.getIsVisible())).toList();
                    if (!replies.isEmpty()) {
                        List<Map<String, Object>> repliesList = new ArrayList<>();
                        for (ReviewReply rep : replies) {
                            Map<String, Object> replyMap = new HashMap<>();
                            replyMap.put("id", rep.getId());
                            replyMap.put("content", rep.getComment());
                            String replierName = "Admin";
                            boolean isAdmin = true;
                            if (rep.getUser() != null) {
                                if (rep.getUser().getRole() != null && "ADMIN".equals(rep.getUser().getRole().name())) {
                                    replierName = "Quản trị viên " + rep.getUser().getFullName();
                                    isAdmin = true;
                                } else {
                                    replierName = rep.getUser().getFullName();
                                    isAdmin = false;
                                }
                            }
                            replyMap.put("shopName", replierName);
                            replyMap.put("isAdmin", isAdmin);
                            replyMap.put("userId", rep.getUser() != null ? rep.getUser().getId() : null);
                            replyMap.put("date", rep.getCreatedAt() != null ? rep.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
                            replyMap.put("avatar", rep.getUser() != null ? rep.getUser().getAvatar() : null);
                            replyMap.put("updatedAt", rep.getUpdatedAt() != null ? rep.getUpdatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : null);
                            replyMap.put("editCount", rep.getEditCount() != null ? rep.getEditCount() : 0);
                            repliesList.add(replyMap);
                        }
                        map.put("replies", repliesList);
                    }

                    return map;
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

        User replier = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        ReviewReply reply = ReviewReply.builder()
                .review(review)
                .user(replier)
                .comment(comment)
                .isVisible(true)
                .build();

        reviewReplyRepository.save(Objects.requireNonNull(reply));

        // Tạo thông báo gửi cho User nếu người phản hồi không phải là chủ của đánh giá
        if (review.getUser_id() != null && !review.getUser_id().equals(replier.getId())) {
            String msg = (replier.getRole() != null && "ADMIN".equals(replier.getRole().name()))
                    ? "Cửa hàng đã phản hồi đánh giá của bạn về sản phẩm " + review.getProduct().getName()
                    : "Khách hàng " + replier.getFullName() + " đã phản hồi đánh giá của bạn về sản phẩm " + review.getProduct().getName();
            notificationService.createUserNotification(review.getUser_id(), msg, "/profile/reviews?tab=reviewed", NotificationType.REVIEW);
        }

        // Tạo thông báo cho Admin nếu người phản hồi là User
        if (replier.getRole() != null && "USER".equals(replier.getRole().name())) {
            notificationService.createNotification(
                    "Khách hàng " + replier.getFullName() + " vừa phản hồi đánh giá trên sản phẩm " + review.getProduct().getName(),
                    "/admin/reviews",
                    NotificationType.REVIEW
            );
        }
    }

    @Transactional
    public void editReply(Integer replyId, String newComment, String email) {
        ReviewReply reply = reviewReplyRepository.findById(Objects.requireNonNull(replyId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phản hồi"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (!reply.getUser().getId().equals(user.getId()) && (user.getRole() == null || !"ADMIN".equals(user.getRole().name()))) {
            throw new RuntimeException("Không có quyền chỉnh sửa phản hồi này");
        }

        int currentEdits = reply.getEditCount() != null ? reply.getEditCount() : 0;
        if (currentEdits >= 2) {
            throw new RuntimeException("Phản hồi này đã vượt quá số lần chỉnh sửa tối đa (2 lần)");
        }

        reply.setComment(newComment);
        reply.setEditCount(currentEdits + 1);
        reviewReplyRepository.save(reply);
    }

    @Transactional
    public void deleteMyReview(Integer reviewId, String email) {
        Reviews review = reviewsRepository.findById(Objects.requireNonNull(reviewId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (!review.getUser_id().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này");
        }

        review.setStatus(false); // Xóa tương đương với Ẩn
        reviewsRepository.save(review);
    }

    @Transactional
    public void deleteReply(Integer replyId, String email) {
        ReviewReply reply = reviewReplyRepository.findById(Objects.requireNonNull(replyId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phản hồi"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (!reply.getUser().getId().equals(user.getId()) && (user.getRole() == null || !"ADMIN".equals(user.getRole().name()))) {
            throw new RuntimeException("Không có quyền xóa phản hồi này");
        }
        reply.setIsVisible(false);
        reviewReplyRepository.save(reply);
    }
}
