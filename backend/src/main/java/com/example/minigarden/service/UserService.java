package com.example.minigarden.service;

import com.example.minigarden.dto.UserResponse;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(user -> UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .status(user.getStatus())
                .build()).collect(Collectors.toList());
    }
}