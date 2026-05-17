package com.example.minigarden.service;

import com.example.minigarden.config.GhnConfig;
import com.example.minigarden.dto.ShippingFeeRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShippingService {

    private final GhnConfig ghnConfig;

    private final ObjectMapper objectMapper;

    public Integer calculateFee(
            ShippingFeeRequest request)
            throws Exception {

        String url = "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";

        HttpHeaders headers = new HttpHeaders();

        headers.set(
                "Token",
                ghnConfig.getToken());

        headers.set(
                "ShopId",
                String.valueOf(
                        ghnConfig.getShopId()));

        headers.setContentType(
                MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();

        body.put(
                "to_district_id",
                request.getToDistrictId());

        body.put(
                "to_ward_code",
                request.getToWardCode());

        body.put(
                "weight",
                request.getWeight());

        body.put(
                "length",
                request.getLength());

        body.put(
                "width",
                request.getWidth());

        body.put(
                "height",
                request.getHeight());

        body.put(
                "insurance_value",
                request.getInsuranceValue());

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(
                body,
                headers);

        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                String.class);

        JsonNode json = objectMapper.readTree(
                response.getBody());

        return json
                .get("data")
                .get("total")
                .asInt();
    }
}