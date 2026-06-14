package com.example.minigarden.config;

import com.example.minigarden.service.JwtService;
import com.example.minigarden.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User user = (OAuth2User) authentication.getPrincipal();

        String email = user.getAttribute("email");

        String token = jwtService.generateToken(email);

        String role = "USER";
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getRole() != null) {
            role = userOpt.get().getRole().name();
        }

        response.sendRedirect("http://localhost:5173/oauth2/success?token=" + token + "&role=" + role);
    }
}