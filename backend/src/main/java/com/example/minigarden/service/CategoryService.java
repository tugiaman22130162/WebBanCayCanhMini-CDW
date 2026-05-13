package com.example.minigarden.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.minigarden.dto.CategoryRespone;
import com.example.minigarden.entity.Categories;
import com.example.minigarden.repository.CategoryRepository;
import com.example.minigarden.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Categories> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Categories> getCategoryById(Integer id) {
        return categoryRepository.findById(id);
    }

    //thêm danh mục
    public Categories createCategory(Categories category, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadListingImage(image);
            category.setImage_url(uploadedImage.secureUrl());
        }
        return categoryRepository.save(category);
    }

    //cập nhật danh mục
    public Optional<Categories> updateCategory(Integer id, Categories categoryDetails, MultipartFile image) {
        return categoryRepository.findById(id).map(category -> {
            category.setName(categoryDetails.getName());
            category.setDescription(categoryDetails.getDescription());
            
            if (image != null && !image.isEmpty()) {
                CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadListingImage(image);
                category.setImage_url(uploadedImage.secureUrl());
            } else if (categoryDetails.getImage_url() != null) {
                // Giữ nguyên ảnh cũ nếu Frontend không truyền file mới lên
                category.setImage_url(categoryDetails.getImage_url());
            }
            // Bỏ qua setSlug() vì @PreUpdate ở Entity đã tự động lo phần này
            return categoryRepository.save(category);
        });
    }

    //xóa danh mục
    public boolean deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) return false;
        categoryRepository.deleteById(id);
        return true;
    }

    // Export danh sách danh mục ra file Excel
    public ByteArrayInputStream exportCategoriesToExcel() throws IOException {
        List<Categories> categories = categoryRepository.findAll();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("DANH SÁCH DANH MỤC");

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
            titleCell.setCellValue("DANH SÁCH DANH MỤC");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 3));

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
            String[] columns = {"ID", "Tên Danh Mục", "Mô Tả", "Link Ảnh"};
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
            for (Categories category : categories) {
                Row row = sheet.createRow(rowIdx++);
                
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(category.getId() != null ? category.getId() : 0);
                cell0.setCellStyle(dataCellStyle);

                Cell cell1 = row.createCell(1);
                cell1.setCellValue(category.getName() != null ? category.getName() : "");
                cell1.setCellStyle(dataCellStyle);

                Cell cell2 = row.createCell(2);
                String description = category.getDescription() != null ? category.getDescription() : "";
                if (description.length() > 32767) {
                    description = description.substring(0, 32767);
                }
                cell2.setCellValue(description);
                cell2.setCellStyle(dataCellStyle);

                Cell cell3 = row.createCell(3);
                String imageUrl = category.getImage_url() != null ? category.getImage_url() : "";
                // Nếu ảnh được lưu dưới dạng Base64 sẽ rất dài, vượt quá giới hạn của Excel
                if (imageUrl.length() > 32767) {
                    imageUrl = "[Dữ liệu ảnh Base64 quá dài]";
                }
                cell3.setCellValue(imageUrl);
                cell3.setCellStyle(dataCellStyle);
            }

            // Tự động căn chỉnh độ rộng cột
            // Đã thay autoSizeColumn bằng setColumnWidth để tránh lỗi 500 do thiếu Font hệ thống
            for (int i = 0; i < columns.length; i++) {
                sheet.setColumnWidth(i, 6000); // 6000 tương đương khoảng 23 ký tự
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // Import danh sách danh mục từ file Excel
    public void importCategoriesFromExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Categories> categories = new ArrayList<>();
            
            // Bỏ qua dòng Tiêu đề lớn (0) và Header (1), đọc từ dòng 2
            for (int i = 2; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Categories category = new Categories();
                
                // Đọc cột 1: Tên danh mục (Cột 0 là ID thường tự tăng nên bỏ qua)
                Cell nameCell = row.getCell(1);
                if (nameCell != null && nameCell.getCellType() == CellType.STRING) {
                    category.setName(nameCell.getStringCellValue());
                }

                // Đọc cột 2: Mô tả
                Cell descCell = row.getCell(2);
                if (descCell != null && descCell.getCellType() == CellType.STRING) {
                    category.setDescription(descCell.getStringCellValue());
                }

                // Đọc cột 3: Link Ảnh
                Cell imgCell = row.getCell(3);
                if (imgCell != null && imgCell.getCellType() == CellType.STRING) {
                    category.setImage_url(imgCell.getStringCellValue());
                }
                
                // Lưu ý: Chỉ add nếu tên danh mục không rỗng
                if (category.getName() != null && !category.getName().trim().isEmpty()) {
                    categories.add(category);
                }
            }
            categoryRepository.saveAll(categories);
        }
    }

    // Thống kê số lượng danh mục và sản phẩm theo danh mục
    public CategoryRespone getStatistics() {

        long totalCategories = categoryRepository.count();

        long totalProducts = productRepository.count();

        int activeProducts = productRepository.countByStatusTrue();

        return new CategoryRespone(
                (int) totalCategories,
                (int) totalProducts,
                (int) activeProducts
        );
    }
    
}
