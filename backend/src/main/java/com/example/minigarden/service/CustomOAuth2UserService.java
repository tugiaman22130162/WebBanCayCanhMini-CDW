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
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {

        OAuth2User oAuth2User = super.loadUser(request);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // check user trong DB
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .fullName(name)
                            .password("")
                            .role(Role.USER)
                            .status(UserStatus.ACTIVE)
                            .provider(AuthProvider.GOOGLE)
                            .build();
                    return userRepository.save(newUser);
                });

        return oAuth2User;
    }
}