package com.example.minigarden.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

// cau hinh email service de gui mail reset password
// no se duoc su dung trong UserService de gui mail khi nguoi dung yeu cau reset
// password
// no la email service don gian su dung JavaMailSender de gui mail
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetPasswordEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Yêu cầu đặt lại mật khẩu - MiniGarden");
        message.setText(
                "Xin chào,\n\n"
                        + "Mã OTP để đặt lại mật khẩu của bạn là: "
                        + otp
                        + "\n\nMã OTP này có hiệu lực trong 5 phút."
                        + "\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này."
                        + "\n\nMiniGarden");
        mailSender.send(message);
    }

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Xác thực tài khoản MiniGarden");
        message.setText(
                "Xin chào,\n\n"
                        + "Mã OTP để xác thực tài khoản của bạn là: "
                        + otp
                        + "\n\nMã OTP này có hiệu lực trong 5 phút."
                        + "\n\nChào mừng bạn đến với MiniGarden!");
        mailSender.send(message);
    }
}