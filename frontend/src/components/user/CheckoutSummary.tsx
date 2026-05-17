import React from "react";
import CheckoutPromotion from "./CheckoutPromotion";

interface CheckoutSummaryProps {
    cartItems: any[];
    subtotal: number;
    shippingFee: number;
    productDiscount: number;
    shippingDiscount: number;
    total: number;
    productPromoCode: string;
    shippingPromoCode: string;
    setProductPromoCode: (code: string) => void;
    setShippingPromoCode: (code: string) => void;
    setProductDiscount: (discount: number) => void;
    setShippingDiscount: (discount: number) => void;
    showToast: (icon: 'success' | 'error' | 'warning', title: string) => void;
    onPlaceOrder?: () => void;
    isOrderDisabled?: boolean;
    note?: string;
    setNote?: (note: string) => void;
}

export default function CheckoutSummary({
    cartItems, subtotal, shippingFee, productDiscount, shippingDiscount, total,
    productPromoCode, shippingPromoCode, setProductPromoCode, setShippingPromoCode,
    setProductDiscount, setShippingDiscount, showToast, onPlaceOrder, isOrderDisabled,
    note, setNote
}: CheckoutSummaryProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-28">
            <h2 className="text-xl font-bold text-[#406D5E] mb-6 border-b pb-4">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4">
                {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                        <img src={item.image || item.product?.images?.[0]?.imageUrl || item.product?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=200&h=200&fit=crop"} alt={item.name || item.product?.name} className="w-16 h-16 rounded-[10px] object-cover" />
                        <div className="flex-1"><p className="font-semibold text-gray-800 text-sm">{item.name || item.product?.name}</p><p className="text-gray-500 text-sm">{(item.price || item.product?.price || 0).toLocaleString('vi-VN')}đ <span className="mx-1 text-gray-400">x</span> {item.quantity}</p></div>
                        <p className="font-semibold text-gray-800 text-sm">{((item.price || item.product?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</p>
                    </div>
                ))}
            </div>

            <div className="border-t my-6"></div>
            <CheckoutPromotion 
                cartItems={cartItems}
                subtotal={subtotal} 
                shippingFee={shippingFee} 
                productPromoCode={productPromoCode} 
                shippingPromoCode={shippingPromoCode} 
                setProductPromoCode={setProductPromoCode} 
                setShippingPromoCode={setShippingPromoCode} 
                setProductDiscount={setProductDiscount} 
                setShippingDiscount={setShippingDiscount} 
                showToast={showToast} 
            />

            {setNote && (
            <div className="border-t my-6 pt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú đơn hàng</label>
                <textarea
                    rows={2}
                    maxLength={200}
                    value={note || ""}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Lưu ý cho người bán (VD: Giao ngoài giờ hành chính...)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all resize-none font-medium text-sm text-gray-700"
                ></textarea>
                <p className="text-right text-xs text-gray-400 mt-1 font-medium">{(note || "").length}/200</p>
            </div>
            )}

            <div className="border-t my-6 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{subtotal.toLocaleString('vi-VN')}đ</span></div>
                <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span>{shippingFee.toLocaleString('vi-VN')}đ</span></div>
                {productDiscount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá sản phẩm</span><span>- {productDiscount.toLocaleString('vi-VN')}đ</span></div>}
                {shippingDiscount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá vận chuyển</span><span>- {shippingDiscount.toLocaleString('vi-VN')}đ</span></div>}
                <div className="flex justify-between font-bold text-lg text-gray-800"><span>Tổng cộng</span><span>{total.toLocaleString('vi-VN')}đ</span></div>
            </div>
            <button 
                onClick={onPlaceOrder}
                disabled={isOrderDisabled}
                className={`w-full py-3 mt-4 rounded-xl font-semibold transition-all shadow-md ${isOrderDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-container hover:scale-[1.02] active:scale-95'}`}
            >
                Đặt hàng
            </button>
        </div>
    );
}