import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get("redirect");

    // Hiệu ứng (Debounce) kiểm tra email ngay khi người dùng ngừng gõ
    useEffect(() => {
        const checkEmail = async () => {
            if (!formData.email.trim()) return;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setErrors(prev => ({ ...prev, email: "Email không đúng định dạng." }));
                return;
            }

            try {
                // Gọi API kiểm tra email đã tồn tại hay chưa
                const response = await axios.get(`http://localhost:8080/api/auth/check-email?email=${formData.email}`);
                if (response.data.exists) {
                    setErrors(prev => ({ ...prev, email: "Email đã được sử dụng." }));
                } else {
                    setErrors(prev => ({ ...prev, email: "" }));
                }
            } catch (error) {
                console.error("Lỗi kiểm tra email:", error);
            }
        };

        const timeoutId = setTimeout(checkEmail, 500); // Chờ 500ms sau khi ngừng gõ
        return () => clearTimeout(timeoutId);
    }, [formData.email]);

    const validateForm = () => {
        let newErrors = { fullName: "", email: "", password: "", confirmPassword: "" };
        let isValid = true;

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Vui lòng nhập họ và tên.";
            isValid = false;
        }

        // Regex kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email không đúng định dạng.";
            isValid = false;
        } else if (errors.email === "Email đã được sử dụng.") {
            newErrors.email = "Email đã được sử dụng.";
            isValid = false;
        }

        // Regex kiểm tra mật khẩu: >= 6 ký tự, có hoa, thường, số và ký tự đặc biệt
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
        if (!passwordRegex.test(formData.password)) {
            newErrors.password = "Mật khẩu phải từ 6 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.";
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Tự động xóa thông báo lỗi khi người dùng bắt đầu gõ lại
        if (errors[e.target.name as keyof typeof errors]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                await axios.post("http://localhost:8080/api/auth/register", formData);
                Swal.fire({
                    toast: true,
                    position: 'bottom',
                    icon: 'success',
                    title: 'Đăng ký thành công! Vui lòng đăng nhập.',
                    showConfirmButton: false,
                    timer: 2000,
                    width: 'auto',
                    padding: '0.5em 1em',
                    customClass: {
                        popup: 'mb-6 rounded-full shadow-lg border border-gray-100',
                        title: 'text-sm font-bold text-gray-700',
                    }
                }).then(() => {
                    navigate(redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login");
                });
            } catch (error: any) {
                Swal.fire({
                    toast: true,
                    position: 'bottom',
                    icon: 'error',
                    title: error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại!',
                    showConfirmButton: false,
                    timer: 2500,
                    width: 'auto',
                    padding: '0.5em 1em',
                    customClass: {
                        popup: 'mb-6 rounded-full shadow-lg border border-gray-100',
                        title: 'text-sm font-bold text-gray-700',
                    }
                });
            }
        }
    };

    // Xử lý lưu URL để chuyển hướng lại sau khi đăng ký bằng Mạng xã hội
    const handleSocialLogin = (provider: string) => {
        if (redirectUrl && redirectUrl !== "/") {
            localStorage.setItem("redirectAfterLogin", redirectUrl);
        }
        localStorage.setItem("socialProvider", provider); // Lưu loại Mạng xã hội đang click
        window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
    };

    return (
        <div className="min-h-screen bg-[#222] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

            {/* Ảnh nền phủ giới hạn ở size Full HD (1920x1080) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                <img
                    src="/images/bg_forgot.png"
                    alt="Background forgot password"
                    className="w-full h-full max-w-[1920px] max-h-[1080px] object-cover object-center shadow-2xl"
                />
                {/* Lớp phủ tối mờ để tạo chiều sâu và nổi bật form */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>

            {/* Container: Form đăng ký nổi lên giữa màn hình */}
            <div className="relative z-10 w-full max-w-lg bg-white p-8 md:p-10 rounded-[24px] shadow-2xl">
                    <h1 className="text-4xl font-bold text-primary mb-2 text-center">
                        Đăng Ký
                    </h1>
                    <p className="text-on-surface-variant mb-8 text-sm text-center">
                        Bắt đầu hành trình xanh của cùng MiniGarden ngay hôm nay 🌿
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label className="block text-sm text-[#65645F] font-bold mb-1">Họ và tên</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    person
                                </span>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    className={`w-full pl-12 pr-4 py-3 bg-info-bg rounded-[10px] border ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent hover:border-[#006c49] focus:border-[#006c49] focus:ring-[#006c49]'} focus:ring-1 outline-none transition-all`}
                                    required
                                />
                            </div>
                            {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-[#65645F] font-bold mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    mail
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="hello@minigarden.com"
                                    className={`w-full pl-12 pr-4 py-3 bg-info-bg rounded-[10px] border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent hover:border-[#006c49] focus:border-[#006c49] focus:ring-[#006c49]'} focus:ring-1 outline-none transition-all`}
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <div className="flex-1">
                                <label className="block text-sm text-[#65645F] font-bold mb-1">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        lock
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="***"
                                        className={`w-full pl-12 pr-12 py-3 bg-info-bg rounded-[10px] border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent hover:border-[#006c49] focus:border-[#006c49] focus:ring-[#006c49]'} focus:ring-1 outline-none transition-all`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#406D5E] focus:outline-none flex items-center justify-center transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm text-[#65645F] font-bold mb-1">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        lock
                                    </span>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="***"
                                        className={`w-full pl-12 pr-12 py-3 bg-info-bg rounded-[10px] border ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent hover:border-[#006c49] focus:border-[#006c49] focus:ring-[#006c49]'} focus:ring-1 outline-none transition-all`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#406D5E] focus:outline-none flex items-center justify-center transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showConfirmPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 mt-2 bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"                        >
                            Tạo tài khoản ngay
                        </button>
                    </form>

                    <div className="mt-8 flex items-center justify-between">
                        <span className="w-1/5 border-b border-gray-300 lg:w-1/4"></span>
                        <p className="text-xs text-center text-gray-500">Hoặc đăng ký qua</p>
                        <span className="w-1/5 border-b border-gray-300 lg:w-1/4"></span>
                    </div>

                    <div className="flex gap-4 mt-6 justify-center">
                        <button type="button" onClick={() => handleSocialLogin("google")} className="w-14 h-14 flex items-center justify-center bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:border-[#006c49] hover:-translate-y-0.5 focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none transition-all duration-200">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                        </button>
                        <button type="button" onClick={() => handleSocialLogin("facebook")} className="w-14 h-14 flex items-center justify-center bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:border-[#006c49] hover:-translate-y-0.5 focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none transition-all duration-200">
                            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-6 h-6" />
                        </button>
                    </div>

                    <p className="text-center text-sm text-[#65645F] font-medium mt-6">
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="text-primary font-bold hover:text-primary-container transition-colors">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
        </div>
    ); 
}