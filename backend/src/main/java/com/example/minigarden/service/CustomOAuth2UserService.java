package com.example.minigarden.service;

import com.example.minigarden.entity.User;
import com.example.minigarden.entity.AuthProvider;
import com.example.minigarden.entity.Role;
import com.example.minigarden.entity.UserStatus;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {

        OAuth2User oAuth2User = super.loadUser(request);
        String provider = request.getClientRegistration().getRegistrationId();
        
        // Tạo một bản sao của thuộc tính để có thể sửa đổi (thêm email giả định nếu cần)
        Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        // 1. LẤY VÀ XỬ LÝ EMAIL (Chống Null)
        String providerId = (String) attributes.get("id"); // ID của Facebook
        if (providerId == null) {
            providerId = (String) attributes.get("sub"); // ID của Google
        }

        if (email == null || email.trim().isEmpty()) {
            email = providerId + "@" + provider + ".com";
            attributes.put("email", email); // Cập nhật lại vào attributes để SuccessHandler phía sau lấy được
        }

        // 2. LẤY VÀ XỬ LÝ AVATAR
        String avatarUrl = "";
        if ("google".equalsIgnoreCase(provider)) {
            avatarUrl = (String) attributes.get("picture");
        } else if ("facebook".equalsIgnoreCase(provider)) {
            Object pictureObj = attributes.get("picture");
            if (pictureObj instanceof Map) {
                Map<?, ?> pictureMap = (Map<?, ?>) pictureObj;
                if (pictureMap.containsKey("data")) {
                    Object dataObj = pictureMap.get("data");
                    if (dataObj instanceof Map) {
                        Map<?, ?> dataMap = (Map<?, ?>) dataObj;
                        avatarUrl = (String) dataMap.get("url");
                        attributes.put("picture", avatarUrl); // Đưa URL ảnh phẳng ra ngoài
                    }
                }
            }
        }

        AuthProvider authProvider = "facebook".equalsIgnoreCase(provider) ? AuthProvider.FACEBOOK : AuthProvider.GOOGLE;
        final String finalEmail = email;
        final String finalAvatarUrl = avatarUrl;

        // check user trong DB
        userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(finalEmail)
                            .fullName(name != null ? name : "Người dùng " + provider)
                            .password("")
                            .avatar(finalAvatarUrl)
                            .role(Role.USER)
                            .status(UserStatus.ACTIVE)
                            .provider(authProvider)
                            .build();
                    return userRepository.save(Objects.requireNonNull(newUser));
                });

        // Trả về DefaultOAuth2User mang theo attributes đã được làm sạch/thêm email
        String userNameAttributeName = request.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                attributes,
                userNameAttributeName
        );
    }
}