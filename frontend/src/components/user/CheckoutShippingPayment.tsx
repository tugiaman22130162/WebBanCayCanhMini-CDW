import React from "react";

interface CheckoutShippingPaymentProps {
    shippingServices: any[];
    selectedServiceId: number;
    setSelectedServiceId: (id: number) => void;
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    apiShippingFee: number | null;
    estimatedDelivery: string;
    isCalculatingFee: boolean;
}

export default function CheckoutShippingPayment({
    shippingServices, selectedServiceId, setSelectedServiceId,
    paymentMethod, setPaymentMethod, apiShippingFee, estimatedDelivery, isCalculatingFee
}: CheckoutShippingPaymentProps) {

    // Đổi tên dịch vụ GHN sang tên thân thiện với người dùng
    const getServiceName = (shortName: string) => {
        if (!shortName) return "Giao hàng";

        const name = shortName.toLowerCase();

        if (name.includes("nhanh")) return "Giao hàng nhanh";

        return "Giao hàng tiêu chuẩn";
    }

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-[#406D5E] mb-4">Phương thức giao hàng</h2>
                <div className="space-y-4">
                    {shippingServices.length > 0 ? (
                        shippingServices.map((service: any) => (
                            <div key={service.service_id} className="w-full flex justify-between items-center p-4 rounded-lg border-2 border-[#406D5E] bg-[#E8F1EE] transition-all">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-800">{getServiceName(service.short_name)}</p>
                                        <p className="text-sm text-gray-500">
                                            Dự kiến: {isCalculatingFee ? "Đang tính toán..." : estimatedDelivery}
                                        </p>
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-800 flex items-center gap-1">
                                    {isCalculatingFee || apiShippingFee === null ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[16px] text-gray-500">
                                                autorenew
                                            </span>
                                            <span>Đang tính...</span>
                                        </>
                                    ) : (
                                        `${apiShippingFee.toLocaleString('vi-VN')}đ`
                                    )}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50 text-red-600 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                                <div>
                                    <p className="font-semibold text-red-800">Không hỗ trợ giao hàng</p>
                                    <p className="text-sm">
                                        {estimatedDelivery || "Khu vực này hiện không có tuyến giao hàng."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-[#406D5E] mb-4">Phương thức thanh toán</h2>
                <div className="space-y-4">
                    <label className="relative flex items-center cursor-pointer">
                        <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} className="absolute opacity-0 w-0 h-0" />
                        <div className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'cod' ? 'border-[#406D5E] bg-[#E8F1EE]' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                            <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">{paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-[#406D5E]"></div>}</div>
                            <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#406D5E]">payments</span><p className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</p></div>
                        </div>
                    </label>
                    <label className="relative flex items-center cursor-pointer">
                        <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === "vnpay"} onChange={(e) => setPaymentMethod(e.target.value)} className="absolute opacity-0 w-0 h-0" />
                        <div className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'vnpay' ? 'border-[#406D5E] bg-[#E8F1EE]' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                            <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">{paymentMethod === 'vnpay' && <div className="w-3 h-3 rounded-full bg-[#406D5E]"></div>}</div>
                            <div className="flex items-center gap-3"><img src="https://vinadesign.vn/uploads/thumbnails/800/2023/05/vnpay-logo-vinadesign-25-12-59-16.jpg" alt="VNPAY" className="w-8 h-8 object-contain" /><p className="font-semibold text-gray-800">Thanh toán qua VNPAY</p></div>
                        </div>
                    </label>
                </div>
            </div>
        </>
    );
}