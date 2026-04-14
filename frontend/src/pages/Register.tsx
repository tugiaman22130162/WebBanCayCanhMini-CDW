import React, { useState } from "react";
import { Link } from "react-router-dom";

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
        }

        // Regex kiểm tra mật khẩu: >= 8 ký tự, có hoa, thường, số và ký tự đặc biệt
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            newErrors.password = "Mật khẩu phải từ 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.";
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // gửi dữ liệu đk lên server nếu form hợp lệ
            console.log("Dữ liệu đăng ký:", formData);
        }
    };

    return (
        <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 bg-[#FDFFDA]">

            {/* Container: Hình ảnh và Form đăng ký */}
            <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-2xl gap-[10px]">

                {/* Bên trái: Hình ảnh */}
                <div className="hidden md:block md:w-1/2 relative rounded-[10px] overflow-hidden">
                    <img
                        src="/images/bg_reg.png"
                        alt="Background register"
                        className="absolute inset-0 w-full h-full"
                    />
                    {/*overlay */}
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Bên phải: Form đăng ký */}
                <div className="w-full md:w-1/2 bg-white p-8 md:p-12 rounded-[10px]">
                    <h2 className="text-3xl font-bold text-left text-[#406D5E] mb-2">
                        Đăng Ký
                    </h2>
                    <p className="text-left text-[#65645F] mb-8 text-sm">
                        Bắt đầu hành trình xanh của bạn cùng Mini Garden ngay hôm nay 🌿
                    </p>

                    <div className="flex items-start gap-3 bg-info-bg p-4 rounded-lg text-sm text-info">
                        <span className="material-symbols-outlined text-info text-xl">
                            info
                        </span>
                        <p>
                            <strong>Lưu ý: Bạn sẽ nhận được một email xác thực sau khi hoàn tất đăng ký để kích hoạt tài khoản.</strong>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label className="block text-sm text-[#65645F] font-bold mb-1">USER NAME</label>
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
                                    className={`w-full pl-12 pr-4 py-3 bg-[#F0EEE5] rounded-[10px] border ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent hover:border-[#65645F] focus:border-[#65645F] focus:ring-[#65645F]'} focus:ring-1 outline-none transition-all`}
                                    required
                                />
                            </div>
                            {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-[#65645F] font-bold mb-1">
                                EMAIL
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
                                    className={`w-full pl-12 pr-4 py-3 bg-[#F0EEE5] rounded-[10px] border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent hover:border-[#65645F] focus:border-[#65645F] focus:ring-[#65645F]'} focus:ring-1 outline-none transition-all`}
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <div className="flex-1">
                                <label className="block text-sm text-[#65645F] font-bold mb-1">
                                    MẬT KHẨU
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
                                        className={`w-full pl-12 pr-12 py-3 bg-[#F0EEE5] rounded-[10px] border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent hover:border-[#65645F] focus:border-[#65645F] focus:ring-[#65645F]'} focus:ring-1 outline-none transition-all`}
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
                                    XÁC NHẬN MẬT KHẨU
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
                                        className={`w-full pl-12 pr-12 py-3 bg-[#F0EEE5] rounded-[10px] border ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent hover:border-[#65645F] focus:border-[#65645F] focus:ring-[#65645F]'} focus:ring-1 outline-none transition-all`}
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
                            className="w-full py-4 mt-2 bg-[#406D5E] hover:bg-[#2f5146] text-white font-bold rounded-[24px] transition-colors shadow-md"
                        >
                            Tạo tài khoản ngay
                        </button>
                    </form>

                    <div className="mt-8 flex items-center justify-between">
                        <span className="w-1/5 border-b border-gray-300 lg:w-1/4"></span>
                        <p className="text-xs text-center text-gray-500">Hoặc đăng ký qua</p>
                        <span className="w-1/5 border-b border-gray-300 lg:w-1/4"></span>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button className="flex-1 flex items-center justify-center py-3 bg-[#F0EEE5] rounded-[10px] border border-transparent hover:border-[#65645F] focus:border-[#65645F] focus:ring-1 focus:ring-[#65645F] outline-none transition-all">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Google</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center py-3 bg-[#F0EEE5] rounded-[10px] border border-transparent hover:border-[#65645F] focus:border-[#65645F] focus:ring-1 focus:ring-[#65645F] outline-none transition-all">
                            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Facebook</span>
                        </button>
                    </div>

                    <p className="text-center text-sm text-[#65645F] font-medium mt-6">
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="text-[#406D5E] font-bold hover:underline">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    ); 
}
