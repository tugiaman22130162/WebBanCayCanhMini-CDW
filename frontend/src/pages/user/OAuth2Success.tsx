import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { showSuccessToast } from "../../utils/ToastUtils";

export default function OAuth2Success() {
    const navigate = useNavigate();
    const location = useLocation();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Ngăn chặn useEffect bị gọi 2 lần trong React Strict Mode
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        // Lấy token từ URL (ví dụ: ?token=eyJhY2...)
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
            // Lưu token vào localStorage để sử dụng cho các API sau này
            localStorage.setItem("token", token);
            
            // Đọc URL chuyển hướng đã lưu từ trước và xóa ngay lập tức
            const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";
            localStorage.removeItem("redirectAfterLogin"); 

            // Lấy tên mạng xã hội để hiển thị thông báo chi tiết
            const provider = localStorage.getItem("socialProvider");
            const providerName = provider === "facebook" ? "Facebook" : (provider === "google" ? "Google" : "");
            localStorage.removeItem("socialProvider"); // Xóa sau khi đã lấy

            showSuccessToast(
                providerName ? `Đăng nhập ${providerName} thành công!` : 'Đăng nhập thành công!',
                1500
            ).then(() => {
                navigate(redirectUrl);
            });
        } else {
            navigate("/login");
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-[#222] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[24px] shadow-2xl flex flex-col items-center gap-4 min-w-[300px]">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                <h2 className="text-xl font-bold text-gray-800">Đang xử lý đăng nhập...</h2>
            </div>
        </div>
    );
}