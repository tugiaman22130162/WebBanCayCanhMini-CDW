import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get("redirect") || "/";
    const { login } = useAuth();

    const validateForm = () => {
        let newErrors = { email: "", password: "" };
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email không đúng định dạng.";
            isValid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
        if (!passwordRegex.test(formData.password)) {
            newErrors.password = "Mật khẩu phải từ 6 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name as keyof typeof errors]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                // Gọi API Login tới Backend Spring Boot
                const response = await axios.post("http://localhost:8080/api/auth/login", formData);
                const data = response.data;

                // Lưu Token vào LocalStorage và chuyển hướng
                localStorage.setItem("token", data.token);
                
                // Cập nhật state toàn cục của AuthContext ngay lập tức
                login(data.token, data.user || data); 

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Đăng nhập thành công!',
                    timer: 1500,
                    showConfirmButton: false,
                    width: 'auto',
                    padding: '0.5em 1em',
                    customClass: {
                        popup: 'mb-6 rounded-full shadow-lg border border-gray-100 flex items-center',
                        title: 'text-sm font-bold text-gray-700 whitespace-nowrap',
                    }
                }).then(() => {
                    const userRole = data.user?.role || data.role; // Lấy role từ data.user hoặc data
                    if (userRole === "ADMIN") {
                        navigate("/admin/dashboard");
                    } else {
                        navigate(redirectUrl);
                    }
                });
            } catch (error: any) {
                console.error("Lỗi đăng nhập:", error);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: error.response?.data?.message || "Đăng nhập thất bại!",
                    showConfirmButton: false,
                    timer: 2500,
                    width: 'auto',
                    padding: '0.5em 1em',
                    customClass: {
                        popup: 'mb-6 rounded-full shadow-lg border border-gray-100 flex items-center',
                        title: 'text-sm font-bold text-gray-700 whitespace-nowrap',
                    }
                });
            }
        }
    };

    // Xử lý lưu URL để chuyển hướng lại sau khi đăng nhập bằng Mạng xã hội
    const handleSocialLogin = (provider: string) => {
        if (redirectUrl && redirectUrl !== "/") {
            localStorage.setItem("redirectAfterLogin", redirectUrl);
        }
        window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
    };

    return (
        <div className="min-h-screen bg-[#222] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

            {/* Ảnh nền phủ giới hạn ở size Full HD (1920x1080) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                <img
                    src="/images/bg_forgot.png"
                    alt="Background login"
                    className="w-full h-full max-w-[1920px] max-h-[1080px] object-cover object-center shadow-2xl"
                />
                {/* Lớp phủ tối mờ để tạo chiều sâu và nổi bật form */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>

            {/* Container: Form đăng nhập nổi lên giữa màn hình */}
            <div className="relative z-10 w-full max-w-lg bg-white p-8 md:p-10 rounded-[24px] shadow-2xl">
                <h1 className="text-4xl font-bold text-center text-primary mb-2">
                    Đăng Nhập
                </h1>
                <p className="text-center text-on-surface-variant mb-8 text-sm">
                    Chào mừng bạn quay lại với cửa hàng cây cảnh MiniGarden!
                </p>


                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                className="w-4 h-4 text-[#406D5E] bg-[#F0EEE5] border-gray-300 rounded-[10px] focus:ring-primary focus:ring-1 cursor-pointer accent-primary"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-primary font-medium cursor-pointer">
                                Ghi nhớ mật khẩu
                            </label>
                        </div>
                        <Link to="/forgot-password" className="text-sm text-primary font-bold hover:text-primary-container transition-colors">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 mt-2 bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
                        Đăng nhập
                    </button>
                </form>

                <div className="mt-8 flex items-center justify-between">
                    <span className="w-1/5 border-b border-gray-300 lg:w-1/4"></span>
                    <p className="text-xs text-center text-gray-500 ">Hoặc đăng nhập qua</p>
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
                    <Link to={redirectUrl !== "/" ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"} className="text-primary font-bold hover:text-primary-container transition-colors">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
