package com.example.minigarden.controller;

import com.example.minigarden.service.PromotionService;
import com.example.minigarden.repository.PromotionCategoryRepository;
import com.example.minigarden.repository.PromotionProductRepository;
import com.example.minigarden.dto.PromotionCheckRequest;
import com.example.minigarden.dto.PromotionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.core.io.InputStreamResource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PromotionController {

    private final PromotionService promotionService;
    private final PromotionCategoryRepository promotionCategoryRepository;
    private final PromotionProductRepository promotionProductRepository;

    @GetMapping
    public ResponseEntity<?> getPromotions(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(required = false, defaultValue = "all") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(promotionService.searchPromotions(keyword, timeRange, startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody PromotionRequest payload) {
        promotionService.create(payload);
        return ResponseEntity.ok(Map.of("message", "Thêm thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Integer id, @RequestBody PromotionRequest payload) {
        promotionService.update(id, payload);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Integer id) {
        promotionService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportExcel() throws IOException {
        ByteArrayInputStream in = promotionService.exportPromotionsToExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Danh_Sach_Khuyen_Mai.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(Objects.requireNonNull(in)));
    }

    @PostMapping("/import")
    public ResponseEntity<?> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            promotionService.importPromotionsFromExcel(file);
               return ResponseEntity.ok(Map.of("message", "Nhập dữ liệu từ file Excel thành công!"));
        } catch (IllegalArgumentException e) {
            // Lỗi validation cụ thể từ service (ví dụ: sai định dạng, tên trùng lặp)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (DataIntegrityViolationException e) {
            //check tên bị trùng (nếu service không check trước)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Lỗi: Tên mã khuyến mãi trong file đã tồn tại trong hệ thống."));
        } catch (Exception e) {
            // Lỗi không xác định xác
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi không xác định khi nhập file: " + e.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/applicable")
    public ResponseEntity<?> getApplicablePromotions(@RequestBody PromotionCheckRequest payload) {
        List<?> allPromos = promotionService.getAll();

        Double totalNum = payload.getTotalPrice();
        if (totalNum == null) {
            totalNum = payload.getSubtotal();
        }
        double subtotal = totalNum != null ? totalNum : 0.0;

        List<Map<String, Object>> cartItems = payload.getCartItems();
        if (cartItems == null) cartItems = new ArrayList<>();

        List<Map<String, Object>> result = new ArrayList<>();

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        List<Map<String, Object>> promosMap = mapper.convertValue(allPromos, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});

        LocalDateTime now = LocalDateTime.now();

        for (Map<String, Object> p : promosMap) {
            Boolean isActive = (Boolean) p.get("isActive");
            if (isActive != null && !isActive) continue; // Bỏ qua mã đã vô hiệu hóa

            Object endDateObj = p.get("endDate");
            if (endDateObj != null) {
                try {
                    LocalDateTime endDate;
                    if (endDateObj instanceof String) {
                        endDate = LocalDateTime.parse((String) endDateObj);
                    } else if (endDateObj instanceof List) {
                        List<Integer> parts = (List<Integer>) endDateObj;
                        endDate = LocalDateTime.of(parts.get(0), parts.get(1), parts.get(2), parts.get(3), parts.get(4), parts.size() > 5 ? parts.get(5) : 0);
                    } else {
                        endDate = mapper.convertValue(endDateObj, LocalDateTime.class);
                    }
                    if (endDate.isBefore(now)) continue; // Bỏ qua mã đã hết hạn
                } catch (Exception e) {
                    // Bỏ qua lỗi parse ngày
                }
            }

            String type = (String) p.get("type");
            Integer promoId = (Integer) p.get("id");
            Number targetIdNum = (Number) p.get("targetId");
            Integer promoTargetId = targetIdNum != null ? targetIdNum.intValue() : null;

            Number minOrderValueNum = (Number) p.get("minOrderValue");
            double minOrderValue = minOrderValueNum != null ? minOrderValueNum.doubleValue() : 0.0;

            String invalidReason = null;
            double checkSubtotal = subtotal; 

            if ("PRODUCT".equals(type)) {
                boolean hasProduct = false;
                Integer matchedTargetId = null;
                double applicableSubtotal = 0.0;
                for (Map<String, Object> item : cartItems) {
                    Number pId = (Number) item.get("productId");
                    if (pId == null) pId = (Number) item.get("id"); // Fallback lấy id từ item
                    if (pId == null) {
                        Map<String, Object> prodObj = (Map<String, Object>) item.get("product");
                        if (prodObj != null) {
                            pId = (Number) prodObj.get("id");
                        }
                    }
                    if (pId != null && ((promoTargetId != null && pId.intValue() == promoTargetId) || promotionProductRepository.existsByPromotionIdAndProductId(promoId, pId.intValue()))) {
                        hasProduct = true;
                        if (matchedTargetId == null) matchedTargetId = pId.intValue();
                        Number priceNum = (Number) item.get("price");
                        Number qtyNum = (Number) item.get("quantity");
                        if (priceNum != null && qtyNum != null) {
                            applicableSubtotal += priceNum.doubleValue() * qtyNum.intValue();
                        }
                    }
                }
                if (!hasProduct) {
                    invalidReason = "Chỉ áp dụng cho sản phẩm được chỉ định";
                }
                checkSubtotal = applicableSubtotal; // Lấy tổng tiền riêng của sản phẩm này để so sánh
                if (matchedTargetId != null) p.put("targetId", matchedTargetId); 
            } else if ("CATEGORY".equals(type)) {
                boolean hasCategory = false;
                Integer matchedTargetId = null;
                double applicableSubtotal = 0.0;
                for (Map<String, Object> item : cartItems) {
                    Number cId = (Number) item.get("categoryId");
                    if (cId == null) {
                        Map<String, Object> catObj = (Map<String, Object>) item.get("category");
                        if (catObj != null) cId = (Number) catObj.get("id");
                    }
                    if (cId == null) {
                        Map<String, Object> prodObj = (Map<String, Object>) item.get("product");
                        if (prodObj != null) {
                            cId = (Number) prodObj.get("categoryId");
                            if (cId == null) {
                                Map<String, Object> prodCat = (Map<String, Object>) prodObj.get("category");
                                if (prodCat != null) cId = (Number) prodCat.get("id");
                            }
                        }
                    }

                    if (cId != null && ((promoTargetId != null && cId.intValue() == promoTargetId) || promotionCategoryRepository.existsByPromotionIdAndCategoryId(promoId, cId.intValue()))) {
                        hasCategory = true;
                        if (matchedTargetId == null) matchedTargetId = cId.intValue();
                        Number priceNum = (Number) item.get("price");
                        Number qtyNum = (Number) item.get("quantity");
                        if (priceNum != null && qtyNum != null) {
                            applicableSubtotal += priceNum.doubleValue() * qtyNum.intValue();
                        }
                    }
                }
                if (!hasCategory) {
                    invalidReason = "Chỉ áp dụng cho danh mục được chỉ định";
                }
                checkSubtotal = applicableSubtotal; // Lấy tổng tiền riêng của danh mục này để so sánh
                if (matchedTargetId != null) p.put("targetId", matchedTargetId);
            }

            if (invalidReason == null && minOrderValue > 0 && checkSubtotal < minOrderValue) {
                double missing = minOrderValue - checkSubtotal;
                String missingStr = String.format("%,.0f", missing).replace(",", ".") + "đ";
                String minStr = String.format("%,.0f", minOrderValue).replace(",", ".") + "đ";

                invalidReason = "Đơn tối thiểu " + minStr + " (Mua thêm " + missingStr + ")";
            }

            p.put("invalidReason", invalidReason);
            p.put("isDisabled", invalidReason != null);
            result.add(p);
        }

        return ResponseEntity.ok(result);
    }
}