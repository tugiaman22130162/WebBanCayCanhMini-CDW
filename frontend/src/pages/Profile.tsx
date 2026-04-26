import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Sidebar from "../components/Sidebar";

export default function Profile() {
    const { tab } = useParams<{ tab: string }>();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'reviews' | 'password'>(
        (tab as 'info' | 'orders' | 'reviews' | 'password') || 'info'
    );

    useEffect(() => {
        if (tab && ['info', 'orders', 'reviews', 'password'].includes(tab)) {
            setActiveTab(tab as 'info' | 'orders' | 'reviews' | 'password');
        } else if (!tab) {
            setActiveTab('info');
        }
    }, [tab]);

    const [orderStatusFilter, setOrderStatusFilter] = useState<string>('Tất cả');
    const [reviewFilter, setReviewFilter] = useState<'pending' | 'completed'>('pending');

    // State quản lý Modal chi tiết đơn hàng
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // State quản lý Modal Đánh giá
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewProduct, setReviewProduct] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Mock data người dùng
    const user = {
        name: "Nguyễn Văn A",
        email: "hello@minigarden.com",
        phone: "0987654321",
        address: "123 Đường ABC, Phường 1, Quận 2, TP. HCM",
        avatar: "https://i.pravatar.cc/150?u=hello@minigarden.com"
    };

    // Mock data đơn hàng
    const orders = [
        { id: "MG-1001", date: "20/04/2026", estimatedDelivery: "23/04/2026 - 25/04/2026", total: 450000, status: "Đang giao", statusColor: "text-blue-600 bg-blue-50", promoCode: "MINIGARDEN10", discount: 50000, items: [{ name: "Terrarium Forest Mini", quantity: 1, price: 300000, image: "/images/terrarium.png" }, { name: "Chậu Gốm Sứ Trắng", quantity: 1, price: 150000, image: "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop" }] },
        { id: "MG-1002", date: "15/04/2026", estimatedDelivery: "18/04/2026", total: 1250000, status: "Đã giao", statusColor: "text-emerald-600 bg-emerald-50", promoCode: "FREESHIP", discount: 30000, items: [{ name: "Sen đá Echeveria Laui", quantity: 5, price: 250000, image: "/images/sen_da.webp" }] },
        { id: "MG-1003", date: "10/04/2026", estimatedDelivery: "-", total: 320000, status: "Đã hủy", statusColor: "text-red-600 bg-red-50", items: [{ name: "Cây để bàn Mix", quantity: 1, price: 320000, image: "/images/cay_de_ban.webp" }] },
        { id: "MG-1004", date: "26/04/2026", estimatedDelivery: "29/04/2026 - 01/05/2026", total: 150000, status: "Chờ xác nhận", statusColor: "text-yellow-600 bg-yellow-50", items: [{ name: "Đất nền mùn", quantity: 2, price: 75000, image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=100&h=100&fit=crop" }] },
    ];

    // Mock data đánh giá
    const userReviews = [
        { id: 1, productName: "Sen đá Echeveria Laui", image: "/images/sen_da.webp", rating: 5, date: "22/04/2026", content: "Cây đẹp, gói hàng cẩn thận. Rất ưng ý!", status: "Đã duyệt" },
        { id: 2, productName: "Terrarium Forest Mini", image: "/images/terrarium.png", rating: 4, date: "18/04/2026", content: "Bình thuỷ tinh hơi xước nhẹ nhưng tổng thể vẫn rất đẹp.", status: "Đã duyệt" }
    ];

    // Mock data chưa đánh giá
    const pendingReviews = [
        { id: 101, productName: "Cây để bàn Mix", image: "/images/cay_de_ban.webp", orderId: "MG-1003", date: "10/04/2026" }
    ];

    const handleLogout = () => {
        alert("Đăng xuất thành công!");
        navigate("/login");
    };

    const handleUpdateInfo = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Cập nhật thông tin thành công!");
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Cập nhật mật khẩu thành công!");
    };

    const handleTabChange = (newTab: 'info' | 'orders' | 'reviews' | 'password') => {
        setActiveTab(newTab);
        navigate(newTab === 'info' ? '/profile' : `/profile/${newTab}`);
    };

    const filteredOrders = orders.filter(order =>
        orderStatusFilter === 'Tất cả' || order.status === orderStatusFilter
    );

    // Tính toán tạm tính, giảm giá và tổng tiền cho Popup
    const selectedOrderSubtotal = selectedOrder?.items?.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) || 0;
    const selectedOrderDiscount = selectedOrder?.discount || 0;
    const selectedOrderFinalTotal = Math.max(0, selectedOrderSubtotal - selectedOrderDiscount);

    // Hàm xử lý tải ảnh và đánh giá
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 3));
        }
    };

    const handleRemoveImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
        setIsReviewModalOpen(false);
        setReviewText("");
        setImagePreviews([]);
        setRating(5);
    };

    return (
        <MainLayout>
            <div className="bg-[#F8F9F5] min-h-screen pt-[50px] mb-[-70px] font-body">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* SIDEBAR TÀI KHOẢN */}
                        <Sidebar
                            user={user}
                            activeTab={activeTab}
                            setActiveTab={handleTabChange}
                            pendingReviewsCount={pendingReviews.length}
                            onLogout={handleLogout}
                        />

                        {/* NỘI DUNG CHÍNH (TABS) */}
                        <div className="lg:col-span-3">

                            {/* TAB: THÔNG TIN CÁ NHÂN */}
                            {activeTab === 'info' && (
                                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Thông Tin Cá Nhân</h2>
                                    <form className="space-y-5" onSubmit={handleUpdateInfo}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Họ và tên</label>
                                                <input type="text" defaultValue={user.name} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Số điện thoại</label>
                                                <input type="tel" defaultValue={user.phone} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                                            <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 cursor-not-allowed font-medium" />
                                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span> Email không thể thay đổi</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Địa chỉ giao hàng mặc định</label>
                                            <textarea defaultValue={user.address} rows={3} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all resize-none font-medium"></textarea>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#2f5146] transition-colors shadow-md">Lưu Thay Đổi</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* TAB: ĐƠN HÀNG */}
                            {activeTab === 'orders' && (
                                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">Đơn Hàng Của Tôi</h2>
                                        <button
                                            onClick={() => setOrderStatusFilter('Đã giao')}
                                            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors hover:underline"
                                        >Lịch sử mua hàng</button>
                                    </div>

                                    {/* THẺ TAB BỘ LỌC TRẠNG THÁI */}
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 mt-2 overflow-x-auto hide-scrollbar">
                                        <div className="relative flex justify-between items-center w-full min-w-[500px] max-w-3xl mx-auto px-4 sm:px-8">
                                            {/* Thanh nền */}
                                            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1.5 bg-gray-200 rounded-full"></div>

                                            {/* Các mốc trạng thái */}
                                            {[
                                                { label: 'Tất cả', icon: 'apps' },
                                                { label: 'Chờ xác nhận', icon: 'pending_actions' },
                                                { label: 'Đang giao', icon: 'local_shipping' },
                                                { label: 'Đã giao', icon: 'inventory' },
                                                { label: 'Đã hủy', icon: 'cancel' }
                                            ].map((step) => {
                                                const isActive = orderStatusFilter === step.label;
                                                const count = step.label === 'Tất cả' ? orders.length : orders.filter(o => o.status === step.label).length;
                                                return (
                                                    <button
                                                        key={step.label}
                                                        onClick={() => setOrderStatusFilter(step.label)}
                                                        className="relative z-10 flex flex-col items-center gap-2 group outline-none"
                                                    >
                                                        <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive ? 'bg-primary border-primary/20 text-white shadow-md scale-110' : 'bg-white border-gray-200 text-gray-400 group-hover:border-primary/30 group-hover:text-primary'}`}>
                                                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{step.icon}</span>
                                                            {count > 0 && (step.label === 'Chờ xác nhận' || step.label === 'Đang giao') && (
                                                                <span className={`absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 flex items-center justify-center text-[11px] font-black rounded-full shadow-md border-2 border-white transition-all duration-300 ${isActive ? 'bg-red-500 text-white scale-110' : 'bg-gray-400 text-white group-hover:bg-red-400 group-hover:scale-110'}`}>
                                                                    {count}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] sm:text-xs font-bold absolute top-14 whitespace-nowrap transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>{step.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="h-6"></div> {/* Khoảng trống cho label */}
                                    </div>

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
                                                {filteredOrders.length > 0 ? (
                                                    filteredOrders.map((order, i) => (
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
                                                                    onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }}
                                                                    className="w-8 h-8 inline-flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors" title="Xem chi tiết"
                                                                >
                                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Không có đơn hàng nào ở trạng thái này.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TAB: ĐÁNH GIÁ CỦA TÔI */}
                            {activeTab === 'reviews' && (
                                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Đánh Giá Của Tôi</h2>

                                    {/* Review Tabs */}
                                    <div className="flex gap-6 mb-6 border-b border-gray-100">
                                        <button
                                            onClick={() => setReviewFilter('pending')}
                                            className={`pb-3 font-semibold text-sm transition-colors relative ${reviewFilter === 'pending' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            Chưa đánh giá
                                            {reviewFilter === 'pending' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
                                        </button>
                                        <button
                                            onClick={() => setReviewFilter('completed')}
                                            className={`pb-3 font-semibold text-sm transition-colors relative ${reviewFilter === 'completed' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            Đã đánh giá
                                            {reviewFilter === 'completed' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {reviewFilter === 'completed' ? (
                                            userReviews.length > 0 ? (
                                                userReviews.map(review => (
                                                    <div key={review.id} className="border border-gray-100 rounded-xl p-5 hover:bg-gray-50 transition-colors">
                                                        <div className="flex gap-4">
                                                            <img src={review.image} alt={review.productName} className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-800">{review.productName}</h4>
                                                                        <div className="flex text-yellow-400 mt-1">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 font-medium">{review.date}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-3">{review.content}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-2">
                                                    <span className="material-symbols-outlined text-4xl text-gray-300">rate_review</span>
                                                    <p>Bạn chưa có đánh giá nào.</p>
                                                </div>
                                            )
                                        ) : (
                                            pendingReviews.length > 0 ? (
                                                pendingReviews.map(item => (
                                                    <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                        <div className="flex gap-4">
                                                            <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                                                            <div>
                                                                <h4 className="font-bold text-gray-800">{item.productName}</h4>
                                                                <p className="text-sm text-gray-500 mt-1">Đơn hàng: <span className="font-medium">{item.orderId}</span></p>
                                                                <p className="text-xs text-gray-400 mt-1">Ngày giao: {item.date}</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => { setReviewProduct(item); setIsReviewModalOpen(true); }} className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-[#2f5146] transition-colors whitespace-nowrap shadow-sm">
                                                            Đánh giá ngay
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-2">
                                                    <span className="material-symbols-outlined text-4xl text-gray-300">inventory_2</span>
                                                    <p>Không có sản phẩm nào đang chờ đánh giá.</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB: ĐỔI MẬT KHẨU */}
                            {activeTab === 'password' && (
                                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Đổi Mật Khẩu</h2>
                                    <form className="space-y-5 max-w-lg" onSubmit={handleUpdatePassword}>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                                            <input type="password" placeholder="••••••••" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu mới</label>
                                            <input type="password" placeholder="••••••••" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                                            <input type="password" placeholder="••••••••" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                        </div>
                                        <div className="pt-4 flex justify-start">
                                            <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#2f5146] transition-colors shadow-md">Cập Nhật Mật Khẩu</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            {isOrderModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden zoom-in-95 duration-200">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Chi tiết đơn hàng {selectedOrder.id}</h3>
                            <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500">Ngày đặt: {selectedOrder.date}</p>
                                    {selectedOrder.status !== 'Đã hủy' && selectedOrder.status !== 'Đã giao' && (
                                        <p className="text-sm text-gray-500 mt-1">Dự kiến giao: <span className="font-semibold text-gray-800">{selectedOrder.estimatedDelivery}</span></p>
                                    )}
                                    {selectedOrder.status === 'Đã giao' && (
                                        <p className="text-sm text-gray-500 mt-1">Ngày nhận hàng: <span className="font-semibold text-gray-800">{selectedOrder.estimatedDelivery}</span></p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">Trạng thái: <span className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-full text-xs ${selectedOrder.statusColor}`}>{selectedOrder.status}</span></p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">shopping_basket</span>
                                    Sản phẩm đã đặt
                                </h4>
                                <div className="bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="text-left p-3">Sản phẩm</th>
                                                <th className="text-center p-3">Số lượng</th>
                                                <th className="text-right p-3">Đơn giá</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedOrder.items?.map((item: any, idx: number) => (
                                                <tr key={idx} className="bg-white">
                                                    <td className="p-3 font-semibold text-gray-800 text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <img src={item.image || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop"} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                                                            <span>{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center text-gray-600 text-sm">{item.quantity}</td>
                                                    <td className="p-3 text-right font-bold text-gray-800 text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {selectedOrder.promoCode && (
                                    <div className="mt-4 flex justify-between items-center bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
                                        <div className="flex items-center gap-2 text-emerald-700">
                                            <span className="material-symbols-outlined text-[20px]">local_activity</span>
                                            <span className="font-semibold text-sm">Mã giảm giá: <span className="font-bold px-2 py-1 bg-white rounded-md ml-1 border border-emerald-200 shadow-sm">{selectedOrder.promoCode}</span></span>
                                        </div>
                                        <span className="font-bold text-emerald-700">
                                            -{selectedOrder.discount?.toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                )}

                                {/* TỔNG TIỀN */}
                                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-end space-y-2">
                                    <div className="flex justify-between w-full sm:w-1/2 text-gray-600 text-sm">
                                        <span>Tạm tính:</span>
                                        <span className="font-semibold">{selectedOrderSubtotal.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    {selectedOrder.promoCode && (
                                        <div className="flex justify-between w-full sm:w-1/2 text-emerald-600 text-sm">
                                            <span>Giảm giá:</span>
                                            <span className="font-semibold">-{selectedOrderDiscount.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between w-full sm:w-1/2 text-lg pt-2 border-t border-gray-100">
                                        <span className="font-bold text-gray-800">Tổng cộng:</span>
                                        <span className="font-black text-primary">{selectedOrderFinalTotal.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                            {selectedOrder.status === 'Chờ xác nhận' && (
                                <button
                                    onClick={() => { alert('Đã gửi yêu cầu hủy đơn hàng!'); setIsOrderModalOpen(false); }}
                                    className="px-6 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors shadow-sm"
                                >
                                    Hủy đơn hàng
                                </button>
                            )}
                            <button onClick={() => setIsOrderModalOpen(false)} className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors shadow-sm">
                                Đóng
                            </button>
                            {selectedOrder.status === 'Đang giao' && (
                                <button
                                    onClick={() => { alert('Cảm ơn bạn đã xác nhận nhận hàng!'); setIsOrderModalOpen(false); }}
                                    className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] transition-colors shadow-sm"
                                >
                                    Đã nhận được hàng
                                </button>
                            )}
                            {selectedOrder.status === 'Đã giao' && (
                                <button
                                    onClick={() => { setIsOrderModalOpen(false); setReviewProduct({ ...selectedOrder.items[0], orderId: selectedOrder.id }); setIsReviewModalOpen(true); }}
                                    className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] transition-colors shadow-sm"
                                >
                                    Đánh giá
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ĐÁNH GIÁ SẢN PHẨM */}
            {isReviewModalOpen && reviewProduct && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50 shrink-0">
                            <h3 className="font-bold text-lg text-gray-800">Đánh giá sản phẩm</h3>
                            <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            {/* Thông tin sản phẩm đang đánh giá */}
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <img src={reviewProduct.image || reviewProduct.image_url || "/images/terrarium.png"} alt={reviewProduct.name || reviewProduct.productName} className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                                <div>
                                    <h4 className="font-bold text-gray-800">{reviewProduct.name || reviewProduct.productName}</h4>
                                    {reviewProduct.orderId && <p className="text-sm text-gray-500 mt-1">Đơn hàng: <span className="font-medium">{reviewProduct.orderId}</span></p>}
                                </div>
                            </div>

                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                {/* Đánh giá sao */}
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <p className="font-bold text-gray-700">Bạn cảm thấy sản phẩm này thế nào?</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="focus:outline-none transition-transform hover:scale-110"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                            >
                                                <span
                                                    className={`material-symbols-outlined text-4xl md:text-5xl ${star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-200"
                                                        }`}
                                                    style={{ fontVariationSettings: star <= (hoverRating || rating) ? "'FILL' 1" : "'FILL' 0" }}
                                                >
                                                    star
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className={`text-sm font-bold px-4 py-1 rounded-full ${rating >= 4 ? 'bg-emerald-50 text-emerald-600' : rating === 3 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                                        {rating === 5 ? "Tuyệt vời!" : rating === 4 ? "Rất tốt" : rating === 3 ? "Bình thường" : rating === 2 ? "Không hài lòng" : "Rất tệ"}
                                    </p>
                                </div>

                                {/* Nhận xét */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Chia sẻ trải nghiệm của bạn <span className="text-red-500">*</span></label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này nhé..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none bg-gray-50 focus:bg-white text-sm font-medium text-gray-800"
                                    ></textarea>
                                </div>

                                {/* Hình ảnh */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Thêm hình ảnh thực tế (Tối đa 3)</label>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {imagePreviews.map((src, index) => (
                                            <div key={index} className="relative w-20 h-20 rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                                                <img src={src} alt="preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => handleRemoveImage(index)} className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors">
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {imagePreviews.length < 3 && (
                                            <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center bg-gray-50 hover:bg-primary-container/10 cursor-pointer transition-colors">
                                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
                                                <span className="text-[10px] text-gray-500 mt-1 font-medium">Thêm ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                                        Hủy bỏ
                                    </button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-[#2f5146] transition-colors shadow-md">
                                        Gửi đánh giá
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}