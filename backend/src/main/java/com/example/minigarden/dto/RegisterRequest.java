package com.example.minigarden.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Họ và tên không được để trống")
    @Pattern(regexp = "^[a-zA-Zàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ\\s]+$", message = "Họ và tên không được chứa số hoặc ký tự đặc biệt.")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{6,}$", message = "Mật khẩu phải từ 6 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.")
    private String password;

    private String confirmPassword;
    // Thêm trường OTP để gửi từ frontend lên khi xác thực
    private String otp;
}