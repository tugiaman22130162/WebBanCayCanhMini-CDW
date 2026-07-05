import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();

    const formData = location.state?.formData;
    const email = formData?.email || location.state?.email;
    const purpose = location.state?.purpose || 'REGISTER'; 

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!email) {
            Swal.fire({
                icon: 'error',
                title: 'Phiên không hợp lệ!',
                text: 'Vui lòng bắt đầu lại từ bước trước.',
            }).then(() => {
                navigate(purpose === 'REGISTER' ? "/register" : "/forgot-password");
            });
        }
    }, [email, navigate]);

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) {
            setError("Vui lòng nhập mã xác thực OTP.");
            return;
        }

        if (email) {
            setIsLoading(true);
            try {
                if (purpose === 'REGISTER') {
                    // Gửi toàn bộ thông tin đăng ký kèm OTP để backend tạo tài khoản
                    const registerPayload = { ...formData, otp: otp };
                    await axios.post(`http://localhost:8080/api/auth/register`, registerPayload);

                    showSuccessToast('Đăng ký tài khoản thành công!', 2000).then(() => {
                        navigate('/login');
                    });
                } else { // purpose === 'RESET_PASSWORD'
                    await axios.post(`http://localhost:8080/api/auth/verify-otp`, null, {
                        params: { email: email, otp: otp }
                    });
                    showSuccessToast('Mã OTP hợp lệ!', 2000);
                    navigate('/reset-password', { state: { email: email, otp: otp } });
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleResendOtp = async () => {
        if (email) {
            setIsResending(true);
            try {
                // REGISTER
                if (purpose === 'REGISTER') {
                    await axios.post(`http://localhost:8080/api/auth/request-register-otp?email=${email}`);
                } else { // purpose === 'RESET_PASSWORD'
                    await axios.post(`http://localhost:8080/api/auth/forgot-password?email=${email}`);
                }
                showSuccessToast('Đã gửi lại mã OTP thành công!', 2000);
            } catch (err: any) {
                showErrorToast(err.response?.data?.message || 'Không thể gửi lại mã OTP.', 2000);
            } finally {
                setIsResending(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
        if (error) {
            setError("");
        }
    };

    return (
        <div className="min-h-screen bg-[#222] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="/images/bg_forgot.png" alt="Background verify OTP" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg bg-white px-8 py-12 md:px-10 md:py-16 flex flex-col justify-center rounded-[24px] shadow-2xl">
                <Link to={purpose === 'REGISTER' ? "/register" : "/forgot-password"} className="absolute top-8 left-8 md:top-10 md:left-10 text-gray-400 hover:text-primary transition-colors group" title="Quay lại">
                    <span className="material-symbols-outlined text-primary text-[28px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                </Link>

                <h1 className="text-4xl font-bold text-center text-primary mb-3">Xác Thực OTP</h1>
                <p className="text-center text-[#65645F] mb-10 text-sm px-4">
                    Mã OTP đã được gửi đến <strong>{email}</strong>.<br/> Vui lòng kiểm tra email của bạn.
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
                    <div>
                        <label className="block text-sm text-[#65645F] font-bold mb-1">Mã xác thực OTP</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">dialpad</span>
                            <input type="text" name="otp" value={otp} onChange={handleChange} placeholder="Nhập mã OTP..." className={`w-full pl-12 pr-4 py-3 bg-info-bg rounded-[10px] border ${error ? 'border-red-500' : 'border-transparent hover:border-[#006c49] focus:border-[#006c49]'} outline-none transition-all`} required />
                        </div>
                        {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-2 py-4 mt-8 bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold rounded-full shadow-md transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:scale-[1.02]'}`}>
                        {isLoading ? <span className="material-symbols-outlined animate-spin">autorenew</span> : null}
                        {isLoading ? 'Đang kiểm tra...' : 'Xác nhận'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Không nhận được mã?{" "}
                    <button onClick={handleResendOtp} disabled={isResending} className="font-bold text-primary hover:font-semibold disabled:opacity-50 disabled:cursor-wait">
                        {isResending ? 'Đang gửi lại...' : 'Gửi lại mã'}
                    </button>
                </p>
            </div>
        </div>
    );
}