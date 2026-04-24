import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function SuccessPayment() {
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

                    <div className="bg-emerald-50 rounded-xl p-5 mb-8 text-sm text-emerald-800 text-left border border-emerald-100">
                        <div className="flex justify-between mb-3 border-b border-emerald-200/50 pb-2">
                            <span className="font-semibold">Mã đơn hàng:</span>
                            <span className="font-bold">#MG-123456</span>
                        </div>
                        <div className="flex justify-between mb-3 border-b border-emerald-200/50 pb-2">
                            <span className="font-semibold">Phương thức:</span>
                            <span className="font-bold">Thanh toán khi nhận hàng (COD)</span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <span className="font-semibold">Tổng thanh toán:</span>
                            <span className="font-black text-lg text-emerald-600">450.000đ</span>
                        </div>
                    </div>

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
