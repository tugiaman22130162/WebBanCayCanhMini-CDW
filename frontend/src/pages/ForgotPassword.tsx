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
        <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 bg-[#FDFFDA]">

            {/* Container: Hình ảnh và Form quên mật khẩu */}
            <div className="flex flex-col md:flex-row w-full max-w-5xl min-h-[650px] shadow-2xl gap-[10px]">

                {/* Bên trái: Hình ảnh */}
                <div className="hidden md:block md:w-1/2 relative rounded-[10px] overflow-hidden">
                    <img
                        src="/images/bg_forgotpass.png"
                        alt="Background login"
                        className="absolute inset-0 w-full h-full"
                    />
                    {/*overlay */}
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Bên phải: Form quên mật khẩu*/}
                <div className="w-full md:w-1/2 bg-white p-8 md:p-12 rounded-[10px] flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-left text-[#406D5E] mb-2">
                        Quên Mật Khẩu?
                    </h2>
                    <p className="text-left text-[#65645F] mb-8 text-sm">
                        Nhập email của bạn để nhận liên kết khôi phục mật khẩu.
                    </p>


                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label className="block text-sm text-[#65645F] font-bold mb-1">
                                EMAIL
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="hello@minigarden.com"
                                    className={`w-full pl-4 pr-12 py-3 bg-[#F0EEE5] rounded-[10px] border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent hover:bg-[#B7E7D5]/20 focus:border-[#65645F] focus:ring-[#65645F]'} focus:ring-1 outline-none transition-all`}
                                    required
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    mail
                                </span>
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 mt-2 bg-[#406D5E] hover:bg-[#2f5146] text-white font-bold rounded-[24px] transition-colors shadow-md"
                        >
                            Gửi yêu cầu
                        </button>
                    </form>

                    <div className="mt-6">
                        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-[#406D5E] font-bold group">
                            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                            <span className="group-hover:underline">Quay lại đăng nhập</span>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
