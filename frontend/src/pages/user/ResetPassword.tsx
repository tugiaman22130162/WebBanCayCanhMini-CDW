import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({
        password: "",
        confirmPassword: "",
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Đường dẫn không hợp lệ!',
                text: 'Không tìm thấy mã xác thực. Vui lòng kiểm tra lại đường dẫn trong email.',
            }).then(() => {
                navigate("/forgot-password");
            });
        }
    }, [token, navigate]);

    const validateForm = () => {
        let newErrors = { password: "", confirmPassword: "" };
        let isValid = true;

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
        if (errors[e.target.name as keyof typeof errors]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm() && token) {
            setIsLoading(true);
            try {
                const response = await axios.post(`http://localhost:8080/api/auth/reset-password`, null, {
                    params: {
                        token: token,
                        newPassword: formData.password
                    }
                });
                showSuccessToast(response.data.message || 'Đặt lại mật khẩu thành công!', 2000).then(() => {
                    navigate("/login");
                });
            } catch (error: any) {
                showErrorToast(
                    error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau!',
                    3000
                );
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#222] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="/images/bg_forgot.png" alt="Background reset password" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg bg-white px-8 py-12 md:px-10 md:py-16 flex flex-col justify-center rounded-[24px] shadow-2xl">
                <h1 className="text-4xl font-bold text-center text-primary mb-3">Tạo Mật Khẩu Mới</h1>
                <p className="text-center text-[#65645F] mb-10 text-sm px-4">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Input Mật khẩu mới */}
                    <div>
                        <label className="block text-sm text-[#65645F] font-bold mb-1">Mật khẩu mới</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="***" className={`w-full pl-12 pr-12 py-3 bg-info-bg rounded-[10px] border ${errors.password ? 'border-red-500' : 'border-transparent hover:border-[#006c49] focus:border-[#006c49]'} outline-none transition-all`} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#406D5E]">
                                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                    </div>

                    {/* Input Xác nhận mật khẩu */}
                    <div>
                        <label className="block text-sm text-[#65645F] font-bold mb-1">Xác nhận mật khẩu mới</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="***" className={`w-full pl-12 pr-12 py-3 bg-info-bg rounded-[10px] border ${errors.confirmPassword ? 'border-red-500' : 'border-transparent hover:border-[#006c49] focus:border-[#006c49]'} outline-none transition-all`} required />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#406D5E]">
                                <span className="material-symbols-outlined">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-2 py-4 mt-8 bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold rounded-full shadow-md transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:scale-[1.02]'}`}>
                        {isLoading ? <span className="material-symbols-outlined animate-spin">autorenew</span> : null}
                        {isLoading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
}