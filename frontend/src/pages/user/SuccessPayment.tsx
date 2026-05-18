import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import axios from "axios";

export default function SuccessPayment() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        const fetchOrder = async (orderCode: string) => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8080/api/orders?keyword=${orderCode}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data && response.data.length > 0) {
                    setOrder(response.data[0]);
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin đơn hàng:", error);
            }
        };

        if (location.state && location.state.order) {
            setOrder(location.state.order);
        } else if (searchParams.get("vnp_TxnRef")) {
            const responseCode = searchParams.get("vnp_ResponseCode");
            if (responseCode === "00") {
                const orderCode = searchParams.get("vnp_TxnRef");
                if (orderCode) fetchOrder(orderCode);
                setOrder({
                    orderCode: orderCode,
                    paymentMethod: 'vnpay',
                    totalPrice: Number(searchParams.get("vnp_Amount") || 0) / 100,
                });
            } else {
                navigate("/cancel");
            }
        }
        window.scrollTo(0, 0);
    }, [location, searchParams, navigate]);

    return (
        <MainLayout>
            <div className="min-h-[70vh] bg-[#F8F9F5] flex items-center justify-center p-4 py-12">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center animate-in zoom-in duration-500">
                    <div className="flex justify-center mb-6">
                        <span className="material-symbols-outlined text-[80px] text-emerald-500">
                            check_circle
                        </span>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-[#406D5E] mb-4">
                        Đặt hàng thành công!
                    </h1>
                    
                    <p className="text-gray-600 mb-8">
                        Cảm ơn bạn đã mua sắm tại <span className="font-semibold text-[#406D5E]">MiniGarden</span>.<br/> 
                        Đơn hàng của bạn đã được ghi nhận và đang trong quá trình xử lý. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
                    </p>

                    {order && (
                        <div className="bg-emerald-50 rounded-xl p-5 mb-8 text-sm text-emerald-800 text-left border border-emerald-100">
                            <div className="flex justify-between mb-3 border-b border-emerald-200/50 pb-2">
                                <span className="font-semibold">Mã đơn hàng:</span>
                                <span className="font-normal text-black">#{order.orderCode}</span>
                            </div>
                            <div className="flex justify-between mb-3 border-b border-emerald-200/50 pb-2">
                                <span className="font-semibold">Phương thức:</span>
                                <span className="font-normal text-black">
                                    {order.paymentMethod?.toLowerCase() === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod?.toLowerCase() === 'vnpay' ? 'Thanh toán qua VNPAY' : order.paymentMethod}
                                </span>
                            </div>
                            {order.estimatedDeliveryTimeFrom && order.estimatedDeliveryTimeTo && (
                                <div className="flex justify-between mb-3 border-b border-emerald-200/50 pb-2">
                                    <span className="font-semibold">Dự kiến giao hàng:</span>
                                    <span className="font-normal text-black">
                                        {new Date(order.estimatedDeliveryTimeFrom).toLocaleDateString('vi-VN')} - {new Date(order.estimatedDeliveryTimeTo).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-3">
                                <span className="font-semibold">Tổng thanh toán:</span>
                                <span className="font-normal text-black">{order.totalPrice?.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
                        <Link to="/products" className="px-8 py-3 bg-[#406D5E] text-white font-bold rounded-[24px] hover:bg-[#2f5146] transition-colors shadow-md">
                            Tiếp tục mua sắm
                        </Link>
                        <Link to="/" className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-[24px] hover:bg-gray-200 transition-colors shadow-sm">
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
