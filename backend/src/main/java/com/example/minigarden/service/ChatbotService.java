package com.example.minigarden.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ChatbotService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String apiUrl;

    public String getChatbotResponse(String userMessage) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Prompt định hướng kết hợp luôn với câu hỏi của khách hàng
        String prompt = "Bạn là Mossy, trợ lý ảo của cửa hàng cây cảnh MiniGarden. " +
                "Bạn tư vấn nhiệt tình, thân thiện. Giới hạn câu trả lời ngắn gọn, dưới 100 từ và luôn dùng icon.\n\n" +
                "Khách hàng: " + userMessage;

        // Format JSON body chuẩn của Gemini
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("role", "user");
        content.put("parts", Arrays.asList(part));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", Arrays.asList(content));

        // Gemini gắn API key trực tiếp trên URL parameter
        String urlWithKey = apiUrl.trim() + "?key=" + apiKey.trim();
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    urlWithKey,
                    Objects.requireNonNull(HttpMethod.POST),
                    entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                @SuppressWarnings("unchecked")
                Map<String, Object> contentObj = (Map<String, Object>) candidates.get(0).get("content");

                if (contentObj != null && contentObj.containsKey("parts")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentObj.get("parts");
                    return (String) parts.get(0).get("text");
                } else {
                    return "Xin lỗi, nội dung này có thể đã bị chặn bởi bộ lọc an toàn của Gemini. 🌿";
                }
            }
        } catch (org.springframework.web.client.RestClientResponseException e) {
            System.err.println("Chi tiết lỗi từ Gemini API: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Lỗi khi gọi Gemini API: " + e.getMessage());
        }

        return "Xin lỗi, hiện tại Mossy đang gặp sự cố kết nối. Bạn có thể gọi hotline để được hỗ trợ nhanh nhé! 🌿";
    }
}
