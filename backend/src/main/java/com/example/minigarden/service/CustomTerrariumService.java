package com.example.minigarden.service;

import com.example.minigarden.entity.CustomTerrarium;
import com.example.minigarden.entity.CustomTerrariumStatus;
import com.example.minigarden.entity.User;
import com.example.minigarden.entity.NotificationType;
import com.example.minigarden.repository.CustomTerrariumRepository;
import com.example.minigarden.repository.ProductRepository;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomTerrariumService {

    private final CustomTerrariumRepository customTerrariumRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final CloudinaryService cloudinaryService;
    private final ProductRepository productRepository;

    @Transactional
    public Map<String, Object> createDesign(CustomTerrarium design, MultipartFile image, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        design.setUser(user);
        if (design.getStatus() == null) {
            design.setStatus(CustomTerrariumStatus.PENDING);
        }
        design.setCreatedAt(LocalDateTime.now());

        if (image != null && !image.isEmpty()) {
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadUserDesignImage(image);
            design.setUserImage(uploadedImage.secureUrl());
        }

        CustomTerrarium saved = customTerrariumRepository.save(Objects.requireNonNull(design));
        
        if (saved.getStatus() == CustomTerrariumStatus.PENDING) {
            notificationService.createNotification(
                    "Khách hàng " + user.getFullName() + " vừa gửi một yêu cầu duyệt thiết kế Terrarium mới.",
                    "/admin/terrariums",
                    NotificationType.TERRARIUM
            );
        }
        
        return Map.of("message", "Gửi yêu cầu thiết kế thành công!", "id", saved.getId());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyDesigns(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<CustomTerrarium> designs = customTerrariumRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return designs.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllDesigns() {
        List<CustomTerrarium> designs = customTerrariumRepository.findByStatusNot(CustomTerrariumStatus.DRAFT);
        designs.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return designs.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> updateDesign(Integer id, CustomTerrarium updatedDesign, MultipartFile image, String email) {
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        CustomTerrarium existingDesign = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();

        if (!existingDesign.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bản thiết kế này.");
        }
        
        if (existingDesign.getStatus() != CustomTerrariumStatus.DRAFT) {
            throw new RuntimeException("Chỉ có thể chỉnh sửa bản nháp. Để gửi yêu cầu, hãy sử dụng tính năng 'Gửi yêu cầu thiết kế' (nút riêng).");
        }

        existingDesign.setContainerName(updatedDesign.getContainerName());
        existingDesign.setContainerPrice(updatedDesign.getContainerPrice());
        existingDesign.setSoilName(updatedDesign.getSoilName());
        existingDesign.setSoilPrice(updatedDesign.getSoilPrice());
        existingDesign.setPlants(updatedDesign.getPlants());
        existingDesign.setPlantPositions(updatedDesign.getPlantPositions());
        existingDesign.setPlantsPrice(updatedDesign.getPlantsPrice());
        existingDesign.setTotalPrice(updatedDesign.getTotalPrice());
        existingDesign.setUserNote(updatedDesign.getUserNote());
        existingDesign.setStatus(updatedDesign.getStatus());

        if (image != null && !image.isEmpty()) {
            if (existingDesign.getUserImage() != null && !existingDesign.getUserImage().isEmpty()) {
                cloudinaryService.deleteImage(existingDesign.getUserImage());
            }
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadUserDesignImage(image);
            existingDesign.setUserImage(uploadedImage.secureUrl());
        }
        CustomTerrarium saved = customTerrariumRepository.save(existingDesign);

        if (saved.getStatus() == CustomTerrariumStatus.PENDING) {
            notificationService.createNotification(
                    "Khách hàng " + currentUser.getFullName() + " vừa gửi một yêu cầu duyệt thiết kế Terrarium mới (từ bản nháp được cập nhật).",
                    "/admin/terrariums",
                    NotificationType.TERRARIUM
            );
        }
        return Map.of("message", "Cập nhật bản thiết kế thành công!", "id", saved.getId());
    }

    @Transactional
    public void submitDraft(Integer id, String email) {
        CustomTerrarium design = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        if (design.getStatus() != CustomTerrariumStatus.DRAFT) {
            throw new RuntimeException("Chỉ có thể gửi bản nháp!");
        }

        design.setStatus(CustomTerrariumStatus.PENDING);
        customTerrariumRepository.save(design);

        notificationService.createNotification(
                "Khách hàng " + user.getFullName() + " vừa gửi một yêu cầu duyệt thiết kế Terrarium (từ bản nháp).",
                "/admin/terrariums",
                NotificationType.TERRARIUM
        );
    }

    @Transactional
    public void deleteDraft(Integer id, String email) {
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        CustomTerrarium existingDesign = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();

        if (!existingDesign.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa bản thiết kế này.");
        }
        
        if (existingDesign.getStatus() != CustomTerrariumStatus.DRAFT) {
            throw new RuntimeException("Chỉ có thể xóa bản nháp.");
        }

        if (existingDesign.getUserImage() != null && !existingDesign.getUserImage().isEmpty()) {
            cloudinaryService.deleteImage(existingDesign.getUserImage());
        }
        
        customTerrariumRepository.delete(existingDesign);
    }

    @Transactional
    public void updateStatus(Integer id, CustomTerrariumStatus newStatus, String adminReply) {
        CustomTerrarium design = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        design.setStatus(newStatus);
        
        if (adminReply != null) {
            design.setAdminReply(adminReply);
        }
        
        if (design.getUser() != null) {
            String msg = design.getStatus() == CustomTerrariumStatus.APPROVED ? "Thiết kế Terrarium của bạn đã được duyệt!" : "Thiết kế Terrarium của bạn đã bị từ chối.";
            notificationService.createUserNotification(design.getUser().getId(), msg, "/builder?openModal=true", NotificationType.TERRARIUM);
        }
        
        customTerrariumRepository.save(design);
    }

    @Transactional
    public Map<String, Object> createCheckoutProduct(Integer id, String email) {
        CustomTerrarium design = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        if (!design.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Không có quyền truy cập");
        }
        
        if (design.getStatus() != CustomTerrariumStatus.APPROVED) {
            throw new RuntimeException("Thiết kế chưa được duyệt hoặc đã mua.");
        }
        
        String productName = "Terrarium Thiết Kế #" + design.getId() + " - " + (user.getFullName() != null ? user.getFullName() : "Khách hàng");
        
        com.example.minigarden.entity.Products product = productRepository.findAll().stream()
                .filter(p -> p.getName().equals(productName))
                .findFirst()
                .orElse(null);
        
        if (product == null) {
            com.example.minigarden.entity.Products newProduct = new com.example.minigarden.entity.Products();
            newProduct.setName(productName);
            newProduct.setPrice(java.math.BigDecimal.valueOf(design.getTotalPrice()));
            newProduct.setQuantity(1);
            newProduct.setStatus(true);
            newProduct.setCreated_at(LocalDateTime.now());
            productRepository.findAll().stream()
                    .filter(p -> p.getCategory() != null)
                    .findFirst()
                    .ifPresent(base -> newProduct.setCategory(base.getCategory()));
            product = productRepository.save(newProduct);
        }
        return Map.of("productId", product.getId());
    }

    @Transactional
    public Map<String, Object> cloneDesign(Integer id, String email) {
        CustomTerrarium originalDesign = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        CustomTerrarium clonedDesign = CustomTerrarium.builder()
                .user(currentUser)
                .containerName(originalDesign.getContainerName())
                .containerPrice(originalDesign.getContainerPrice())
                .soilName(originalDesign.getSoilName())
                .soilPrice(originalDesign.getSoilPrice())
                .plants(originalDesign.getPlants())
                .plantsPrice(originalDesign.getPlantsPrice())
                .plantPositions(originalDesign.getPlantPositions())
                .totalPrice(originalDesign.getTotalPrice())
                .userNote("Tôi muốn đặt mẫu thiết kế giống với Terrarium #" + originalDesign.getId() + " của tác giả " + (originalDesign.getUser() != null ? originalDesign.getUser().getFullName() : "Khách hàng"))
                .userImage(originalDesign.getUserImage())
                .status(CustomTerrariumStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        CustomTerrarium saved = customTerrariumRepository.save(Objects.requireNonNull(clonedDesign));

        notificationService.createNotification(
                "Khách hàng " + currentUser.getFullName() + " vừa yêu cầu đặt mẫu Terrarium giống thiết kế #" + originalDesign.getId(),
                "/admin/terrariums",
                NotificationType.TERRARIUM
        );

        return Map.of("message", "Gửi yêu cầu thiết kế thành công!", "id", saved.getId());
    }

    private Map<String, Object> mapToDTO(CustomTerrarium design) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", design.getId());
        map.put("containerName", design.getContainerName());
        map.put("containerPrice", design.getContainerPrice());
        map.put("soilName", design.getSoilName());
        map.put("soilPrice", design.getSoilPrice());
        map.put("plants", design.getPlants());
        map.put("plantPositions", design.getPlantPositions());
        map.put("plantsPrice", design.getPlantsPrice());
        map.put("totalPrice", design.getTotalPrice());
        map.put("userNote", design.getUserNote());
        map.put("adminReply", design.getAdminReply());
        map.put("userImage", design.getUserImage());
        map.put("status", design.getStatus());
        map.put("createdAt", design.getCreatedAt());
        
        if (design.getUser() != null) {
            map.put("user", Map.of("id", design.getUser().getId(), "fullName", design.getUser().getFullName(), "email", design.getUser().getEmail()));
        }
        return map;
    }
}