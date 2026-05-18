package com.example.minigarden.config;

import org.springframework.context.annotation.Configuration;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Configuration
public class VNPayConfig {
    public static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    public static final String vnp_ReturnUrl = "http://localhost:5173/success";

    public static final String vnp_TmnCode = "DWJODUZI";

    public static final String vnp_HashSecret = "7WPT8UE4OTL9UP7ACK4H0IBPOBFJO70O";

    public static final String vnp_apiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    public static final String vnp_Version = "2.1.0";

    public static final String vnp_Command = "pay";

    // Mã hóa HmacSHA512
    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    // Lấy IP tĩnh của User
    public static String getIpAddress(jakarta.servlet.http.HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null || ipAdress.isEmpty()) {
                ipAdress = request.getRemoteAddr();
            }
            // Trong trường hợp có nhiều IP phân tách bằng dấu phẩy
            if (ipAdress != null && ipAdress.contains(",")) {
                ipAdress = ipAdress.split(",")[0].trim();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP";
        }
        return ipAdress;
    }

    // Tạo chuỗi hash từ danh sách tham số (Dùng để tạo chữ ký URL)
    public static String hashAllFields(Map<String, String> fields) {
        StringBuilder dataToHash = new StringBuilder();

        fields.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    if (dataToHash.length() > 0) {
                        dataToHash.append("&");
                    }
                    dataToHash.append(entry.getKey())
                            .append("=")
                            .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
                });

        return hmacSHA512(vnp_HashSecret, dataToHash.toString());
    }
}
