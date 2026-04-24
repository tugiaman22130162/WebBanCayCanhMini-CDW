import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [formData, setFormData] = useState({
        email: "",
    });
    const [errors, setErrors] = useState({
        email: "",
    });

    const validateForm = () => {
        let newErrors = { email: "" };
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email không đúng định dạng.";
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // gửi dữ liệu email lên server
            console.log("Dữ liệu email:", formData);
        }
    };

    return (
        <div className="min-h-screen bg-[#222] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

            {/* Ảnh nền cover toàn màn hình */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/bg_forgot.png"
                    alt="Background forgot password"
                    className="w-full h-full object-cover object-center"
                />
                {/* Lớp phủ tối mờ để tạo chiều sâu và nổi bật form */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>

            {/* Container: Form quên mật khẩu nổi lên giữa màn hình */}
            <div className="relative z-10 w-full max-w-lg bg-white px-8 py-12 md:px-10 md:py-16 min-h-[450px] flex flex-col justify-center rounded-[24px] shadow-2xl">
                    <Link to="/login" className="absolute top-8 left-8 md:top-10 md:left-10 text-gray-400 hover:text-primary transition-colors group" title="Quay lại đăng nhập">
                        <span className="material-symbols-outlined text-primary text-[28px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    </Link>

                    <h1 className="text-4xl font-bold text-center text-primary mb-3">
                        Quên Mật Khẩu?
                    </h1>
                    <p className="text-center text-[#65645F] mb-12 text-sm px-4">
                        Nhập email của bạn để nhận liên kết khôi phục mật khẩu.
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
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 mt-12 bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">                                               
                            Gửi yêu cầu
                        </button>
                    </form>
            </div>
        </div>
    );
}
