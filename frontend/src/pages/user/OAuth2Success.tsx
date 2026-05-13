import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

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

            Swal.fire({
                toast: true,
                position: 'bottom',
                icon: 'success',
                title: 'Đăng nhập Google thành công!',
                timer: 1500,
                showConfirmButton: false,
                width: 'auto',
                padding: '0.5em 1em',
                customClass: {
                    popup: 'mb-6 rounded-full shadow-lg border border-gray-100',
                    title: 'text-sm font-bold text-gray-700',
                }
            }).then(() => {
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