import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderDetailModal from '../admin/OrderDetailModal';

interface OrderMessageCardProps {
    orderId: number;
}

export default function OrderMessageCard({ orderId }: OrderMessageCardProps) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(res.data);
            } catch (error) {
                console.error("Lỗi lấy thông tin đơn hàng", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (loading) return (
        <div className="p-4 bg-gray-50 rounded-xl w-64 text-center text-sm text-gray-500 animate-pulse border border-gray-100">
            Đang tải thông tin đơn hàng...
        </div>
    );

    if (!order) return (
        <div className="p-4 bg-red-50 rounded-xl w-64 text-center text-sm text-red-500 border border-red-100">
            Đơn hàng không tồn tại
        </div>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-700 bg-yellow-100';
            case 'CONFIRMED': return 'text-blue-700 bg-blue-100';
            case 'SHIPPING': return 'text-purple-700 bg-purple-100';
            case 'DELIVERED': return 'text-emerald-700 bg-emerald-100';
            case 'CANCELLED': return 'text-red-700 bg-red-100';
            default: return 'text-gray-700 bg-gray-100';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'SHIPPING': return 'Đang giao';
            case 'DELIVERED': return 'Đã giao';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    let firstItemImage = "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=200&h=200&fit=crop";
    if (order.items && order.items.length > 0) {
        const product = order.items[0].product;
        if (product && product.images && product.images.length > 0) {
            firstItemImage = typeof product.images[0] === 'string' 
                ? product.images[0] 
                : (product.images[0].image_url || product.images[0].imageUrl || firstItemImage);
        } else if (order.items[0].image) {
            firstItemImage = order.items[0].image;
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 w-[260px] sm:w-[300px] shadow-sm flex flex-col gap-3 text-left hover:shadow-md transition-shadow mt-1">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="font-black text-[#006c49] text-sm">#{order.orderCode || order.id}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
            </div>
            <div className="flex items-center gap-3">
                <img src={firstItemImage} alt="Order Item" className="w-14 h-14 object-cover rounded-lg border border-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{order.items?.[0]?.product_name || 'Sản phẩm'}</p>
                    {order.items?.length > 1 && <p className="text-[11px] text-gray-500 mt-0.5 font-medium">và {order.items.length - 1} sản phẩm khác</p>}
                </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 mt-1 border border-gray-100">
                <div className="flex justify-between items-center text-xs"><span className="text-gray-500 font-medium">Tổng tiền:</span><span className="font-bold text-[#006c49] text-sm">{order.totalPrice?.toLocaleString('vi-VN')}đ</span></div>
                <div className="flex justify-between items-center text-xs"><span className="text-gray-500 font-medium">{order.status === 'DELIVERED' ? 'Ngày nhận:' : 'Dự kiến giao:'}</span><span className="font-bold text-gray-700">{order.status === 'DELIVERED' ? new Date(order.updatedAt || order.createdAt).toLocaleDateString('vi-VN') : (order.estimatedDeliveryTimeFrom ? new Date(order.estimatedDeliveryTimeFrom).toLocaleDateString('vi-VN') : new Date(order.createdAt).toLocaleDateString('vi-VN'))}</span></div>
            </div>
            
            <button onClick={() => setIsModalOpen(true)} className="mt-1 w-full py-2 bg-[#006c49]/10 text-[#006c49] font-bold rounded-lg text-xs hover:bg-[#006c49]/20 transition-colors">
                Xem chi tiết
            </button>

            <OrderDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} orderId={order.id} onSuccess={() => {}} />
        </div>
    );
}