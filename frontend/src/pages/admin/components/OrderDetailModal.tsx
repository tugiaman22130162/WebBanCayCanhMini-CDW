import React, { useEffect, useState } from "react";
import axios from "axios";

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
    receiver_name: string;
    phone: string;
    address: string;
    note: string;
    total_price: number;
    status: OrderStatus;
    created_at: string;
    items: OrderItem[];
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
            // Tạm thời dùng Mock Data giả lập độ trễ mạng. 
            // Sau này bạn thay bằng: const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`);
            setTimeout(() => {
                setOrder({
                    id: orderId,
                    receiver_name: "Nguyễn Văn A",
                    phone: "0901234567",
                    address: "123 Đường ABC, Quận 1, TP HCM",
                    note: "Giao trong giờ hành chính, gọi điện trước khi đến.",
                    total_price: orderId === 1002 ? 1200000 : 450000,
                    status: orderId === 1002 ? 'SHIPPING' : 'PENDING',
                    created_at: "2026-04-20T10:30:00",
                    items: [
                        {
                            id: 1,
                            product_name: "Terrarium Forest Mini",
                            price: 150000,
                            quantity: 2,
                            subtotal: 300000
                        },
                        {
                            id: 2,
                            product_name: "Chậu Gốm Sứ Trắng",
                            price: 150000,
                            quantity: 1,
                            subtotal: 150000
                        }
                    ]
                });
                setIsLoading(false);
            }, 500);
        } else {
            setOrder(null);
            setIsEditingStatus(false);
        }
    }, [isOpen, orderId]);

    const handleUpdateStatus = async () => {
        if (!order || selectedStatus === order.status) return;
        
        setIsUpdating(true);
        try {
            // Gọi API cập nhật trạng thái đơn hàng dưới Backend
            // (Bạn cần viết API tiếp nhận PUT method tại Backend cho Endpoint này)
            await axios.put(`http://localhost:8080/api/orders/${order.id}/status`, null, {
                params: { status: selectedStatus }
            });
            
            // Cập nhật lại UI
            setOrder({ ...order, status: selectedStatus });
            setIsEditingStatus(false);
            alert("Cập nhật trạng thái thành công!");
            
            if (onSuccess) onSuccess(); // Báo cho component cha tải lại danh sách đơn hàng
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            alert("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* HEADER */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{orderId}</h3>
                        {order && (
                            <p className="text-sm text-gray-500 mt-1">
                                Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
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
                                            <option value="PENDING">Chờ xác nhận</option>
                                            <option value="CONFIRMED">Đã xác nhận</option>
                                            <option value="SHIPPING">Đang giao</option>
                                            <option value="DELIVERED">Đã giao</option>
                                            <option value="CANCELLED">Đã hủy</option>
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
                                    <div><p className="text-xs text-gray-500 uppercase font-bold mb-1">Người nhận</p><p className="font-semibold text-gray-800">{order.receiver_name}</p></div>
                                    <div><p className="text-xs text-gray-500 uppercase font-bold mb-1">Số điện thoại</p><p className="font-semibold text-gray-800">{order.phone}</p></div>
                                    <div className="md:col-span-2"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Địa chỉ giao hàng</p><p className="font-semibold text-gray-800">{order.address}</p></div>
                                    <div className="md:col-span-2"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Ghi chú của khách</p><p className="font-semibold text-gray-800 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm">{order.note || "Không có ghi chú"}</p></div>
                                </div>
                            </div>

                            {/* Danh sách sản phẩm */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">shopping_basket</span>
                                    Sản phẩm đã đặt
                                </h4>
                                <div className="overflow-x-auto">
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
                                
                                {/* Tổng tiền */}
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <div className="w-full md:w-1/2 space-y-2"><div className="flex justify-between text-gray-600"><span>Tạm tính:</span><span className="font-semibold">{order.total_price.toLocaleString('vi-VN')}đ</span></div><div className="flex justify-between text-gray-600"><span>Phí vận chuyển:</span><span className="font-semibold">0đ</span></div><div className="flex justify-between text-lg border-t pt-2 mt-2"><span className="font-bold text-gray-800">Tổng cộng:</span><span className="font-black text-emerald-600">{order.total_price.toLocaleString('vi-VN')}đ</span></div></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}