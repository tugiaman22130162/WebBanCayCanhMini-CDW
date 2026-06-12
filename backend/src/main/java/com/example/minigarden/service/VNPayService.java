package com.example.minigarden.service;

import com.example.minigarden.config.VNPayConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;

import java.text.Normalizer;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class VNPayService {
    
    public String createPaymentUrl(long amount, String orderCode, HttpServletRequest request) throws Exception {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        long amountInVND = amount * 100; // VNPAY nhận số tiền nhân với 100 (bỏ số thập phân)
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amountInVND));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "VNBANK"); 
        vnp_Params.put("vnp_TxnRef", orderCode); 
        vnp_Params.put("vnp_OrderInfo", removeAccent("Thanh toan don hang " + orderCode));
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);

        String vnp_IpAddr = VNPayConfig.getIpAddress(request);
        if ("0:0:0:0:0:0:0:1".equals(vnp_IpAddr) || vnp_IpAddr.contains(":")) {
            vnp_IpAddr = "127.0.0.1";
        }
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 30); // Tăng lên 30 phút để bù trừ độ lệch thời gian giữa máy cá nhân và server VNPay
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Ký dữ liệu
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        boolean first = true;
        
        for (String fieldName : fieldNames) {
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Chuẩn VNPAY 2.1.0 yêu cầu mã hóa US_ASCII và giữ nguyên dấu '+' (không đổi thành %20)
                String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII);
                
                if (!first) {
                    query.append('&');
                    hashData.append('&');
                }

                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(encodedValue);
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(encodedValue);
                
                first = false;
            }
        }
        
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        
        return VNPayConfig.vnp_PayUrl + "?" + queryUrl;
    }

    // Hàm hỗ trợ loại bỏ dấu tiếng Việt
    private String removeAccent(String s) {
        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").replaceAll("đ", "d").replaceAll("Đ", "D");
    }

    // Gọi API Hoàn tiền thủ công của VNPAY
    public JsonNode refundTransaction(String orderCode, long amount, String transNo, String transDate, String createdBy, HttpServletRequest request) throws Exception {
        String vnp_RequestId = String.valueOf(System.currentTimeMillis());
        String vnp_Version = "2.1.0";
        String vnp_Command = "refund";
        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;
        String vnp_TransactionType = "02"; // 02: Hoàn tiền toàn phần
        String vnp_TxnRef = orderCode;
        String vnp_Amount = String.valueOf(amount * 100);
        String vnp_OrderInfo = "Hoan tien don hang " + orderCode;
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);
        if ("0:0:0:0:0:0:0:1".equals(vnp_IpAddr) || vnp_IpAddr.contains(":")) {
            vnp_IpAddr = "127.0.0.1";
        }

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());

        String hashData = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + transNo + "|" + transDate + "|" + createdBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData);

        Map<String, String> payload = new HashMap<>();
        payload.put("vnp_RequestId", vnp_RequestId);
        payload.put("vnp_Version", vnp_Version);
        payload.put("vnp_Command", vnp_Command);
        payload.put("vnp_TmnCode", vnp_TmnCode);
        payload.put("vnp_TransactionType", vnp_TransactionType);
        payload.put("vnp_TxnRef", vnp_TxnRef);
        payload.put("vnp_Amount", vnp_Amount);
        payload.put("vnp_OrderInfo", vnp_OrderInfo);
        payload.put("vnp_TransactionNo", transNo); // Mã GD VNPAY lưu trong DB
        payload.put("vnp_TransactionDate", transDate); // Thời gian GD lưu trong DB
        payload.put("vnp_CreateBy", createdBy);
        payload.put("vnp_CreateDate", vnp_CreateDate);
        payload.put("vnp_IpAddr", vnp_IpAddr);
        payload.put("vnp_SecureHash", vnp_SecureHash);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);

        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
                entity,
                JsonNode.class
        );

        return response.getBody();
    }
}
