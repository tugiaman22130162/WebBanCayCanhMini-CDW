import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function CancelPayment() {
    return (
        <MainLayout>
            <div className="min-h-[70vh] bg-[#F8F9F5] flex items-center justify-center p-4 py-12">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center animate-in zoom-in duration-500">
                    <div className="flex justify-center mb-6">
                        <span className="material-symbols-outlined text-[80px] text-red-500">
                            cancel
                        </span>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Đã hủy thanh toán!
                    </h1>
                    
                    <p className="text-gray-600 mb-8">
                        Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra trong quá trình xử lý.<br/>
                        Vui lòng kiểm tra lại giỏ hàng hoặc thử thanh toán lại.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
                        <Link to="/cart" className="px-8 py-3 bg-[#406D5E] text-white font-bold rounded-[24px] hover:bg-[#2f5146] transition-colors shadow-md">
                            Về giỏ hàng
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