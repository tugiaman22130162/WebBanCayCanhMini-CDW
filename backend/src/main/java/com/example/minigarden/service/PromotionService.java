package com.example.minigarden.service;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import java.time.format.DateTimeFormatter;
import java.util.Set;

@Service
public class PromotionService {
    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PromotionCategoryRepository promotionCategoryRepository;

    @Autowired
    private PromotionProductRepository promotionProductRepository;

    // map json từ DB sang Response trả về cho FE
    private PromotionResponse mapToResponse(Promotion promotion) {

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
    // rule là loại khuyến mãi + giá trị giảm (nếu có) + 4 ký tự ngẫu nhiên
    private String generatePromotionName(PromotionType type, Double value, DiscountType discountType) {
        StringBuilder sb = new StringBuilder();

        // có 4 loại khuyến mãi: SHOP( là SALE), SHIPPING (là SHIP), PRODUCT (là PROD),
        // CATEGORY (là CATE)
        sb.append(type == null ? "SALE" : switch (type) {
            case SHIPPING -> "SHIP";
            case PRODUCT -> "PROD";
            case CATEGORY -> "CATE";
            default -> "SALE";
        });

        // có 3 loại giảm giá: FREE (là FREE), PERCENTAGE (là số% giảm), FIXED_AMOUNT
        // (là số tiền giảm)
        // nếu là FREE thì là FREE, PERCENTAGE thì là số% giảm và P, FIXED_AMOUNT thì là
        // số tiền giảm (nếu >=1000 thì đổi sang K)
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

        // Thêm 5 ký tự ngẫu nhiên (chữ và số, loại bỏ O, 0, I, 1) để mã đẹp, dễ đọc và
        // cực kỳ khó trùng lặp
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

    // Export danh sách khuyến mãi ra file Excel
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportPromotionsToExcel() throws IOException {
        List<Promotion> promotions = promotionRepository.findAll();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("DANH SÁCH KHUYẾN MÃI");

            // Style cho Tiêu đề lớn (Title)
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 18);
            titleFont.setColor(IndexedColors.DARK_GREEN.getIndex());

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            // Tạo Title Row ở dòng 0 và gộp 4 cột lại cho đẹp
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("DANH SÁCH KHUYẾN MÃI");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 11));

            // Style cho Header (Tiêu đề cột)
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex()); // Màu xanh chủ đạo
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setBorderBottom(BorderStyle.THIN);
            headerCellStyle.setBorderTop(BorderStyle.THIN);
            headerCellStyle.setBorderRight(BorderStyle.THIN);
            headerCellStyle.setBorderLeft(BorderStyle.THIN);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Tạo Header Row (Bị dời xuống dòng 1)
            Row headerRow = sheet.createRow(1);
            String[] columns = { "ID", "Mã Khuyến Mãi", "Mô Tả", "Loại KM", "Áp Dụng Cho", "Loại Giảm Giá", "Mức Giảm",
                    "Đơn Tối Thiểu", "Trạng Thái", "Ngày Bắt Đầu", "Ngày Kết Thúc", "Số Lượng" };
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Style cho Data
            CellStyle dataCellStyle = workbook.createCellStyle();
            dataCellStyle.setBorderBottom(BorderStyle.DASHED);
            dataCellStyle.setBorderTop(BorderStyle.DASHED);
            dataCellStyle.setBorderRight(BorderStyle.DASHED);
            dataCellStyle.setBorderLeft(BorderStyle.DASHED);

            // Đổ dữ liệu vào Excel (Bắt đầu từ dòng 2)
            int rowIdx = 2;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            for (Promotion promotion : promotions) {
                Row row = sheet.createRow(rowIdx++);

                // Xác định đối tượng áp dụng
                String targetName = "Toàn cửa hàng / Vận chuyển";
                if (promotion.getType() == PromotionType.CATEGORY) {
                    List<PromotionCategory> pcList = promotionCategoryRepository.findByPromotionId(promotion.getId());
                    if (pcList != null && !pcList.isEmpty() && pcList.get(0).getCategory() != null) {
                        targetName = "Danh mục: " + pcList.get(0).getCategory().getName();
                    }
                } else if (promotion.getType() == PromotionType.PRODUCT) {
                    List<PromotionProduct> ppList = promotionProductRepository.findByPromotionId(promotion.getId());
                    if (ppList != null && !ppList.isEmpty() && ppList.get(0).getProduct() != null) {
                        targetName = "Sản phẩm: " + ppList.get(0).getProduct().getName();
                    }
                }

                int colIdx = 0;
                Cell cell0 = row.createCell(colIdx++);
                cell0.setCellValue(promotion.getId());
                cell0.setCellStyle(dataCellStyle);

                Cell cell1 = row.createCell(colIdx++);
                cell1.setCellValue(promotion.getName() != null ? promotion.getName() : "");
                cell1.setCellStyle(dataCellStyle);

                Cell cell2 = row.createCell(colIdx++);
                cell2.setCellValue(promotion.getDescription() != null ? promotion.getDescription() : "");
                cell2.setCellStyle(dataCellStyle);

                Cell cell3 = row.createCell(colIdx++);
                cell3.setCellValue(promotion.getType() != null ? promotion.getType().name() : "");
                cell3.setCellStyle(dataCellStyle);

                Cell cell4 = row.createCell(colIdx++);
                cell4.setCellValue(targetName);
                cell4.setCellStyle(dataCellStyle);

                Cell cell5 = row.createCell(colIdx++);
                cell5.setCellValue(promotion.getDiscountType() != null ? promotion.getDiscountType().name() : "");
                cell5.setCellStyle(dataCellStyle);

                Cell cell6 = row.createCell(colIdx++);
                cell6.setCellValue(
                        promotion.getDiscountValue() != null ? promotion.getDiscountValue().toString() : "0");
                cell6.setCellStyle(dataCellStyle);

                Cell cell7 = row.createCell(colIdx++);
                cell7.setCellValue(
                        promotion.getMinOrderValue() != null ? promotion.getMinOrderValue().toString() : "0");
                cell7.setCellStyle(dataCellStyle);

                Cell cell8 = row.createCell(colIdx++);
                cell8.setCellValue(Boolean.TRUE.equals(promotion.getIsActive()) ? "Hoạt động" : "Ngừng HĐ");
                cell8.setCellStyle(dataCellStyle);

                Cell cell9 = row.createCell(colIdx++);
                cell9.setCellValue(promotion.getStartDate() != null ? promotion.getStartDate().format(formatter) : "");
                cell9.setCellStyle(dataCellStyle);

                Cell cell10 = row.createCell(colIdx++);
                cell10.setCellValue(promotion.getEndDate() != null ? promotion.getEndDate().format(formatter) : "");
                cell10.setCellStyle(dataCellStyle);

                Cell cell11 = row.createCell(colIdx++);
                Object qty = promotion.getQuantity();
                cell11.setCellValue(qty != null ? ((Number) qty).doubleValue() : 0);
                cell11.setCellStyle(dataCellStyle);
            }

            // Tự động căn chỉnh độ rộng cột
            for (int i = 0; i < columns.length; i++) {
                sheet.setColumnWidth(i, 6000); // 6000 tương đương khoảng 23 ký tự
            }
            sheet.setColumnWidth(2, 8000); // Cho cột mô tả rộng hơn
            sheet.setColumnWidth(4, 8000); // Cho cột đối tượng áp dụng rộng hơn
            sheet.setColumnWidth(9, 5000); // Cột ngày tháng
            sheet.setColumnWidth(10, 5000);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // Import danh sách Khuyến mãi từ file Excel
    @Transactional
    public void importPromotionsFromExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Promotion> promotions = new ArrayList<>();
            Set<String> namesInFile = new HashSet<>();

            // Đọc từ dòng 2 (bỏ qua Title và Header)
            for (int i = 2; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                Promotion promotion = new Promotion();

                // Cột 1: Mã Khuyến Mãi (Tên)
                Cell nameCell = row.getCell(1);
                String name = "";
                if (nameCell != null) {
                    try {
                        name = nameCell.getStringCellValue().trim();
                    } catch (Exception e) {
                        try {
                            name = String.valueOf((int) nameCell.getNumericCellValue());
                        } catch (Exception ex) {
                        }
                    }
                }
                if (name.isEmpty())
                    continue; // Bỏ qua nếu rỗng

                if (namesInFile.contains(name)) {
                    throw new IllegalArgumentException(
                            "Lỗi: Mã khuyến mãi '" + name + "' bị trùng lặp bên trong file Excel .");
                }
                if (promotionRepository.findByName(name).isPresent()) {
                    throw new IllegalArgumentException("Lỗi: Mã khuyến mãi '" + name + "' đã tồn tại trong hệ thống.");
                }
                namesInFile.add(name);
                promotion.setName(name);

                // Cột 2: Mô tả
                Cell descCell = row.getCell(2);
                if (descCell != null) {
                    try {
                        promotion.setDescription(descCell.getStringCellValue());
                    } catch (Exception ignored) {
                    }
                }

                // Cột 3: Loại Khuyến Mãi
                Cell typeCell = row.getCell(3);
                if (typeCell != null) {
                    try {
                        promotion.setType(PromotionType.valueOf(typeCell.getStringCellValue().trim().toUpperCase()));
                    } catch (Exception e) {
                        promotion.setType(PromotionType.SHOP);
                    }
                }

                // Cột 5: Loại Giảm Giá
                Cell discTypeCell = row.getCell(5);
                if (discTypeCell != null) {
                    try {
                        promotion.setDiscountType(
                                DiscountType.valueOf(discTypeCell.getStringCellValue().trim().toUpperCase()));
                    } catch (Exception e) {
                        promotion.setDiscountType(DiscountType.FIXED_AMOUNT);
                    }
                }

                // Cột 6: Mức giảm
                Cell discValCell = row.getCell(6);
                if (discValCell != null) {
                    try {
                        promotion.setDiscountValue(BigDecimal.valueOf(discValCell.getNumericCellValue()));
                    } catch (Exception e) {
                        try {
                            promotion.setDiscountValue(new BigDecimal(discValCell.getStringCellValue().trim()));
                        } catch (Exception ex) {
                            promotion.setDiscountValue(BigDecimal.ZERO);
                        }
                    }
                } else
                    promotion.setDiscountValue(BigDecimal.ZERO);

                // Cột 7: Đơn tối thiểu
                Cell minOrderCell = row.getCell(7);
                if (minOrderCell != null) {
                    try {
                        promotion.setMinOrderValue(BigDecimal.valueOf(minOrderCell.getNumericCellValue()));
                    } catch (Exception e) {
                        try {
                            promotion.setMinOrderValue(new BigDecimal(minOrderCell.getStringCellValue().trim()));
                        } catch (Exception ex) {
                            promotion.setMinOrderValue(BigDecimal.ZERO);
                        }
                    }
                } else
                    promotion.setMinOrderValue(BigDecimal.ZERO);

                // Cột 8: Trạng thái
                Cell statusCell = row.getCell(8);
                if (statusCell != null) {
                    try {
                        promotion.setIsActive("Hoạt động".equalsIgnoreCase(statusCell.getStringCellValue().trim()));
                    } catch (Exception e) {
                        promotion.setIsActive(true);
                    }
                } else
                    promotion.setIsActive(true);

                // Cột 9: Ngày Bắt Đầu
                Cell startDateCell = row.getCell(9);
                if (startDateCell != null) {
                    try {
                        java.util.Date date = startDateCell.getDateCellValue();
                        if (date != null)
                            promotion.setStartDate(
                                    date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
                    } catch (Exception e) {
                        try {
                            promotion.setStartDate(
                                    java.time.LocalDateTime.parse(startDateCell.getStringCellValue().trim(),
                                            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                        } catch (Exception ignored) {
                        }
                    }
                }

                // Cột 10: Ngày Kết Thúc
                Cell endDateCell = row.getCell(10);
                if (endDateCell != null) {
                    try {
                        java.util.Date date = endDateCell.getDateCellValue();
                        if (date != null)
                            promotion.setEndDate(
                                    date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
                    } catch (Exception e) {
                        try {
                            promotion.setEndDate(java.time.LocalDateTime.parse(endDateCell.getStringCellValue().trim(),
                                    DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                        } catch (Exception ignored) {
                        }
                    }
                }

                // Cột 11: Số lượng
                Cell qtyCell = row.getCell(11);
                if (qtyCell != null) {
                    try {
                        promotion.setQuantity((int) qtyCell.getNumericCellValue());
                    } catch (Exception e) {
                        try {
                            promotion.setQuantity(Integer.parseInt(qtyCell.getStringCellValue().trim()));
                        } catch (Exception ex) {
                            promotion.setQuantity(0);
                        }
                    }
                } else
                    promotion.setQuantity(0);

                promotion.setCreatedAt(java.time.LocalDateTime.now());
                promotions.add(promotion);
            }

            promotionRepository.saveAll(promotions);
        }
    }
}
