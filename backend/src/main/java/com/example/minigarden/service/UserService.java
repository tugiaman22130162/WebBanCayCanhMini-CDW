package com.example.minigarden.service;

import com.example.minigarden.dto.AuthResponse;
import com.example.minigarden.dto.LoginRequest;
import com.example.minigarden.dto.RegisterRequest;
import com.example.minigarden.dto.UserResponse;
import com.example.minigarden.entity.User;
import com.example.minigarden.entity.UserStatus;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.concurrent.ThreadLocalRandom;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import com.example.minigarden.entity.AuthProvider;
import com.example.minigarden.entity.Role;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // Cache để lưu trữ tạm thời thông tin đăng ký và OTP
    private static final Map<String, RegisterRequest> otpCache = new ConcurrentHashMap<>();
    private static final Map<String, LocalDateTime> otpExpiryCache = new ConcurrentHashMap<>();

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

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public UserResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    // register
    @Transactional
    public void requestRegistrationOtp(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng.");
        }

        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 999999));
        // Lưu OTP và thời gian hết hạn vào cache 
        otpCache.put(email, new RegisterRequest(null, email, null, null, otp));
        otpExpiryCache.put(email, LocalDateTime.now().plusMinutes(5));

        emailService.sendOtpEmail(email, otp);
    }

    @Transactional
    public void completeRegistration(RegisterRequest request) {
        RegisterRequest cachedRequest = otpCache.get(request.getEmail());
        LocalDateTime expiryTime = otpExpiryCache.get(request.getEmail());

        if (cachedRequest == null || expiryTime == null || expiryTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.");
        }

        if (!cachedRequest.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Mã OTP không chính xác.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setStatus(UserStatus.ACTIVE);
        user.setProvider(AuthProvider.LOCAL);

        userRepository.save(user);

        // Xóa OTP khỏi cache sau khi hoàn tất
        otpCache.remove(request.getEmail());
        otpExpiryCache.remove(request.getEmail());
    }

    public void register(RegisterRequest req) {

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .provider(AuthProvider.LOCAL)
                .failedLoginAttempts(0)
                .build();

        userRepository.save(Objects.requireNonNull(user));
    }

    // login
    public AuthResponse login(LoginRequest req) {

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        // check provider
        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new RuntimeException("Tài khoản dùng Google/Facebook");
        }

        // Kiểm tra trạng thái tài khoản
        if (user.getStatus() == UserStatus.BANNED) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();
            attempts++;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= 5) {
                user.setStatus(UserStatus.BANNED);
                userRepository.save(Objects.requireNonNull(user));
                throw new RuntimeException("Tài khoản đã bị khóa do nhập sai mật khẩu quá 5 lần");
            }
            userRepository.save(Objects.requireNonNull(user));

            if (attempts >= 3) {
                int remaining = 5 - attempts;
                throw new RuntimeException(
                        "Sai mật khẩu. Bạn chỉ còn " + remaining + " lần nhập nữa trước khi tài khoản bị khóa");
            }
            throw new RuntimeException("Sai mật khẩu");
        }

        if (user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
            userRepository.save(Objects.requireNonNull(user));
        }

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // forgot password
    public String forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy email"));

        String otp = String.valueOf(ThreadLocalRandom
                .current()
                .nextInt(100000, 999999));
        user.setResetToken(otp);
        // thời gian hết hạn cho token là 5 phút
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(Objects.requireNonNull(user));

        emailService.sendResetPasswordEmail(user.getEmail(), otp);
        return "Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.";
    }

    // verify otp
    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy email"));

        if (user.getResetToken() == null) {
            throw new RuntimeException("OTP không hợp lệ");
        }

        if (!otp.equals(user.getResetToken())) {
            throw new RuntimeException("OTP không hợp lệ");
        }

        if (user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP đã hết hạn");
        }
    }

    // reset password
    public void resetPassword(String email, String otp, String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy email"));

        if (user.getResetToken() == null) {
            throw new RuntimeException("OTP không hợp lệ");
        }

        if (!otp.equals(user.getResetToken())) {
            throw new RuntimeException("OTP không hợp lệ");
        }

        if (user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP đã hết hạn");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setFailedLoginAttempts(0); // Reset số lần sai khi đổi mật khẩu

        userRepository.save(Objects.requireNonNull(user));
    }

    @Transactional
    public void verifyAccount(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (user.getResetToken() == null || !user.getResetToken().equals(otp) || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }

        // Logic kích hoạt tài khoản nếu cần
        // user.setEnabled(true);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
    // Logic khóa / mở khóa User
    public UserResponse toggleUserStatus(Integer id) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Chuyển đổi trạng thái qua lại
        if (user.getStatus() == UserStatus.ACTIVE) {
            user.setStatus(UserStatus.BANNED);
        } else {
            user.setStatus(UserStatus.ACTIVE);
            user.setFailedLoginAttempts(0); // Reset số lần sai khi Admin mở khóa
        }
        userRepository.save(Objects.requireNonNull(user));

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    // Cập nhật thông tin User (Tên, Vai trò, Trạng thái)
    public UserResponse updateUser(Integer id, UserResponse req) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Cập nhật các trường nếu có truyền lên
        if (req.getFullName() != null)
            user.setFullName(req.getFullName());
        if (req.getRole() != null)
            user.setRole(req.getRole());
        if (req.getStatus() != null)
            user.setStatus(req.getStatus());

        userRepository.save(Objects.requireNonNull(user));

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}