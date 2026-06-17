import React, { useState, useEffect } from "react";
import axios from "axios";

interface CheckoutPromotionProps {
    cartItems: any[];
    subtotal: number;
    shippingFee: number;
    productPromoCode: string;
    shippingPromoCode: string;
    setProductPromoCode: (code: string) => void;
    setShippingPromoCode: (code: string) => void;
    setProductDiscount: (discount: number) => void;
    setShippingDiscount: (discount: number) => void;
    showToast: (icon: 'success' | 'error' | 'warning', title: string) => void;
}

export default function CheckoutPromotion({
    cartItems, subtotal, shippingFee, productPromoCode, shippingPromoCode,
    setProductPromoCode, setShippingPromoCode, setProductDiscount, setShippingDiscount, showToast
}: CheckoutPromotionProps) {
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [searchPromo, setSearchPromo] = useState("");
    const [manualPromoCode, setManualPromoCode] = useState("");
    const [promotions, setPromotions] = useState<any[]>([]);

    // Gọi API kiểm tra và lấy danh sách khuyến mãi hợp lệ từ Backend
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.post("http://localhost:8080/api/promotions/applicable", {
                    cartItems,
                    totalPrice: subtotal,
                    shippingFee
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPromotions(response.data.filter((p: any) => !p.quantity || p.quantity - (p.usedCount || 0) > 0));
            } catch (error) {
                console.error("Lỗi lấy danh sách khuyến mãi:", error);
            }
        };
        fetchPromotions();
    }, [cartItems, subtotal, shippingFee]);

    const handleApplyPromo = (code: string) => {
        if (!code?.trim()) return;
        const upperCode = code.trim().toUpperCase();
        
        const promo = promotions.find(p => p.name.toUpperCase() === upperCode);

        if (promo) {
            if (promo.isDisabled) {
                showToast('warning', `Không thể áp dụng: ${promo.invalidReason}`);
                return;
            }

            // Tính toán số tiền được giảm
            let discountAmount = 0;
            let applicableValueForDiscount = subtotal;

            // Nếu áp dụng cho 1 sản phẩm cụ thể, chỉ tính giảm giá trên giá trị của sản phẩm đó
            if (promo.type === 'PRODUCT' && promo.targetId) {
                applicableValueForDiscount = cartItems.filter(item => (item.productId === promo.targetId || item.id === promo.targetId || item.product?.id === promo.targetId))
                                           .reduce((sum, item) => sum + (item.price || item.product?.price || 0) * item.quantity, 0);
            } else if (promo.type === 'CATEGORY' && promo.targetId) {
                const categoryItems = cartItems.filter(item => (item.categoryId === promo.targetId || item.category?.id === promo.targetId || item.product?.categoryId === promo.targetId || item.product?.category?.id === promo.targetId));
                if (categoryItems.length > 0) {
                     applicableValueForDiscount = categoryItems.reduce((sum, item) => sum + (item.price || item.product?.price || 0) * item.quantity, 0);
                }
            }

            if (promo.discountType === 'PERCENTAGE') {
                if (promo.type === 'SHIPPING') {
                    // Nếu là mã vận chuyển tính theo %, tính dựa trên phí vận chuyển
                    discountAmount = shippingFee * (promo.discountValue / 100);
                } else {
                    discountAmount = applicableValueForDiscount * (promo.discountValue / 100);
                }
                // Nếu có giới hạn giảm tối đa
                if (promo.maxDiscountValue > 0 && discountAmount > promo.maxDiscountValue) {
                    discountAmount = promo.maxDiscountValue;
                }
            } else if (promo.discountType === 'FIXED_AMOUNT') {
                discountAmount = promo.discountValue;
            } else if (promo.discountType === 'FREE' && promo.type === 'SHIPPING') {
                discountAmount = shippingFee;
                if (promo.maxDiscountValue > 0 && discountAmount > promo.maxDiscountValue) {
                    discountAmount = promo.maxDiscountValue;
                }
            }

            // Đảm bảo không giảm lố tiền tương ứng (chống ra số âm)
            if (promo.type === 'SHIPPING') {
                if (discountAmount > shippingFee) discountAmount = shippingFee;
            } else {
                if (discountAmount > applicableValueForDiscount) discountAmount = applicableValueForDiscount;
            }

            // Áp dụng giảm giá
            if (promo.type === 'SHIPPING') {
                setShippingPromoCode(upperCode);
                setShippingDiscount(discountAmount);
                showToast('success', 'Áp dụng mã vận chuyển thành công!');
            } else {
                setProductPromoCode(upperCode);
                setProductDiscount(discountAmount);
                showToast('success', 'Áp dụng mã giảm giá thành công!');
            }
            
            setManualPromoCode("");
            setIsPromoModalOpen(false);
        } else {
            // Fallback (Dự phòng) mã cứng nếu Backend chưa có dữ liệu
            if (upperCode === "MINIGARDEN10") {
                setProductPromoCode(upperCode);
                setProductDiscount(subtotal * 0.1); 
                setManualPromoCode("");
                setIsPromoModalOpen(false);
                showToast('success', 'Áp dụng mã giảm giá thành công!');
            } else if (upperCode === "FREESHIP") {
                setShippingPromoCode(upperCode);
                setShippingDiscount(shippingFee);
                setManualPromoCode("");
                setIsPromoModalOpen(false);
                showToast('success', 'Áp dụng mã Freeship thành công!');
            } else {
                showToast('error', 'Mã giảm giá không hợp lệ hoặc đã hết hạn!');
            }
        }
    };

    // Dùng để Render danh sách phân loại
    const filteredPromos = promotions.filter(p => p.name.toLowerCase().includes(searchPromo.toLowerCase()) || p.description?.toLowerCase().includes(searchPromo.toLowerCase()));
    const shippingPromos = filteredPromos.filter(p => p.type === 'SHIPPING');
    const productPromos = filteredPromos.filter(p => p.type !== 'SHIPPING');

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-gray-700 text-sm">Mã khuyến mãi</p>
                    <button onClick={() => setIsPromoModalOpen(true)} className="text-[#406D5E] text-sm font-semibold hover:text-[#2f5146] transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">local_activity</span> Chọn mã
                    </button>
                </div>
                
                <div className="flex gap-2">
                    <input type="text" value={manualPromoCode} onChange={(e) => setManualPromoCode(e.target.value)} placeholder="Nhập mã giảm giá..." className="w-full px-4 py-2 bg-gray-100 rounded-lg border-transparent focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] outline-none transition-colors text-sm" />
                    <button onClick={() => handleApplyPromo(manualPromoCode)} className="px-4 py-2 rounded-lg text-sm whitespace-nowrap bg-primary text-white font-semibold hover:bg-primary-container hover:scale-[1.02] active:scale-95 transition-all shadow-md">Áp dụng</button>
                </div>

                {(productPromoCode || shippingPromoCode) && (
                    <div className="space-y-2 mt-3">
                        {productPromoCode && (
                            <div className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                                <div className="flex items-center gap-2 text-emerald-700"><span className="material-symbols-outlined text-[16px]">redeem</span><span className="text-sm font-semibold">{productPromoCode}</span></div>
                                <button onClick={() => { setProductPromoCode(""); setProductDiscount(0); }} className="text-emerald-700 hover:text-red-500 material-symbols-outlined text-[18px]">close</button>
                            </div>
                        )}
                        {shippingPromoCode && (
                            <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 text-blue-700"><span className="material-symbols-outlined text-[16px]">local_shipping</span><span className="text-sm font-semibold">{shippingPromoCode}</span></div>
                                <button onClick={() => { setShippingPromoCode(""); setShippingDiscount(0); }} className="text-blue-700 hover:text-red-500 material-symbols-outlined text-[18px]">close</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isPromoModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-50 duration-300">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-bold text-lg text-[#406D5E]">Mã Khuyến Mãi</h3>
                            <button onClick={() => setIsPromoModalOpen(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-4 border-b bg-gray-50">
                            <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span><input type="text" placeholder="Tìm mã khuyến mãi..." value={searchPromo} onChange={(e) => setSearchPromo(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] outline-none text-sm" /></div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {shippingPromos.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500 text-[18px]">local_shipping</span>
                                        Mã miễn phí vận chuyển
                                    </h4>
                                    <div className="space-y-3">
                                        {shippingPromos.map((promo: any) => {
                                            const invalidReason = promo.invalidReason;
                                            const isDisabled = promo.isDisabled;
                                            const isApplied = promo.name === shippingPromoCode;
                                            return (
                                                <div key={promo.id} className={`border rounded-xl p-3 flex items-center gap-3 transition-colors ${isDisabled ? 'border-gray-100 bg-gray-50 opacity-70' : isApplied ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 cursor-pointer'}`} onClick={() => !isDisabled && !isApplied && handleApplyPromo(promo.name)}>
                                                    <div className={`p-2 rounded-lg ${isDisabled ? 'bg-gray-200' : 'bg-blue-100'}`}><span className={`material-symbols-outlined ${isDisabled ? 'text-gray-400' : 'text-blue-600'}`}>local_shipping</span></div>
                                                    <div className="flex-1">
                                                        <p className={`font-bold text-sm uppercase ${isDisabled ? 'text-gray-500' : 'text-gray-800'}`}>{promo.name}</p>
                                                        <p className="text-xs text-gray-500">{promo.description}</p>
                                                        {isDisabled && <p className="text-[10px] text-red-500 font-medium mt-0.5">{invalidReason}</p>}
                                                    </div>
                                                    <button disabled={isDisabled || isApplied} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : isApplied ? 'bg-gray-200 text-gray-500 cursor-default' : 'bg-[#406D5E] text-white hover:bg-[#2f5146]'}`}>
                                                        {isApplied ? 'Đã áp dụng' : 'Áp dụng'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {productPromos.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-500 text-[18px]">redeem</span>
                                        Mã giảm giá sản phẩm
                                    </h4>
                                    <div className="space-y-3">
                                        {productPromos.map((promo: any) => {
                                            const invalidReason = promo.invalidReason;
                                            const isDisabled = promo.isDisabled;
                                            const isApplied = promo.name === productPromoCode;
                                            return (
                                                <div key={promo.id} className={`border rounded-xl p-3 flex items-center gap-3 transition-colors ${isDisabled ? 'border-gray-100 bg-gray-50 opacity-70' : isApplied ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 cursor-pointer'}`} onClick={() => !isDisabled && !isApplied && handleApplyPromo(promo.name)}>
                                                    <div className={`p-2 rounded-lg ${isDisabled ? 'bg-gray-200' : 'bg-emerald-100'}`}><span className={`material-symbols-outlined ${isDisabled ? 'text-gray-400' : 'text-emerald-600'}`}>percent</span></div>
                                                    <div className="flex-1">
                                                        <p className={`font-bold text-sm uppercase ${isDisabled ? 'text-gray-500' : 'text-gray-800'}`}>{promo.name}</p>
                                                        <p className="text-xs text-gray-500">{promo.description}</p>
                                                        {isDisabled && <p className="text-[10px] text-red-500 font-medium mt-0.5">{invalidReason}</p>}
                                                    </div>
                                                    <button disabled={isDisabled || isApplied} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : isApplied ? 'bg-gray-200 text-gray-500 cursor-default' : 'bg-[#406D5E] text-white hover:bg-[#2f5146]'}`}>
                                                        {isApplied ? 'Đã áp dụng' : 'Áp dụng'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {filteredPromos.length === 0 && (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    Không có mã khuyến mãi nào khả dụng.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}