import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { showErrorToast } from "../../utils/ToastUtils";

export default function FeaturedDesigns() {
    const [designs, setDesigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get("http://localhost:8080/api/terrariums", { headers });
                
                const dataList = Array.isArray(response.data) ? response.data : [];
                // Lọc ra các thiết kế đã được duyệt hoặc đã mua (không hiển thị các bản sao/mua lại)
                const validDesigns = dataList
                    .filter((d: any) => (d.status === 'APPROVED' || d.status === 'ORDERED') && !d.userNote?.includes("Tôi muốn đặt mẫu thiết kế giống với Terrarium #"))
                    .slice(0, 4); // Lấy 4 thiết kế mới nhất
                setDesigns(validDesigns);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách thiết kế:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDesigns();
    }, []);

    const handleCloneDesign = async (design: any) => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập để gửi yêu cầu đặt thiết kế này!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy',
                customClass: {
                    confirmButton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-[#2f5146] transition-colors shadow-sm',
                    cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-gray-300 transition-colors shadow-sm'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
                }
            });
            return;
        }

        try {
            await axios.post(`http://localhost:8080/api/terrariums/${design.id}/clone`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire({
                icon: 'success',
                title: 'Đã gửi yêu cầu!',
                text: 'Yêu cầu đặt mẫu thiết kế này đã được gửi cho Admin duyệt. Bạn có thể xem trạng thái ở Bộ sưu tập thiết kế.',
                confirmButtonText: 'Xem bộ sưu tập',
                showCancelButton: true,
                cancelButtonText: 'Đóng',
                customClass: {
                    confirmButton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-[#2f5146] transition-colors shadow-sm',
                    cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-gray-300 transition-colors shadow-sm'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/builder?openModal=true');
                }
            });
        } catch (error: any) {
            console.error("Lỗi khi gửi yêu cầu:", error);
            showErrorToast(error.response?.data?.message || "Có lỗi xảy ra, không thể gửi yêu cầu.", 3000);
        }
    };

    if (!isLoading && designs.length === 0) return null;

    return (
        <section className="mt-[30px] py-10 px-8 bg-on-primary">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-end mb-16"
                >
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            Các thiết kế nổi bật
                        </h2>
                        <p className="text-gray-600">
                            Những tác phẩm Terrarium độc đáo từ cộng đồng MiniGarden
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/featured-designs"
                            className="px-6 py-2 rounded-full font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-all duration-300 flex items-center gap-2"
                        >
                            Xem tất cả
                        </Link>
                        <Link
                            to="/builder"
                            className="px-6 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-primary to-primary-container hover:scale-[1.02] shadow-md active:scale-95 transition-all duration-300 flex items-center gap-2 group"
                        >
                            Tự thiết kế ngay
                        </Link>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {designs.map((design, index) => (
                            <motion.div
                                key={design.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="group h-full flex flex-col border-[2px] border-gray-200 rounded-xl p-6 bg-white"
                            >
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-6 relative">
                                    <motion.img 
                                        src={design.userImage || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=400&h=400&fit=crop"} 
                                        alt={`Thiết kế #${design.id}`} 
                                        className="w-full h-full object-cover" 
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <span className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1 rounded-full pointer-events-none">
                                        Terrarium
                                    </span>
                                </div>
                                <div className="flex flex-col flex-grow gap-3">
                                    <h4 className="text-lg font-bold text-gray-800 line-clamp-1 hover:text-primary transition-colors cursor-pointer">Terrarium #{design.id}</h4>
                                    <p className="text-sm text-gray-500 font-medium line-clamp-1 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span> Tác giả: {design.user?.fullName || "Khách hàng"}</p>
                                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <p className="text-xl font-black text-primary leading-none">{design.totalPrice.toLocaleString('vi-VN')}đ</p>
                                        <button 
                                            onClick={() => handleCloneDesign(design)}
                                            className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors shrink-0"
                                            title="Gửi yêu cầu đặt mẫu này"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">send</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}