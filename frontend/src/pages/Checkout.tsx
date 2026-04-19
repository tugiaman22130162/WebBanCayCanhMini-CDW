import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

// Mock data for the order summary
const cartItems = [
    {
        id: 1,
        name: "Terrarium Forest Mini",
        price: 120000,
        image: "/images/terrarium.png",
        quantity: 1,
    },
    {
        id: 2,
        name: "Sen đá mix color",
        price: 25000,
        image: "/images/sen_da.webp",
        quantity: 2,
    },
];

export default function Checkout() {
    const [shippingAddress, setShippingAddress] = useState("home");
    const [shippingMethod, setShippingMethod] = useState("standard");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [productPromoCode, setProductPromoCode] = useState("");
    const [shippingPromoCode, setShippingPromoCode] = useState("");
    const [productDiscount, setProductDiscount] = useState(0);
    const [shippingDiscount, setShippingDiscount] = useState(0);

    // State mới cho Modal mã khuyến mãi
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [searchPromo, setSearchPromo] = useState("");
    const [manualPromoCode, setManualPromoCode] = useState("");

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = shippingMethod === "standard" ? 30000 : 0;
    const total = Math.max(0, subtotal + shippingFee - productDiscount - shippingDiscount);

    const handleApplyPromo = (code: string) => {
        if (!code.trim()) return;
        const upperCode = code.toUpperCase();
        
        if (upperCode === "MINIGARDEN10") {
            setProductPromoCode(upperCode);
            setProductDiscount(subtotal * 0.1); // Giảm giá 10%
            setManualPromoCode("");
            setIsPromoModalOpen(false);
        } else if (upperCode === "FREESHIP") {
            setShippingPromoCode(upperCode);
            setShippingDiscount(shippingFee); // Giảm tối đa bằng phí vận chuyển
            setManualPromoCode("");
            setIsPromoModalOpen(false);
        } else {
            alert("Mã giảm giá không hợp lệ!");
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#F8F9F5] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                {/* Back to Cart Link */}
                <div className="mb-8">
                    <Link to="/cart" className="inline-flex items-center gap-2 text-[#406D5E] font-bold group">
                        <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">
                            arrow_back
                        </span>
                        <span>Quay lại giỏ hàng</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Side: Shipping & Payment */}
                    <div className="lg:col-span-7 space-y-8">
                        
                        {/* 1. Shipping Address */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#406D5E]">Địa chỉ giao hàng</h2>
                                <button className="flex items-center gap-2 text-sm font-semibold text-[#406D5E] hover:text-[#2f5146]">
                                    <span className="material-symbols-outlined">add</span>
                                    Nhập địa chỉ
                                </button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Home Address */}
                                <label className="relative cursor-pointer">
                                    <input type="radio" name="shippingAddress" value="home" checked={shippingAddress === "home"} onChange={(e) => setShippingAddress(e.target.value)} className="absolute opacity-0 w-0 h-0" />
                                    <div className={`p-4 rounded-lg border-2 transition-all ${shippingAddress === 'home' ? 'border-[#406D5E] bg-[#E8F1EE]' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-gray-800 flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined">home</span>
                                                Nhà riêng
                                            </div>
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
                                                {shippingAddress === 'home' && <div className="w-3 h-3 rounded-full bg-[#406D5E]"></div>}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">Nguyễn Văn A</p>
                                        <p className="text-sm text-gray-600">123 Đường ABC, Phường 1, Quận 2, TP. HCM</p>
                                        <p className="text-sm text-gray-600">0987654321</p>
                                    </div>
                                </label>
                                {/* Other Address */}
                                <label className="relative cursor-pointer">
                                    <input type="radio" name="shippingAddress" value="other" checked={shippingAddress === "other"} onChange={(e) => setShippingAddress(e.target.value)} className="absolute opacity-0 w-0 h-0" />
                                    <div className={`p-4 rounded-lg border-2 transition-all ${shippingAddress === 'other' ? 'border-[#406D5E] bg-[#E8F1EE]' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-gray-800 flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined">apartment</span>
                                                Địa chỉ khác
                                            </div>
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
                                                {shippingAddress === 'other' && <div className="w-3 h-3 rounded-full bg-[#406D5E]"></div>}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">Trần Thị B</p>
                                        <p className="text-sm text-gray-600">456 Đường XYZ, Phường 3, Quận 4, TP. HCM</p>
                                        <p className="text-sm text-gray-600">0123456789</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* 2. Shipping Method */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold text-[#406D5E] mb-4">Phương thức giao hàng</h2>
                            <div className="space-y-4">
                                <label className="relative flex items-center cursor-pointer">
                                    <input type="checkbox" checked={shippingMethod === "standard"} onChange={(e) => setShippingMethod(e.target.checked ? "standard" : "")} className="absolute opacity-0 w-0 h-0" />
                                    <div className={`w-full flex justify-between items-center p-4 rounded-lg border-2 transition-all ${shippingMethod === 'standard' ? 'border-[#406D5E] bg-[#E8F1EE]' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${shippingMethod === 'standard' ? 'border-[#406D5E] bg-[#406D5E]' : 'border-gray-400 bg-white'}`}>
                                                {shippingMethod === 'standard' && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Giao hàng tiêu chuẩn</p>
                                                <p className="text-sm text-gray-500">Dự kiến 2-4 ngày</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-gray-800">30.000đ</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* 3. Payment Method */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold text-[#406D5E] mb-4">Phương thức thanh toán</h2>
                            <div className="space-y-4">
                                <label className="relative flex items-center cursor-pointer">
                                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} className="absolute opacity-0 w-0 h-0" />
                                    <div className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'cod' ? 'border-[#406D5E] bg-[#E8F1EE]' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                                            {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-[#406D5E]"></div>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[#406D5E]">payments</span>
                                            <p className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                                        </div>
                                    </div>
                                </label>
                                <label className="relative flex items-center cursor-pointer">
                                    <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === "vnpay"} onChange={(e) => setPaymentMethod(e.target.value)} className="absolute opacity-0 w-0 h-0" />
                                    <div className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'vnpay' ? 'border-[#406D5E] bg-[#E8F1EE]' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                                            {paymentMethod === 'vnpay' && <div className="w-3 h-3 rounded-full bg-[#406D5E]"></div>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Bạn cần đảm bảo có file logo VNPAY tại đường dẫn này */}
                                            <img src="/images/vnpay_logo.png" alt="VNPAY" className="w-8 h-8 object-contain" />
                                            <p className="font-semibold text-gray-800">Thanh toán qua VNPAY</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-28">
                            <h2 className="text-xl font-bold text-[#406D5E] mb-6 border-b pb-4">Tóm tắt đơn hàng</h2>
                            
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-[10px] object-cover" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                            <p className="text-gray-500 text-sm">
                                                {item.price.toLocaleString('vi-VN')}đ <span className="mx-1 text-gray-400">x</span> {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-800 text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t my-6"></div>

                            {/* Promo Code */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-gray-700 text-sm">Mã khuyến mãi</p>
                                    <button onClick={() => setIsPromoModalOpen(true)} className="text-[#406D5E] text-sm font-semibold hover:underline flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">local_activity</span>
                                        Chọn mã
                                    </button>
                                </div>
                                
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={manualPromoCode}
                                        onChange={(e) => setManualPromoCode(e.target.value)}
                                        placeholder="Nhập mã giảm giá..."
                                        className="w-full px-4 py-2 bg-gray-100 rounded-lg border-transparent focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] outline-none transition-colors text-sm"
                                    />
                                    <button onClick={() => handleApplyPromo(manualPromoCode)} className="px-4 py-2 bg-[#406D5E] text-white font-semibold rounded-lg hover:bg-[#2f5146] transition-colors text-sm whitespace-nowrap">
                                        Áp dụng
                                    </button>
                                </div>

                                {/* Vùng hiển thị mã đã áp dụng */}
                                {(productPromoCode || shippingPromoCode) && (
                                    <div className="space-y-2 mt-3">
                                        {productPromoCode && (
                                            <div className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                                                <div className="flex items-center gap-2 text-emerald-700">
                                                    <span className="material-symbols-outlined text-[16px]">redeem</span>
                                                    <span className="text-sm font-semibold">{productPromoCode}</span>
                                                </div>
                                                <button onClick={() => { setProductPromoCode(""); setProductDiscount(0); }} className="text-emerald-700 hover:text-red-500 material-symbols-outlined text-[18px]">close</button>
                                            </div>
                                        )}
                                        {shippingPromoCode && (
                                            <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                                <div className="flex items-center gap-2 text-blue-700">
                                                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                                                    <span className="text-sm font-semibold">{shippingPromoCode}</span>
                                                </div>
                                                <button onClick={() => { setShippingPromoCode(""); setShippingDiscount(0); }} className="text-blue-700 hover:text-red-500 material-symbols-outlined text-[18px]">close</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t my-6 pt-6 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                                </div>
                                {productDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá sản phẩm</span>
                                        <span>- {productDiscount.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                )}
                                {shippingDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá vận chuyển</span>
                                        <span>- {shippingDiscount.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg text-gray-800">
                                    <span>Tổng cộng</span>
                                    <span>{total.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>

                            <button className="w-full py-3 mt-4 bg-[#406D5E] hover:bg-[#2f5146] text-white font-bold rounded-xl transition-colors shadow-md">
                                Đặt hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Modal Chọn Mã Khuyến Mãi */}
            {isPromoModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-bold text-lg text-[#406D5E]">Mã Khuyến Mãi</h3>
                            <button onClick={() => setIsPromoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-4 border-b bg-gray-50">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Tìm mã khuyến mãi..." 
                                    value={searchPromo}
                                    onChange={(e) => setSearchPromo(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Shipping Promos */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500 text-[18px]">local_shipping</span>
                                    Mã miễn phí vận chuyển
                                </h4>
                                <div className="space-y-3">
                                    <div className="border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => handleApplyPromo("FREESHIP")}>
                                        <div className="bg-blue-100 p-2 rounded-lg"><span className="material-symbols-outlined text-blue-600">local_shipping</span></div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm">FREESHIP</p>
                                            <p className="text-xs text-gray-500">Miễn phí giao hàng (Tối đa 30k)</p>
                                        </div>
                                        <button className="px-3 py-1.5 bg-[#406D5E] text-white text-xs font-bold rounded-lg hover:bg-[#2f5146]">Áp dụng</button>
                                    </div>
                                </div>
                            </div>

                            {/* Product Promos */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">redeem</span>
                                    Mã giảm giá sản phẩm
                                </h4>
                                <div className="space-y-3">
                                    <div className="border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => handleApplyPromo("MINIGARDEN10")}>
                                        <div className="bg-emerald-100 p-2 rounded-lg"><span className="material-symbols-outlined text-emerald-600">percent</span></div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm">MINIGARDEN10</p>
                                            <p className="text-xs text-gray-500">Giảm 10% giá trị sản phẩm</p>
                                        </div>
                                        <button className="px-3 py-1.5 bg-[#406D5E] text-white text-xs font-bold rounded-lg hover:bg-[#2f5146]">Áp dụng</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}