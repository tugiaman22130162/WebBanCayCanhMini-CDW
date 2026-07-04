package com.example.minigarden.service;

import com.example.minigarden.repository.OrderRepository;
import com.example.minigarden.repository.ProductRepository;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.example.minigarden.entity.OrderStatus;
import com.example.minigarden.entity.Order;
import com.example.minigarden.entity.Products;
import com.example.minigarden.entity.User;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getDashboard(String timeRange, LocalDate customStartDate, LocalDate customEndDate) {
        LocalDateTime startDate = null;
        LocalDateTime endDate = LocalDateTime.now();

        if (timeRange != null && !timeRange.equals("all")) {
            switch (timeRange) {
                case "7days": startDate = endDate.minusDays(7); break;
                case "30days": startDate = endDate.minusDays(30); break;
                case "6months": startDate = endDate.minusMonths(6); break;
                case "1year": startDate = endDate.minusYears(1); break;
                case "quarter":
                    int currentQuarter = (endDate.getMonthValue() - 1) / 3 + 1;
                    startDate = LocalDateTime.of(endDate.getYear(), (currentQuarter - 1) * 3 + 1, 1, 0, 0);
                    break;
                case "custom":
                    if (customStartDate != null && customEndDate != null) {
                        startDate = customStartDate.atStartOfDay();
                        endDate = customEndDate.atTime(LocalTime.MAX);
                    }
                    break;
            }
        }

        long totalOrders;
        Double totalRevenue;
        long pendingOrders;
        long totalUsers;

        if (startDate != null) {
            totalOrders = orderRepository.countByCreatedAtBetween(startDate, endDate);
            Double revenue = orderRepository.getTotalRevenueByCreatedAtBetween(startDate, endDate);
            totalRevenue = revenue != null ? revenue : 0.0;
            pendingOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.PENDING, startDate, endDate);
            totalUsers = userRepository.countByCreatedAtBetween(startDate, endDate);
        } else {
            totalOrders = orderRepository.count();
            totalRevenue = orderRepository.getTotalRevenue() != null ? orderRepository.getTotalRevenue() : 0.0;
            pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
            totalUsers = userRepository.count();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalProducts", (int) productRepository.count());
        response.put("totalOrders", (int) totalOrders);
        response.put("totalUsers", (int) totalUsers);
        response.put("totalRevenue", totalRevenue);
        response.put("pendingOrders", (int) pendingOrders);

        // 1. Thống kê giao dịch
        int successTx;
        int failedTx;
        if (startDate != null) {
            successTx = (int) orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.DELIVERED, startDate, endDate);
            failedTx = (int) orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.CANCELLED, startDate, endDate);
        } else {
            successTx = orderRepository.countByStatus(OrderStatus.DELIVERED);
            failedTx = orderRepository.countByStatus(OrderStatus.CANCELLED);
        }
        int totalTx = successTx + failedTx;
        Map<String, Integer> transactionStats = new HashMap<>();
        transactionStats.put("success", successTx);
        transactionStats.put("failed", failedTx);
        transactionStats.put("total", totalTx);
        response.put("transactionStats", transactionStats);

        // 2. Đơn hàng gần đây
        List<Order> recentOrdersList;
        if (startDate != null) {
            recentOrdersList = orderRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate)
                    .stream().limit(10).collect(Collectors.toList());
        } else {
            recentOrdersList = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                    .stream().limit(10).collect(Collectors.toList());
        }
        
        List<Map<String, Object>> recentOrders = recentOrdersList.stream().map(o -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("customer", o.getReceiverName() != null ? o.getReceiverName() : "Khách hàng");
            map.put("date", o.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            map.put("total", o.getTotalPrice());
            map.put("status", o.getStatus().name());
            return map;
        }).collect(Collectors.toList());
        response.put("recentOrders", recentOrders);

        // 3. Thống kê sản phẩm theo Danh mục
        List<Products> allProducts = productRepository.findAll();
        Map<String, List<Products>> productsByCategory = allProducts.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(p -> p.getCategory().getName()));
        
        String[] defaultColors = {"bg-gradient-to-r from-emerald-400 to-emerald-600", "bg-gradient-to-r from-cyan-400 to-blue-500", "bg-gradient-to-r from-amber-400 to-orange-500", "bg-gradient-to-r from-purple-400 to-purple-600"};
        int colorIdx = 0;
        
        List<Map<String, Object>> categoryStats = new ArrayList<>();
        for (Map.Entry<String, List<Products>> entry : productsByCategory.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", entry.getKey());
            map.put("count", entry.getValue().size());
            map.put("percentage", allProducts.isEmpty() ? 0 : Math.round((double) entry.getValue().size() / allProducts.size() * 100));
            map.put("image", entry.getValue().get(0).getCategory().getImage_url());
            map.put("color", defaultColors[colorIdx % defaultColors.length]);
            categoryStats.add(map);
            colorIdx++;
        }
        categoryStats.sort((a, b) -> Integer.compare((int) b.get("count"), (int) a.get("count")));
        response.put("categoryStats", categoryStats);

        // 4. Biểu đồ Tăng trưởng Doanh thu & Người dùng (Lấy 6 tháng gần nhất)
        List<Map<String, Object>> revenueGrowth = new ArrayList<>();
        List<Map<String, Object>> userGrowth = new ArrayList<>();
        
        if (startDate == null) {
            YearMonth currentMonth = YearMonth.from(endDate);
            for (int i = 5; i >= 0; i--) {
                YearMonth targetMonth = currentMonth.minusMonths(i);
                LocalDateTime startOfM = targetMonth.atDay(1).atStartOfDay();
                LocalDateTime endOfM = targetMonth.atEndOfMonth().atTime(LocalTime.MAX);
                
                Double rev = orderRepository.getTotalRevenueByCreatedAtBetween(startOfM, endOfM);
                Map<String, Object> revMap = new HashMap<>();
                revMap.put("label", "T" + targetMonth.getMonthValue());
                revMap.put("value", rev != null ? rev : 0);
                revenueGrowth.add(revMap);
                
                List<User> newUsers = userRepository.findByCreatedAtBetween(startOfM, endOfM);
                Map<String, Object> usrMap = new HashMap<>();
                usrMap.put("label", "T" + targetMonth.getMonthValue());
                usrMap.put("value", newUsers.size()); 
                usrMap.put("users", newUsers.stream().map(u -> {
                    Map<String, Object> userDetail = new HashMap<>();
                    userDetail.put("id", u.getId());
                    userDetail.put("fullName", u.getFullName());
                    userDetail.put("email", u.getEmail());
                    return userDetail;
                }).collect(Collectors.toList()));
                userGrowth.add(usrMap);
            }
        } else {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
            if (daysBetween <= 31) {
                for (int i = 0; i <= daysBetween; i++) {
                    LocalDateTime startOfDay = startDate.plusDays(i).toLocalDate().atStartOfDay();
                    LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
                    if (startOfDay.isAfter(endDate)) break;
                    
                    Double rev = orderRepository.getTotalRevenueByCreatedAtBetween(startOfDay, endOfDay);
                    Map<String, Object> revMap = new HashMap<>();
                    revMap.put("label", startOfDay.format(DateTimeFormatter.ofPattern("dd/MM")));
                    revMap.put("value", rev != null ? rev : 0);
                    revenueGrowth.add(revMap);
                    
                    List<User> newUsers = userRepository.findByCreatedAtBetween(startOfDay, endOfDay);
                    Map<String, Object> usrMap = new HashMap<>();
                    usrMap.put("label", startOfDay.format(DateTimeFormatter.ofPattern("dd/MM")));
                    usrMap.put("value", newUsers.size()); 
                    usrMap.put("users", newUsers.stream().map(u -> {
                        Map<String, Object> userDetail = new HashMap<>();
                        userDetail.put("id", u.getId());
                        userDetail.put("fullName", u.getFullName());
                        userDetail.put("email", u.getEmail());
                        return userDetail;
                    }).collect(Collectors.toList()));
                    userGrowth.add(usrMap);
                }
            } else {
                YearMonth startMonth = YearMonth.from(startDate);
                YearMonth endMonth = YearMonth.from(endDate);
                
                YearMonth currentLoopMonth = startMonth;
                while (!currentLoopMonth.isAfter(endMonth)) {
                    LocalDateTime startOfM = currentLoopMonth.atDay(1).atStartOfDay();
                    LocalDateTime endOfM = currentLoopMonth.atEndOfMonth().atTime(LocalTime.MAX);
                    
                    // Điều chỉnh ngày bắt đầu và kết thúc cho tháng đầu tiên và cuối cùng
                    if (currentLoopMonth.equals(startMonth)) startOfM = startDate;
                    // Luôn đảm bảo endOfM không vượt quá endDate tổng thể
                    if (endOfM.isAfter(endDate)) endOfM = endDate;

                    Double rev = orderRepository.getTotalRevenueByCreatedAtBetween(startOfM, endOfM);
                    Map<String, Object> revMap = new HashMap<>();
                    revMap.put("label", "T" + currentLoopMonth.getMonthValue());
                    revMap.put("value", rev != null ? rev : 0);
                    revenueGrowth.add(revMap);
                    
                    List<User> newUsers = userRepository.findByCreatedAtBetween(startOfM, endOfM);
                    Map<String, Object> usrMap = new HashMap<>();
                    usrMap.put("label", "T" + currentLoopMonth.getMonthValue());
                    usrMap.put("value", newUsers.size()); 
                    usrMap.put("users", newUsers.stream().map(u -> {
                        Map<String, Object> userDetail = new HashMap<>();
                        userDetail.put("id", u.getId());
                        userDetail.put("fullName", u.getFullName());
                        userDetail.put("email", u.getEmail());
                        return userDetail;
                    }).collect(Collectors.toList()));
                    userGrowth.add(usrMap);
                    currentLoopMonth = currentLoopMonth.plusMonths(1);
                }
            }
        }
        response.put("revenueGrowthData", revenueGrowth);
        response.put("userGrowthData", userGrowth);

        return response;
    }
    
    @SuppressWarnings("unchecked")
    public ByteArrayInputStream exportDashboardToExcel(String timeRange, LocalDate customStartDate, LocalDate customEndDate) throws IOException {
        Map<String, Object> stats = getDashboard(timeRange, customStartDate, customEndDate);
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.DASHED);
            dataStyle.setBorderTop(BorderStyle.DASHED);
            dataStyle.setBorderRight(BorderStyle.DASHED);
            dataStyle.setBorderLeft(BorderStyle.DASHED);

            // Style cho Tiêu đề & Thông tin phụ
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 15);
            titleFont.setColor(IndexedColors.DARK_GREEN.getIndex());
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle subtitleStyle = workbook.createCellStyle();
            Font subtitleFont = workbook.createFont();
            subtitleFont.setItalic(true);
            subtitleFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            subtitleStyle.setFont(subtitleFont);
            subtitleStyle.setAlignment(HorizontalAlignment.CENTER);

            String exportTime = "Ngày xuất báo cáo: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            String timeRangeStr = timeRange == null || timeRange.equals("all") ? "Tất cả thời gian" : switch(timeRange) {
                case "7days" -> "7 ngày qua";
                case "30days" -> "30 ngày qua";
                case "6months" -> "6 tháng qua";
                case "1year" -> "1 năm qua";
                case "quarter" -> "Trong quý này";
                case "custom" -> customStartDate != null && customEndDate != null ? customStartDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + " - " + customEndDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "Tùy chỉnh";
                default -> "Tất cả thời gian";
            };
            String filterTime = "Thời gian thống kê: " + timeRangeStr;

            // 1. Sheet Tổng Quan
            Sheet sheet1 = workbook.createSheet("Tổng Quan");
            createReportHeader(sheet1, "BÁO CÁO THỐNG KÊ TỔNG QUAN", exportTime, filterTime, 1, titleStyle, subtitleStyle);
            Row hRow1 = sheet1.createRow(4);
            hRow1.createCell(0).setCellValue("Chỉ tiêu"); hRow1.getCell(0).setCellStyle(headerStyle);
            hRow1.createCell(1).setCellValue("Giá trị"); hRow1.getCell(1).setCellStyle(headerStyle);

            Object[][] summaryData = {
                {"Doanh thu (VNĐ)", stats.get("totalRevenue")},
                {"Tổng khách hàng", stats.get("totalUsers")},
                {"Tổng đơn hàng", stats.get("totalOrders")},
                {"Đơn chờ xác nhận", stats.get("pendingOrders")},
                {"Giao dịch thành công", ((Map<String, Integer>) stats.get("transactionStats")).get("success")},
                {"Giao dịch thất bại", ((Map<String, Integer>) stats.get("transactionStats")).get("failed")}
            };

            for (int i = 0; i < summaryData.length; i++) {
                Row row = sheet1.createRow(i + 5);
                Cell c0 = row.createCell(0); c0.setCellValue((String) summaryData[i][0]); c0.setCellStyle(dataStyle);
                Cell c1 = row.createCell(1); 
                Object val = summaryData[i][1];
                if (val instanceof Number) c1.setCellValue(((Number) val).doubleValue());
                else c1.setCellValue(String.valueOf(val));
                c1.setCellStyle(dataStyle);
            }
            sheet1.setColumnWidth(0, 8000); sheet1.setColumnWidth(1, 6000);

            // 2. Sheet Thống Kê Danh Mục
            Sheet sheet2 = workbook.createSheet("Thống Kê Danh Mục");
            createReportHeader(sheet2, "THỐNG KÊ DANH MỤC SẢN PHẨM", exportTime, filterTime, 2, titleStyle, subtitleStyle);
            Row hRow2 = sheet2.createRow(4);
            String[] headers2 = {"Danh mục", "Số lượng sản phẩm", "Tỷ lệ (%)"};
            for(int i=0; i<headers2.length; i++) { Cell c = hRow2.createCell(i); c.setCellValue(headers2[i]); c.setCellStyle(headerStyle); }
            List<Map<String, Object>> catStats = (List<Map<String, Object>>) stats.get("categoryStats");
            int rIdx = 5;
            for(Map<String, Object> c : catStats) {
                Row r = sheet2.createRow(rIdx++);
                Cell c0 = r.createCell(0); c0.setCellValue((String) c.get("name")); c0.setCellStyle(dataStyle);
                Cell c1 = r.createCell(1); c1.setCellValue(((Number) c.get("count")).doubleValue()); c1.setCellStyle(dataStyle);
                Cell c2 = r.createCell(2); c2.setCellValue(((Number) c.get("percentage")).doubleValue()); c2.setCellStyle(dataStyle);
            }
            sheet2.setColumnWidth(0, 8000); sheet2.setColumnWidth(1, 6000); sheet2.setColumnWidth(2, 6000);

            // 3. Sheet Tăng Trưởng Doanh Thu
            Sheet sheet3 = workbook.createSheet("Tăng Trưởng Doanh Thu");
            createReportHeader(sheet3, "TĂNG TRƯỞNG DOANH THU", exportTime, filterTime, 1, titleStyle, subtitleStyle);
            Row hRow3 = sheet3.createRow(4);
            String[] headers3 = {"Thời gian", "Doanh thu (VNĐ)"};
            for(int i=0; i<headers3.length; i++) { Cell c = hRow3.createCell(i); c.setCellValue(headers3[i]); c.setCellStyle(headerStyle); }
            List<Map<String, Object>> revStats = (List<Map<String, Object>>) stats.get("revenueGrowthData");
            rIdx = 5;
            for(Map<String, Object> r : revStats) {
                Row row = sheet3.createRow(rIdx++);
                Cell c0 = row.createCell(0); c0.setCellValue((String) r.get("label")); c0.setCellStyle(dataStyle);
                Cell c1 = row.createCell(1); c1.setCellValue(((Number) r.get("value")).doubleValue()); c1.setCellStyle(dataStyle);
            }
            sheet3.setColumnWidth(0, 6000); sheet3.setColumnWidth(1, 8000);

            // 4. Sheet Người Dùng Mới
            Sheet sheet4 = workbook.createSheet("Người Dùng Mới");
            createReportHeader(sheet4, "BIỂU ĐỒ NGƯỜI DÙNG MỚI", exportTime, filterTime, 1, titleStyle, subtitleStyle);
            Row hRow4 = sheet4.createRow(4);
            String[] headers4 = {"Thời gian", "Người dùng mới"};
            for(int i=0; i<headers4.length; i++) { Cell c = hRow4.createCell(i); c.setCellValue(headers4[i]); c.setCellStyle(headerStyle); }
            List<Map<String, Object>> userStats = (List<Map<String, Object>>) stats.get("userGrowthData");
            rIdx = 5;
            for(Map<String, Object> u : userStats) {
                Row row = sheet4.createRow(rIdx++);
                Cell c0 = row.createCell(0); c0.setCellValue((String) u.get("label")); c0.setCellStyle(dataStyle);
                Cell c1 = row.createCell(1); c1.setCellValue(((Number) u.get("value")).doubleValue()); c1.setCellStyle(dataStyle);
            }
            sheet4.setColumnWidth(0, 6000); sheet4.setColumnWidth(1, 6000);

            // 5. Sheet Đơn Hàng Gần Đây
            Sheet sheet5 = workbook.createSheet("Đơn Hàng Gần Đây");
            createReportHeader(sheet5, "DANH SÁCH ĐƠN HÀNG", exportTime, filterTime, 4, titleStyle, subtitleStyle);
            Row hRow5 = sheet5.createRow(4);
            String[] headers5 = {"Mã ĐH", "Khách hàng", "Ngày đặt", "Tổng tiền (VNĐ)", "Trạng thái"};
            for(int i=0; i<headers5.length; i++) { Cell c = hRow5.createCell(i); c.setCellValue(headers5[i]); c.setCellStyle(headerStyle); }
            List<Map<String, Object>> orderStats = (List<Map<String, Object>>) stats.get("recentOrders");
            rIdx = 5;
            for(Map<String, Object> o : orderStats) {
                Row row = sheet5.createRow(rIdx++);
                Cell c0 = row.createCell(0); c0.setCellValue("#" + o.get("id")); c0.setCellStyle(dataStyle);
                Cell c1 = row.createCell(1); c1.setCellValue((String) o.get("customer")); c1.setCellStyle(dataStyle);
                Cell c2 = row.createCell(2); c2.setCellValue((String) o.get("date")); c2.setCellStyle(dataStyle);
                Cell c3 = row.createCell(3); c3.setCellValue(((Number) o.get("total")).doubleValue()); c3.setCellStyle(dataStyle);
                Cell c4 = row.createCell(4);
                String status = (String) o.get("status");
                String statusLabel = switch (status) {
                    case "PENDING" -> "Chờ xác nhận";
                    case "CONFIRMED" -> "Đã xác nhận";
                    case "SHIPPING" -> "Đang giao";
                    case "DELIVERED" -> "Đã giao";
                    case "CANCELLED" -> "Đã hủy";
                    default -> status;
                };
                c4.setCellValue(statusLabel); c4.setCellStyle(dataStyle);
            }
            sheet5.setColumnWidth(0, 4000); sheet5.setColumnWidth(1, 8000); sheet5.setColumnWidth(2, 6000);
            sheet5.setColumnWidth(3, 6000); sheet5.setColumnWidth(4, 6000);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // Hàm hỗ trợ in Header dùng chung cho các Sheet
    private void createReportHeader(Sheet sheet, String title, String exportTime, String filterTime, int maxColIndex, CellStyle titleStyle, CellStyle subtitleStyle) {
        Row r0 = sheet.createRow(0);
        Cell c0 = r0.createCell(0); c0.setCellValue(title); c0.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, maxColIndex));

        Row r1 = sheet.createRow(1);
        Cell c1 = r1.createCell(0); c1.setCellValue(exportTime); c1.setCellStyle(subtitleStyle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, maxColIndex));

        Row r2 = sheet.createRow(2);
        Cell c2 = r2.createCell(0); c2.setCellValue(filterTime); c2.setCellStyle(subtitleStyle);
        sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, maxColIndex));
    }
}
