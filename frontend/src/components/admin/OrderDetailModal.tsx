import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

interface OrderItem {
    id: number;
    product_name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface OrderDetail {
    id: number;
    orderCode: string;
    receiverName: string;
    phone: string;
    address: string;
    note: string;
    totalPrice: number;
    status: OrderStatus;
    createdAt: string;
    paymentMethod: string;
    items: OrderItem[];
    estimatedDeliveryTimeFrom?: string;
    estimatedDeliveryTimeTo?: string;
    promotions?: any[];
    shippingFee?: number;
    discountAmount?: number;
    paymentStatus?: string;
}

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number | null;
    onSuccess?: () => void;
}

const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'SHIPPING': return 'Đang giao';
        case 'DELIVERED': return 'Đã giao';
        case 'CANCELLED': return 'Đã hủy';
        default: return status;
    }
};

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'SHIPPING': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default function OrderDetailModal({ isOpen, onClose, orderId, onSuccess }: OrderDetailModalProps) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (isOpen && orderId) {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setOrder(response.data);
                setSelectedStatus(response.data.status);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi tải chi tiết đơn hàng:", error);
                setOrder(null);
                setIsLoading(false);
            });
        } else {
            setOrder(null);
            setIsEditingStatus(false);
        }
    }, [isOpen, orderId]);

    const handleUpdateStatus = async () => {
        if (!order || selectedStatus === order.status) return;
        
        let noteToAppend = "";
        if (selectedStatus === 'CANCELLED') {
            const { value: text, isConfirmed } = await Swal.fire({
                input: 'textarea',
                inputLabel: 'Lý do hủy đơn hàng',
                inputPlaceholder: 'Nhập lý do hủy ở đây...',
                inputAttributes: {
                    'aria-label': 'Nhập lý do hủy ở đây'
                },
                showCancelButton: true,
                confirmButtonText: 'Xác nhận hủy',
                cancelButtonText: 'Hủy',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Vui lòng nhập lý do hủy!'
                    }
                },
                customClass: {
                    input: 'overflow-y-auto resize-y [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full',
                    confirmButton: 'bg-red-500 text-white px-4 py-2 rounded-lg font-bold mx-2',
                    cancelButton: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold mx-2'
                },
                buttonsStyling: false
            });

            if (!isConfirmed) {
                return;
            }
            noteToAppend = text;
        }

        setIsUpdating(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8080/api/orders/${order.id}/status?status=${selectedStatus}${noteToAppend ? `&note=${encodeURIComponent(noteToAppend)}` : ''}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Cập nhật lại UI
            setOrder({ ...order, status: selectedStatus });
            setIsEditingStatus(false);
            showSuccessToast("Cập nhật trạng thái thành công!", 3000);
            
            if (onSuccess) onSuccess(); // Báo cho component cha tải lại danh sách đơn hàng
            onClose(); // Tự động đóng Modal sau khi lưu thành công
        } catch (error: any) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            showErrorToast(error.response?.data?.message || "Lỗi khi cập nhật trạng thái", 3000);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRefund = async () => {
        const result = await Swal.fire({
            title: 'Hoàn tiền cho khách?',
            text: `Xác nhận hoàn tiền về thẻ VNPAY cho đơn hàng ${order?.orderCode}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, Hoàn tiền',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 hover:bg-red-600 transition-colors shadow-sm',
                cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-2 hover:bg-gray-300 transition-colors shadow-sm'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                
                await axios.put(`http://localhost:8080/api/orders/${order?.id}/refund`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Đã thực hiện lệnh hoàn tiền qua VNPAY.',
                    confirmButtonText: 'Đóng',
                    customClass: {
                        confirmButton: 'bg-[#006c49] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#005236] transition-colors shadow-sm'
                    },
                    buttonsStyling: false
                });
                
                if (onSuccess) onSuccess(); // Báo cho component cha tải lại danh sách đơn hàng
                if (onClose) onClose();     // Đóng modal chi tiết
                
            } catch (error: any) {
                console.error("Lỗi khi hoàn tiền:", error);
                showErrorToast(error.response?.data?.message || 'Không thể hoàn tiền lúc này. Vui lòng kiểm tra lại.', 3000);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* HEADER */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng {order?.orderCode || `#${orderId}`}</h3>
                        {order && (
                            <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-500">
                                    Ngày đặt: {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} &nbsp; {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.estimatedDeliveryTimeFrom && order.estimatedDeliveryTimeTo && (
                                    <p className="text-sm text-gray-500">
                                        Dự kiến giao: <span className="font-semibold text-gray-800">{new Date(order.estimatedDeliveryTimeFrom).toLocaleDateString('vi-VN')} - {new Date(order.estimatedDeliveryTimeTo).toLocaleDateString('vi-VN')}</span>
                                    </p>
                                )}
                                {order.status === 'DELIVERED' && order.estimatedDeliveryTimeFrom && order.estimatedDeliveryTimeTo && (
                                    <p className="text-sm text-gray-500">
                                        Ngày nhận hàng: <span className="font-semibold text-gray-800">{new Date(order.estimatedDeliveryTimeFrom).toLocaleDateString('vi-VN')} - {new Date(order.estimatedDeliveryTimeTo).toLocaleDateString('vi-VN')}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                            <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                            <p>Đang tải thông tin đơn hàng...</p>
                        </div>
                    ) : !order ? (
                        <div className="flex justify-center items-center h-full text-red-500 font-semibold">
                            Không tìm thấy thông tin chi tiết của đơn hàng.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Trạng thái & Hành động */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700">Trạng thái:</span>
                                    {!isEditingStatus ? (
                                        <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    ) : (
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-gray-700"
                                        >
                                            <option value={order.status}>{getStatusLabel(order.status)}</option>
                                            {order.paymentMethod?.toUpperCase() === 'VNPAY' ? (
                                                order.status !== 'DELIVERED' && <option value="DELIVERED">Đã giao</option>
                                            ) : (
                                                <>
                                                    {order.status !== 'CONFIRMED' && <option value="CONFIRMED">Đã xác nhận</option>}
                                                    {order.status !== 'DELIVERED' && <option value="DELIVERED">Đã giao</option>}
                                                    {order.status === 'PENDING' && <option value="CANCELLED">Đã hủy</option>}
                                                </>
                                            )}
                                        </select>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {!isEditingStatus ? (
                                        <button 
                                            onClick={() => { setSelectedStatus(order.status); setIsEditingStatus(true); }} 
                                            className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-[#2f5146] transition-colors shadow-sm"
                                        >
                                            Cập nhật trạng thái
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={() => setIsEditingStatus(false)} disabled={isUpdating} className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm">
                                                Hủy
                                            </button>
                                            <button onClick={handleUpdateStatus} disabled={isUpdating || selectedStatus === order.status} className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-[#2f5146] transition-colors shadow-sm disabled:bg-gray-400">
                                                {isUpdating ? "Đang lưu..." : "Lưu"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Thông tin giao hàng */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                                    Thông tin giao hàng
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><p className="text-xs text-gray-500 uppercase font-bold mb-1">Người nhận</p><p className="font-semibold text-gray-800">{order.receiverName}</p></div>
                                    <div><p className="text-xs text-gray-500 uppercase font-bold mb-1">Số điện thoại</p><p className="font-semibold text-gray-800">{order.phone}</p></div>
                                    <div className="md:col-span-2"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Địa chỉ giao hàng</p><p className="font-semibold text-gray-800">{order.address}</p></div>
                                    <div className="md:col-span-2"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Ghi chú</p><p className="font-semibold text-gray-800 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm whitespace-pre-line">{order.note || "Không có ghi chú"}</p></div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Phương thức thanh toán</p>
                                        <p className="font-semibold text-gray-800">{order.paymentMethod?.toUpperCase() === 'VNPAY' ? 'Ví điện tử VNPAY' : 'Thanh toán khi nhận hàng (COD)'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Danh sách sản phẩm */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">shopping_basket</span>
                                    Sản phẩm đã đặt
                                </h4>
                                <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                            <tr><th className="text-left p-3 rounded-l-lg">Sản phẩm</th><th className="text-right p-3">Đơn giá</th><th className="text-center p-3">Số lượng</th><th className="text-right p-3 rounded-r-lg">Thành tiền</th></tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, index) => (
                                                <tr key={index} className="border-b border-gray-50 last:border-0"><td className="p-3 font-semibold text-gray-800">{item.product_name}</td><td className="p-3 text-right text-gray-600">{item.price.toLocaleString('vi-VN')}đ</td><td className="p-3 text-center font-bold text-gray-700">{item.quantity}</td><td className="p-3 text-right font-bold text-primary">{item.subtotal.toLocaleString('vi-VN')}đ</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {order.promotions && order.promotions.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {order.promotions.map((promo: any, idx: number) => {
                                            const isShipping = promo.promotionCode?.toUpperCase().includes('SHIP');
                                            // Tự động lấy phí ship (với mã vận chuyển) hoặc tổng giảm (với mã sản phẩm) nếu giá trị bị 0
                                            const discountVal = promo.discountAmount || promo.discount_amount || (isShipping ? order.shippingFee : order.discountAmount) || 0;
                                            return (
                                                <div key={idx} className={`flex justify-between items-center p-3.5 rounded-xl border ${isShipping ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                                    <div className={`flex items-center gap-2 ${isShipping ? 'text-blue-700' : 'text-emerald-700'}`}>
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {isShipping ? 'local_shipping' : 'local_activity'}
                                                        </span>
                                                        <span className="font-semibold text-sm">
                                                            {isShipping ? 'Mã vận chuyển:' : 'Mã giảm giá:'} <span className={`font-bold px-2 py-1 bg-white rounded-md ml-1 border shadow-sm ${isShipping ? 'border-blue-200' : 'border-emerald-200'}`}>{promo.promotionCode}</span>
                                                        </span>
                                                    </div>
                                                    <span className={`font-bold ${isShipping ? 'text-blue-700' : 'text-emerald-700'}`}>
                                                        -{discountVal.toLocaleString('vi-VN')}đ
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {/* Tổng tiền */}
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <div className="w-full md:w-1/2 flex flex-col space-y-2">
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span>Tạm tính:</span>
                                            <span className="font-semibold">{order.items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span>Phí vận chuyển:</span>
                                            <span className="font-semibold">
                                                {(() => {
                                                    const shippingPromo = order.promotions?.find((p: any) => p.promotionCode?.toUpperCase().includes('SHIP'));
                                                    const shippingPromoDiscount = shippingPromo ? (shippingPromo.discountAmount || shippingPromo.discount_amount || order.shippingFee || 0) : 0;
                                                    const displayShippingFee = order.shippingFee && order.shippingFee > 0 ? order.shippingFee : shippingPromoDiscount;
                                                    return displayShippingFee ? displayShippingFee.toLocaleString('vi-VN') + 'đ' : '0đ';
                                                })()}
                                            </span>
                                        </div>
                                        {order.promotions && order.promotions.length > 0 && (
                                            <div className="flex justify-between text-emerald-600 text-sm">
                                                <span>Tổng giảm giá:</span>
                                                <span className="font-semibold">
                                                    -{order.promotions.reduce((sum: number, p: any) => {
                                                        const isShipping = p.promotionCode?.toUpperCase().includes('SHIP');
                                                        const pDiscount = p.discountAmount || p.discount_amount || (isShipping ? order.shippingFee : order.discountAmount) || 0;
                                                        return sum + Number(pDiscount);
                                                    }, 0).toLocaleString('vi-VN')}đ
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg pt-3 mt-1 border-t border-gray-200">
                                            <span className="font-bold text-gray-800">Tổng cộng:</span>
                                            <span className="font-black text-primary">{order.totalPrice.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                    {/* Nút Đóng */}
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors shadow-sm">
                        Đóng
                    </button>
                    {order?.status === 'CANCELLED' && order?.paymentMethod?.toUpperCase() === 'VNPAY' && (
                        <button
                            onClick={handleRefund}
                            disabled={order?.paymentStatus === 'REFUNDED'}
                            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors ${
                                order?.paymentStatus === 'REFUNDED' 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                            title={order?.paymentStatus === 'REFUNDED' ? "Đơn hàng này đã được hoàn tiền" : "Trả lại tiền về tài khoản VNPAY của khách hàng"}
                        >
                            <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
                            {order?.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền VNPAY' : 'Hoàn tiền VNPAY'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}