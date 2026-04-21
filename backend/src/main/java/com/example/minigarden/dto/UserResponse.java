package com.example.minigarden.dto;

import com.example.minigarden.entity.Role;
import com.example.minigarden.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Integer id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String avatar;
    private Role role;
    private UserStatus status;
}