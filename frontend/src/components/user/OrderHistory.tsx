import React from "react";

interface OrderHistoryProps {
    orders: any[];
    onViewDetails: (order: any) => void;
}

export default function OrderHistory({ orders, onViewDetails }: OrderHistoryProps) {
    // Chỉ lấy những đơn hàng đã hoàn tất vòng đời (Đã giao hoặc Đã hủy)
    const historyOrders = orders.filter(o => o.status === 'Đã giao' || o.status === 'Đã hủy');

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Lịch Sử Mua Hàng</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4">Mã Đơn</th>
                            <th className="text-left p-4">Ngày Đặt</th>
                            <th className="text-right p-4">Tổng Tiền</th>
                            <th className="text-center p-4">Trạng Thái</th>
                            <th className="text-center p-4">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {historyOrders.length > 0 ? (
                            historyOrders.map((order, i) => (
                                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="p-4 font-bold text-[#406D5E]">{order.id}</td>
                                    <td className="p-4 text-sm text-gray-600 font-medium">{order.date}</td>
                                    <td className="p-4 text-right font-bold text-gray-800">{Math.max(0, order.total - (order.discount || 0)).toLocaleString('vi-VN')}đ</td>
                                    <td className="p-4 text-center">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${order.statusColor}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => onViewDetails(order)}
                                            className="w-8 h-8 inline-flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors" title="Xem chi tiết"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Bạn chưa có lịch sử mua hàng.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}