package com.example.minigarden.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.minigarden.dto.PromotionRequest;
import com.example.minigarden.dto.PromotionResponse;
import com.example.minigarden.entity.Promotion;
import com.example.minigarden.repository.PromotionRepository;
import com.example.minigarden.entity.PromotionType;
import com.example.minigarden.entity.DiscountType;
import com.example.minigarden.entity.PromotionCategory;
import com.example.minigarden.entity.PromotionProduct;
import com.example.minigarden.entity.Categories;
import com.example.minigarden.entity.Products;
import com.example.minigarden.repository.PromotionCategoryRepository;
import com.example.minigarden.repository.PromotionProductRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PromotionService {
    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PromotionCategoryRepository promotionCategoryRepository;

    @Autowired
    private PromotionProductRepository promotionProductRepository;


    //map json từ DB sang Response trả về cho FE
    private PromotionResponse mapToResponse( Promotion promotion) {

        Integer targetId = null;
        String targetName = null;

        if (promotion.getType() == PromotionType.CATEGORY) {
            List<PromotionCategory> pcList = promotionCategoryRepository.findByPromotionId(promotion.getId());
            if (pcList != null && !pcList.isEmpty()) {
                targetId = pcList.get(0).getCategory().getId();
                targetName = pcList.get(0).getCategory().getName();
            }
        } else if (promotion.getType() == PromotionType.PRODUCT) {
            List<PromotionProduct> ppList = promotionProductRepository.findByPromotionId(promotion.getId());
            if (ppList != null && !ppList.isEmpty()) {
                targetId = ppList.get(0).getProduct().getId();
                targetName = ppList.get(0).getProduct().getName();
            }
        }

        return PromotionResponse.builder()
                .id(promotion.getId())
                .name(promotion.getName())
                .description(promotion.getDescription())
                .type(promotion.getType())
                .discountType(
                        promotion.getDiscountType())
                .discountValue(
                        promotion.getDiscountValue() != null ? promotion.getDiscountValue().doubleValue() : null)
                .minOrderValue(
                        promotion.getMinOrderValue() != null ? promotion.getMinOrderValue().doubleValue() : null)
                .maxDiscountValue(
                        promotion.getMaxDiscount() != null ? promotion.getMaxDiscount().doubleValue() : null)
                .isActive(
                        promotion.getIsActive())
                .startDate(
                        promotion.getStartDate())
                .endDate(
                        promotion.getEndDate())
                .createdAt(
                        promotion.getCreatedAt())
                .quantity(promotion.getQuantity())
                .targetId(targetId)
                .targetName(targetName)
                .build();
    }

    // Hàm hỗ trợ tự động tạo tên/mã khuyến mãi
    //rule là loại khuyến mãi + giá trị giảm (nếu có) + 4 ký tự ngẫu nhiên
    private String generatePromotionName(PromotionType type, Double value, DiscountType discountType) {
        StringBuilder sb = new StringBuilder();

       //có 4 loại khuyến mãi: SHOP( là SALE), SHIPPING (là SHIP), PRODUCT (là PROD), CATEGORY (là CATE)
        sb.append(type == null ? "SALE" : switch (type) {
            case SHIPPING -> "SHIP";
            case PRODUCT -> "PROD";
            case CATEGORY -> "CATE";
            default -> "SALE";
        });

        // có 3 loại giảm giá: FREE (là FREE), PERCENTAGE (là số% giảm), FIXED_AMOUNT (là số tiền giảm)
        //nếu là FREE thì là FREE, PERCENTAGE thì là số% giảm và P, FIXED_AMOUNT thì là số tiền giảm (nếu >=1000 thì đổi sang K)
        if (discountType != null) {
            switch (discountType) {
                case FREE -> sb.append("FREE");
                case PERCENTAGE -> {
                    if (value != null && value > 0) {
                        sb.append(value.intValue()).append("P");
                    }
                }
                case FIXED_AMOUNT -> {
                    if (value != null && value > 0) {
                        if (value >= 1000 && value % 1000 == 0) {
                            sb.append(value.intValue() / 1000).append("K");
                        } else {
                            sb.append(value.intValue());
                        }
                    }
                }
            }
        }

        // Thêm 5 ký tự ngẫu nhiên (chữ và số, loại bỏ O, 0, I, 1) để mã đẹp, dễ đọc và cực kỳ khó trùng lặp
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        for (int i = 0; i < 5; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }

        return sb.toString();
    }

    // thêm
    @Transactional
    public PromotionResponse create(PromotionRequest request) {

        Promotion promotion = new Promotion();

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            Double discountVal = request.getDiscountValue() != null ? request.getDiscountValue().doubleValue() : null;
            promotion.setName(
                    generatePromotionName(request.getType(), discountVal, request.getDiscountType()));
        } else {
            if (promotionRepository.findByName(request.getName()).isPresent()) {
                throw new RuntimeException("Tên chương trình khuyến mãi đã tồn tại. Vui lòng chọn tên khác!");
            }
            promotion.setName(request.getName());
        }

        promotion.setDescription(request.getDescription());

        promotion.setType(request.getType());

        promotion.setDiscountType(
                request.getDiscountType());

        promotion.setDiscountValue(
                request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO);

        promotion.setMinOrderValue(
                request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO);

        promotion.setMaxDiscount(
                request.getMaxDiscountValue() != null ? request.getMaxDiscountValue() : null);

        promotion.setIsActive(
                request.getIsActive() != null ? request.getIsActive() : true);

        promotion.setStartDate(
                request.getStartDate());

        promotion.setEndDate(
                request.getEndDate());

        promotion.setQuantity(
                request.getQuantity() != null ? request.getQuantity() : 0);

        Promotion savedPromotion = promotionRepository.saveAndFlush(promotion); // Ép lưu để sinh ID ngay lập tức
        
        savePromotionMapping(savedPromotion, request);

        return mapToResponse(savedPromotion);
    }

    // lấy ra tất cả
    @Transactional(readOnly = true)
    public List<PromotionResponse> getAll() {

        return promotionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // lấy ra theo id
    @Transactional(readOnly = true)
    public PromotionResponse getById(int id) {

        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow();

        return mapToResponse(promotion);
    }

    // chỉnh sửa
    @Transactional
    public PromotionResponse update(
            int id,
            PromotionRequest request) {

        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi"));

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            Double discountVal = request.getDiscountValue() != null ? request.getDiscountValue().doubleValue() : null;
            promotion.setName(
                    generatePromotionName(request.getType(), discountVal, request.getDiscountType()));
        } else {
            Optional<Promotion> existingPromo = promotionRepository.findByName(request.getName());
            if (existingPromo.isPresent() && existingPromo.get().getId() != id) {
                throw new RuntimeException("Tên chương trình khuyến mãi đã tồn tại. Vui lòng chọn tên khác!");
            }
            promotion.setName(request.getName());
        }

        promotion.setDescription(request.getDescription());

        promotion.setType(request.getType());

        promotion.setDiscountType(
                request.getDiscountType());

        promotion.setDiscountValue(
                request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO);

        promotion.setMinOrderValue(
                request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO);

        promotion.setMaxDiscount(
                request.getMaxDiscountValue() != null ? request.getMaxDiscountValue() : null);

        promotion.setIsActive(
                request.getIsActive() != null ? request.getIsActive() : true);

        promotion.setStartDate(
                request.getStartDate());

        promotion.setEndDate(
                request.getEndDate());

        promotion.setQuantity(
                request.getQuantity() != null ? request.getQuantity() : 0);

        Promotion savedPromotion = promotionRepository.saveAndFlush(promotion); // Ép lưu để sinh ID ngay lập tức
        
        promotionCategoryRepository.deleteByPromotionId(savedPromotion.getId());
        promotionCategoryRepository.flush(); // Bắt buộc Flush để thực thi lệnh XÓA ngay lập tức
        promotionProductRepository.deleteByPromotionId(savedPromotion.getId());
        promotionProductRepository.flush(); // Bắt buộc Flush để thực thi lệnh XÓA ngay lập tức
        
        savePromotionMapping(savedPromotion, request);

        return mapToResponse(savedPromotion);
    }

    // xóa
    @Transactional
    public void delete(int id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi để xóa"));
        
        promotionCategoryRepository.deleteByPromotionId(promotion.getId());
        promotionProductRepository.deleteByPromotionId(promotion.getId());
        
        promotionRepository.delete(promotion);
    }

    private void savePromotionMapping(Promotion savedPromotion, PromotionRequest request) {
        System.out.println("=== DEBUG INSERT MAPPING ===");
        System.out.println("Loại Khuyến Mãi (Type): " + request.getType());

        // Nếu là SHOP hoặc SHIPPING thì không cần mapping, bỏ qua luôn
        if (request.getType() == PromotionType.SHOP || request.getType() == PromotionType.SHIPPING) {
            System.out.println("=> Loại khuyến mãi không cần mapping với đối tượng cụ thể.");
            return;
        }

        if (request.getTargetId() == null) {
            System.out.println("=> Cảnh báo: Chưa chọn mục tiêu, bỏ qua mapping để tránh văng lỗi Frontend.");
            return;
        }

        System.out.println("Mã áp dụng (Target ID): " + request.getTargetId());

        if (request.getType() == PromotionType.CATEGORY) {
            Categories category = new Categories();
            category.setId(request.getTargetId());
            
            PromotionCategory promoCat = PromotionCategory.builder()
                    .promotion(savedPromotion).category(category).build();
            promotionCategoryRepository.save(Objects.requireNonNull(promoCat));
            System.out.println("=> Đã chèn thành công vào bảng PromotionCategory!");
            
        } else if (request.getType() == PromotionType.PRODUCT) {
            Products product = new Products();
            product.setId(request.getTargetId());
            
            PromotionProduct promoProd = PromotionProduct.builder()
                    .promotion(savedPromotion).product(product).build();
            promotionProductRepository.save(Objects.requireNonNull(promoProd));
            System.out.println("=> Đã chèn thành công vào bảng PromotionProduct!");
        }
    }
}
