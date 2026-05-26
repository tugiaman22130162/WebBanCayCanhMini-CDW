package com.example.minigarden.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

//cau hinh email service de gui mail reset password
//no se duoc su dung trong UserService de gui mail khi nguoi dung yeu cau reset password
//no la email service don gian su dung JavaMailSender de gui mail
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetPasswordEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Yêu cầu đặt lại mật khẩu - MiniGarden");
        message.setText("Để đặt lại mật khẩu, vui lòng nhấp vào đường link sau:\n\n"
                + "http://localhost:5173/reset-password?token=" + token
                + "\n\nLink này sẽ hết hạn sau 15 phút.");
        mailSender.send(message);
    }
}