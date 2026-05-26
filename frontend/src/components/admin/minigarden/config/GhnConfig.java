package com.example.minigarden.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ghn")
@Data
public class GhnConfig {

    private String token;

    private Integer shopId;

    private Integer fromDistrictId;
    
    private String fromWardCode;
}