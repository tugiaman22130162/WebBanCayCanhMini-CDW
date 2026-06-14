import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { showSuccessToast } from "../../utils/ToastUtils";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function OAuth2Success() {
    const navigate = useNavigate();
    const location = useLocation();
    const hasProcessed = useRef(false);
    const { login } = useAuth();

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const role = params.get("role");

        if (token) {
            axios.get("http://localhost:8080/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            }).then(response => {
                login(token, response.data);

                const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";
                localStorage.removeItem("redirectAfterLogin"); 

                const userRole = response.data.role || role;

                const provider = localStorage.getItem("socialProvider");
                const providerName = provider === "facebook" ? "Facebook" : (provider === "google" ? "Google" : "");
                localStorage.removeItem("socialProvider");

                showSuccessToast(
                    providerName ? `Đăng nhập ${providerName} thành công!` : 'Đăng nhập thành công!',
                    1500
                ).then(() => {
                    if (userRole === "ADMIN") {
                        window.location.href = "/admin/dashboard"; 
                    } else {
                        navigate(redirectUrl);
                    }
                });
            }).catch(error => {
                console.error("Lỗi xác thực người dùng:", error);
                navigate("/login");
            });
        } else {
            navigate("/login");
        }
    }, [location, navigate, login]);

    return (
        <div className="min-h-screen bg-[#222] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[24px] shadow-2xl flex flex-col items-center gap-4 min-w-[300px]">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                <h2 className="text-xl font-bold text-gray-800">Đang xử lý đăng nhập...</h2>
            </div>
        </div>
    );
}