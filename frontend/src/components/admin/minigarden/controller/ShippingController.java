package com.example.minigarden.controller;

import com.example.minigarden.config.GhnConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.HashMap;
import java.util.Objects;

@RestController
@RequestMapping("/api/ghn") 
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ShippingController {

    private final GhnConfig ghnConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    // API lấy danh sách tỉnh thành
    @GetMapping("/provinces")
    public ResponseEntity<?> getProvinces() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnConfig.getToken());
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Object> response = restTemplate.exchange(
                "https://online-gateway.ghn.vn/shiip/public-api/master-data/province", Objects.requireNonNull(HttpMethod.GET), entity,
                Object.class);
        return ResponseEntity.ok(response.getBody());
    }

    // API lấy danh sách quận/huyện theo tỉnh thành
    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts(@RequestParam("province_id") Integer provinceId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnConfig.getToken());
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Object> response = restTemplate.exchange(
                "https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=" + provinceId,
                Objects.requireNonNull(HttpMethod.GET), entity, Object.class);
        return ResponseEntity.ok(response.getBody());
    }

    // API lấy danh sách phường/ xã theo quận huyện
    @GetMapping("/wards")
    public ResponseEntity<?> getWards(@RequestParam("district_id") Integer districtId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnConfig.getToken());
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Object> response = restTemplate.exchange(
                "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=" + districtId,
                Objects.requireNonNull(HttpMethod.GET), entity, Object.class);
        return ResponseEntity.ok(response.getBody());
    }

    // API tính phí vận chuyển
    @PostMapping("/fee")
    public ResponseEntity<?> calculateFee(@RequestBody Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", ghnConfig.getToken());
            headers.set("ShopId", String.valueOf(ghnConfig.getShopId()));

            headers.setContentType(MediaType.APPLICATION_JSON);
            payload.put("shop_id", Integer.parseInt(String.valueOf(ghnConfig.getShopId())));
            payload.put("from_district_id", ghnConfig.getFromDistrictId());
            payload.put("from_ward_code", ghnConfig.getFromWardCode());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Object> response = restTemplate.exchange(
                    "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee", Objects.requireNonNull(HttpMethod.POST), entity,
                    Object.class);
            return ResponseEntity.ok(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                    .body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // API tính thời gian giao hàng dự kiến
    @PostMapping("/leadtime")
    public ResponseEntity<?> calculateLeadTime(@RequestBody Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", ghnConfig.getToken());
            headers.set("ShopId", String.valueOf(ghnConfig.getShopId()));
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();

            body.put("from_district_id", ghnConfig.getFromDistrictId());
            body.put("from_ward_code", ghnConfig.getFromWardCode());

            body.put("to_district_id", Integer.parseInt(payload.get("to_district_id").toString()));
            body.put("to_ward_code", payload.get("to_ward_code").toString().trim());
            body.put("service_id", Integer.parseInt(payload.get("service_id").toString()));

            System.out.println("FROM DIST: " + ghnConfig.getFromDistrictId());
            System.out.println("FROM WARD: " + ghnConfig.getFromWardCode());
            System.out.println("TO DIST: " + payload.get("to_district_id"));
            System.out.println("TO WARD: " + payload.get("to_ward_code"));
            System.out.println("SERVICE: " + payload.get("service_id"));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Object> response = restTemplate.exchange(
                    "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime",
                    Objects.requireNonNull(HttpMethod.POST),
                    entity,
                    Object.class);
            System.out.println("LEADTIME BODY = " + body);

            return ResponseEntity.ok(response.getBody());

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                    .body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    //lấy ra id dịch vụ ghn phù hợp với quận huyện để tính phí và thời gian giao hàng
    @PostMapping("/services")
    public ResponseEntity<?> getAvailableServices(@RequestBody Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", ghnConfig.getToken());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();

            body.put("shop_id", Integer.parseInt(String.valueOf(ghnConfig.getShopId())));

            body.put("from_district", ghnConfig.getFromDistrictId());
            body.put("to_district", Integer.parseInt(payload.get("to_district_id").toString()));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Object> response = restTemplate.exchange(
                    "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services",
                    Objects.requireNonNull(HttpMethod.POST),
                    entity,
                    Object.class);

            return ResponseEntity.ok(response.getBody());

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                    .body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}