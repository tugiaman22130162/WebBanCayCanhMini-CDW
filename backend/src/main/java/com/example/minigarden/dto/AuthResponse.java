package com.example.minigarden.dto;

import com.example.minigarden.entity.Role;
import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class AuthResponse {
    private String token;
    private String email;
    private Role role;
}
