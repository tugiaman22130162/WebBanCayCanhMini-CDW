package com.example.minigarden.dto;

import com.example.minigarden.entity.AddressType;
import lombok.Data;

@Data
public class AddressRequest {

    private String receiverName;

    private String phone;

    private String province;

    private String district;

    private String ward;

    private String street;

    private AddressType type;

    private Boolean isDefault;

    private Integer provinceId;

    private Integer districtId;
    
    private String wardCode;
    
}
