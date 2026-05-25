import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Sidebar from "../../components/user/Sidebar";
import OrderHistory from "../../components/user/OrderHistory";
import MyOrders from "../../components/user/MyOrders";
import MyReviews from "../../components/user/MyReviews";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";

// Cấu hình mặc định cho các thông báo Toast
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    width: 'auto',
    padding: '0.5em 1em',
    customClass: {
        popup: 'rounded-2xl shadow-lg border border-gray-100 font-body flex items-center mt-20',
        title: 'text-sm font-bold text-gray-800 whitespace-nowrap'
    },
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

export default function Profile() {
    const { tab } = useParams<{ tab: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'history' | 'reviews' | 'password'>(
        (tab as 'info' | 'orders' | 'history' | 'reviews' | 'password') || 'info'
    );
    const { user: authUser, logout, isLoggedIn, isLoading, token, updateUser } = useAuth();
    const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        if (tab && ['info', 'orders', 'history', 'reviews', 'password'].includes(tab)) {
            setActiveTab(tab as 'info' | 'orders' | 'history' | 'reviews' | 'password');
        } else if (!tab) {
            setActiveTab('info');
        }
    }, [tab]);

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
    const [reviewFiles, setReviewFiles] = useState<File[]>([]);
    const [isEditReviewMode, setIsEditReviewMode] = useState(false);

    // Chuyển hướng nếu chưa đăng nhập
    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
        }
    }, [isLoading, isLoggedIn, navigate, location.pathname, location.search]);

    // Hàm lấy chữ cái đầu của tên
    const getInitials = (name: string) => {
        if (!name || name === "Đang tải...") return "";
        return name.trim().charAt(0).toUpperCase();
    };

    // Map dữ liệu người dùng từ AuthContext vào format cũ để tránh lỗi giao diện
    const user = authUser ? {
        name: authUser.fullName,
        email: authUser.email,
        phone: authUser.phoneNumber || "",
        address: authUser.address || "",
        avatar: authUser.avatar || "",
        initial: getInitials(authUser.fullName)
    } : { name: "", email: "", phone: "", address: "", avatar: "", initial: "" };

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 bg-yellow-50';
            case 'CONFIRMED': return 'text-blue-600 bg-blue-50';
            case 'SHIPPING': return 'text-purple-600 bg-purple-50';
            case 'DELIVERED': return 'text-emerald-600 bg-emerald-50';
            case 'CANCELLED': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchMyOrders = async () => {
            if (!token) return;
            try {
                const response = await axios.get("http://localhost:8080/api/orders/my-orders", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const formattedOrders = response.data.map((order: any) => ({
                    id: order.orderCode || order.id,
                    realId: order.id,
                    date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
                    estimatedDelivery: order.estimatedDeliveryTimeFrom && order.estimatedDeliveryTimeTo
                        ? `${new Date(order.estimatedDeliveryTimeFrom).toLocaleDateString('vi-VN')} - ${new Date(order.estimatedDeliveryTimeTo).toLocaleDateString('vi-VN')}`
                        : "-",
                    total: order.totalPrice,
                    status: getStatusLabel(order.status),
                    statusColor: getStatusColor(order.status),
                    updatedAt: order.updatedAt,
                    promoCode: order.promotions?.length > 0 ? order.promotions[0].promotionCode : null,
                    discount: order.discountAmount || 0,
                    shippingFee: order.shippingFee || 0,
                    receiverName: order.receiverName,
                    phone: order.phone,
                    address: order.address,
                    note: order.note,
                    paymentMethod: order.paymentMethod,
                    items: (order.items || []).map((item: any) => {
                        let imageUrl = "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop";
                        if (item.product?.images && item.product.images.length > 0) {
                            imageUrl = item.product.images[0].image_url || item.product.images[0].imageUrl || item.product.images[0];
                        }
                        return {
                            id: item.id,
                            productId: item.product?.id,
                            name: item.product_name,
                            quantity: item.quantity,
                            price: item.price,
                            image: imageUrl,
                            isReviewed: item.isReviewed || false
                        };
                    })
                }));
                setOrders(formattedOrders);

                // Lọc các sản phẩm chưa đánh giá từ đơn hàng Đã giao
                const pending = formattedOrders
                    .filter((o: any) => o.status === 'Đã giao')
                    .flatMap((o: any) => o.items
                        .filter((item: any) => !item.isReviewed)
                        .map((item: any) => ({
                            id: item.id,
                            productId: item.productId,
                            productName: item.name,
                            image: item.image,
                            orderId: o.id,
                            orderRealId: o.realId,
                            date: o.updatedAt ? new Date(o.updatedAt).toLocaleDateString('vi-VN') : o.date
                        }))
                    );
                setPendingReviews(pending);
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng:", error);
            }
        };
        if (isLoggedIn) {
            fetchMyOrders();
        }
    }, [isLoggedIn, token]);

    // State data đánh giá
    const [userReviews, setUserReviews] = useState<any[]>([]);

    // Gọi API để lấy các đánh giá (Reviews) đã thực hiện
    useEffect(() => {
        const fetchMyReviews = async () => {
            if (!token) return;
            try {
                const response = await axios.get("http://localhost:8080/api/reviews/my-reviews", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const formattedReviews = response.data.map((r: any) => ({
                    id: r.id,
                    productName: r.productName,
                    image: r.image || "/images/terrarium.png",
                    rating: r.rating,
                    date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
                    updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString('vi-VN') : null,
                    editCount: r.editCount || 0,
                    content: r.comment,
                    status: r.status,
                    reviewImages: r.reviewImages || []
                }));
                setUserReviews(formattedReviews);
            } catch (error) {
                console.error("Lỗi khi tải danh sách đánh giá:", error);
            }
        };
        if (isLoggedIn) {
            fetchMyReviews();
        }
    }, [isLoggedIn, token]);

    // State data chưa đánh giá
    const [pendingReviews, setPendingReviews] = useState<any[]>([]);

    const handleLogout = () => {
        logout(); // Handle logout via Context
    };

    const handleUpdateInfo = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const updatedData = {
            fullName: formData.get('fullName')?.toString() || '',
            phone: formData.get('phone')?.toString() || '',
            address: formData.get('address')?.toString() || '',
        };

        setIsUpdatingInfo(true);
        try {
            await axios.put('http://localhost:8080/api/users/me/info', updatedData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (authUser) {
                updateUser({
                    ...authUser,
                    fullName: updatedData.fullName,
                    phoneNumber: updatedData.phone,
                    address: updatedData.address
                });
            }
            Toast.fire({ icon: 'success', title: 'Cập nhật thông tin thành công!' });
        } catch (error: any) {
            Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Cập nhật thất bại!' });
        } finally {
            setIsUpdatingInfo(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const currentPassword = formData.get('currentPassword')?.toString() || '';
        const newPassword = formData.get('newPassword')?.toString() || '';
        const confirmPassword = formData.get('confirmPassword')?.toString() || '';

        if (newPassword !== confirmPassword) {
            Toast.fire({ icon: 'error', title: 'Mật khẩu mới không khớp!' });
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await axios.put('http://localhost:8080/api/users/me/password', { currentPassword, newPassword }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            Toast.fire({ icon: 'success', title: 'Cập nhật mật khẩu thành công!' });
            form.reset(); // Xóa trắng form sau khi đổi thành công
        } catch (error: any) {
            Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Cập nhật mật khẩu thất bại!' });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleTabChange = (newTab: 'info' | 'orders' | 'history' | 'reviews' | 'password') => {
        setActiveTab(newTab);
        navigate(newTab === 'info' ? '/profile' : `/profile/${newTab}`);
    };

    // Tính toán tạm tính, giảm giá và tổng tiền cho Popup
    const selectedOrderSubtotal = selectedOrder?.items?.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) || 0;
    const selectedOrderDiscount = selectedOrder?.discount || 0;
    const selectedOrderFinalTotal = selectedOrder?.total || 0; // Sử dụng trực tiếp total vì nó đã là số tiền cuối cùng

    // Hàm xử lý tải ảnh và đánh giá
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setReviewFiles(prev => [...prev, ...files].slice(0, 3));
            setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 3));
        }
    };

    const handleRemoveImage = (index: number) => {
        setReviewFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('rating', rating.toString());
            formData.append('comment', reviewText);
            reviewFiles.forEach(file => {
                formData.append('images', file);
            });

            if (isEditReviewMode) {
                // Thêm các ảnh cũ được giữ lại vào formData
                const keptImages = imagePreviews.filter(img => !img.startsWith("blob:")).join(",");
                formData.append('keptImages', keptImages);

                axios.put(`http://localhost:8080/api/reviews/${reviewProduct.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }).catch(error => {
                    console.error("Lỗi khi sửa đánh giá trên server:", error);
                });

                Toast.fire({ icon: 'success', title: 'Cập nhật đánh giá thành công!' });

                const updatedReview = {
                    ...reviewProduct,
                    rating: rating,
                    updatedAt: new Date().toLocaleString('vi-VN'),
                    editCount: (reviewProduct.editCount || 0) + 1,
                    content: reviewText,
                    reviewImages: [...imagePreviews]
                };
                setUserReviews(prev => prev.map(r => r.id === reviewProduct.id ? updatedReview : r));

            } else {
                // Chạy API ngầm để không bị block UI do upload ảnh quá lâu
                axios.post(`http://localhost:8080/api/reviews/order-items/${reviewProduct.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }).catch(error => {
                    console.error("Lỗi khi lưu đánh giá trên server:", error);
                });

                // Cập nhật giao diện ngay lập tức
                Toast.fire({ icon: 'success', title: 'Cảm ơn bạn đã gửi đánh giá!' });

                setPendingReviews(prev => prev.filter(r => r.id !== reviewProduct.id));

                // Cập nhật trạng thái isReviewed của sản phẩm trong danh sách đơn hàng
                setOrders(prevOrders => prevOrders.map(order => {
                    if (order.id === reviewProduct.orderId) {
                        return {
                            ...order,
                            items: order.items.map((item: any) =>
                                item.id === reviewProduct.id ? { ...item, isReviewed: true } : item
                            )
                        };
                    }
                    return order;
                }));

                const newReview = {
                    id: Date.now(),
                    productName: reviewProduct.name || reviewProduct.productName,
                    image: reviewProduct.image || reviewProduct.image_url,
                    rating: rating,
                    date: new Date().toLocaleDateString('vi-VN'),
                    content: reviewText,
                    status: "Đã duyệt",
                    reviewImages: [...imagePreviews] // Dùng luôn mảng ảnh preview tạm thời
                };
                setUserReviews(prev => [newReview, ...prev]);
            }

            setIsReviewModalOpen(false);
            setReviewText("");
            setImagePreviews([]);
            setReviewFiles([]);
            setRating(5);

        } catch (error: any) {
            Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Lỗi khi gửi đánh giá' });
        }
    };

    // Mua lại đơn hàng (Thêm toàn bộ sản phẩm cũ vào lại giỏ hàng)
    const handleBuyAgain = async (order: any) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            let userId: any;
            const userStr = localStorage.getItem("user");
            if (userStr) {
                userId = JSON.parse(userStr).id;
            }

            // Gọi API thêm từng sản phẩm vào giỏ hàng chạy đồng thời
            await Promise.all(order.items.map((item: any) =>
                axios.post(
                    "http://localhost:8080/api/cart/add",
                    {
                        userId: userId,
                        productId: item.productId,
                        quantity: item.quantity
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ));

            Toast.fire({ icon: 'success', title: 'Đã thêm các sản phẩm vào giỏ hàng!' });
            window.dispatchEvent(new Event("cartUpdated"));
            setIsOrderModalOpen(false);
            navigate('/cart');
        } catch (error: any) {
            console.error("Lỗi khi mua lại:", error);
            Toast.fire({ icon: 'error', title: 'Có lỗi xảy ra khi mua lại đơn hàng' });
        }
    };

    //hủy đơn hàng
    const handleCancelOrder = async (orderRealId: number) => {
        const result = await Swal.fire({
            title: 'Hủy đơn hàng?',
            text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Hủy đơn',
            cancelButtonText: 'Đóng',
            customClass: {
                confirmButton: 'bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-red-600 transition-colors shadow-sm',
                cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-gray-300 transition-colors shadow-sm'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:8080/api/orders/${orderRealId}/cancel`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Toast.fire({ icon: 'success', title: 'Hủy đơn hàng thành công!' });
                setIsOrderModalOpen(false);
                setOrders(prev => prev.map(o => o.realId === orderRealId ? { ...o, status: 'Đã hủy', statusColor: 'text-red-600 bg-red-50' } : o));
            } catch (error: any) {
                Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Lỗi khi hủy đơn hàng' });
            }
        }
    };

    // Xử lý xác nhận đã nhận được hàng
    const handleConfirmReceived = async (orderRealId: number) => {
        const result = await Swal.fire({
            title: 'Xác nhận nhận hàng?',
            text: "Bạn xác nhận đã nhận được đơn hàng này trong tình trạng nguyên vẹn?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đã nhận hàng',
            cancelButtonText: 'Chưa nhận',
            customClass: {
                confirmButton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-[#2f5146] transition-colors shadow-sm',
                cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-gray-300 transition-colors shadow-sm'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:8080/api/orders/${orderRealId}/receive`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Toast.fire({ icon: 'success', title: 'Xác nhận nhận hàng thành công!' });
                setIsOrderModalOpen(false);

                // Cập nhật lại trạng thái của đơn hàng trong danh sách đang hiển thị
                setOrders(prev => prev.map(o => o.realId === orderRealId ? { ...o, status: 'Đã giao', statusColor: 'text-emerald-600 bg-emerald-50' } : o));

                // Tự động đẩy các sản phẩm của đơn hàng vừa nhận vào danh sách "Chờ đánh giá"
                const newlyDeliveredOrder = orders.find(o => o.realId === orderRealId);
                if (newlyDeliveredOrder) {
                    const pendingItems = newlyDeliveredOrder.items.map((item: any) => ({
                        id: item.id, productId: item.productId, productName: item.name, image: item.image, orderId: newlyDeliveredOrder.id, orderRealId: newlyDeliveredOrder.realId, date: new Date().toLocaleDateString('vi-VN')
                    }));
                    setPendingReviews(prev => [...pendingItems, ...prev]);
                }
            } catch (error: any) {
                Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Lỗi khi xác nhận nhận hàng' });
            }
        }
    };

    // Hiển thị vòng xoay loading khi đang kiểm tra thông tin auth
    if (isLoading) {
        return (
            <MainLayout>
                <div className="min-h-[80vh] flex justify-center items-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="bg-[#F8F9F5] min-h-screen pt-[50px] mb-[-10px] font-body">
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
                                                <input type="text" name="fullName" defaultValue={user.name} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Số điện thoại</label>
                                                <input type="tel" name="phone" defaultValue={user.phone} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                                            <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 cursor-not-allowed font-medium" />
                                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span> Email không thể thay đổi</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Địa chỉ giao hàng mặc định</label>
                                            <textarea name="address" defaultValue={user.address} rows={3} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all resize-none font-medium"></textarea>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <button type="submit" disabled={isUpdatingInfo} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#2f5146] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                                                {isUpdatingInfo && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                                Lưu Thay Đổi
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* TAB: ĐƠN HÀNG */}
                            {activeTab === 'orders' && (
                                <MyOrders
                                    orders={orders}
                                    onViewDetails={(order) => {
                                        setSelectedOrder(order);
                                        setIsOrderModalOpen(true);
                                    }}
                                    onViewHistory={() => handleTabChange('history')}
                                />
                            )}

                            {/* TAB: LỊCH SỬ MUA HÀNG */}
                            {activeTab === 'history' && (
                                <OrderHistory
                                    orders={orders}
                                    onViewDetails={(order) => {
                                        setSelectedOrder(order);
                                        setIsOrderModalOpen(true);
                                    }}
                                />
                            )}

                            {/* TAB: ĐÁNH GIÁ CỦA TÔI */}
                            {activeTab === 'reviews' && (
                                <MyReviews
                                    userReviews={userReviews}
                                    pendingReviews={pendingReviews}
                                    onReviewClick={(item) => {
                                        setReviewProduct(item);
                                        setIsEditReviewMode(false);
                                        setRating(5);
                                        setReviewText("");
                                        setImagePreviews([]);
                                        setReviewFiles([]);
                                        setIsReviewModalOpen(true);
                                    }}
                                    onEditReviewClick={(item) => {
                                        setReviewProduct(item);
                                        setIsEditReviewMode(true);
                                        setRating(item.rating);
                                        setReviewText(item.content);
                                        setImagePreviews(item.reviewImages || []);
                                        setReviewFiles([]);
                                        setIsReviewModalOpen(true);
                                    }}
                                />
                            )}

                            {/* TAB: ĐỔI MẬT KHẨU */}
                            {activeTab === 'password' && (
                                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Đổi Mật Khẩu</h2>
                                    <form className="space-y-5 max-w-2xl" onSubmit={handleUpdatePassword}>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                                            <input type="password" name="currentPassword" placeholder="••••••••" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu mới</label>
                                            <input type="password" name="newPassword" placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                                            <input type="password" name="confirmPassword" placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-all font-medium" />
                                        </div>
                                        <div className="pt-4 flex justify-start">
                                            <button type="submit" disabled={isUpdatingPassword} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#2f5146] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                                                {isUpdatingPassword && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                                Cập Nhật Mật Khẩu
                                            </button>
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50 shrink-0">
                            <h3 className="font-bold text-lg text-gray-800">Chi tiết đơn hàng {selectedOrder.id}</h3>
                            <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6 space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500">Ngày đặt: {selectedOrder.date}</p>
                                    {selectedOrder.status !== 'Đã hủy' && selectedOrder.status !== 'Đã giao' && (
                                        <p className="text-sm text-gray-500 mt-1">Dự kiến giao: <span className="font-semibold text-gray-800">{selectedOrder.estimatedDelivery}</span></p>
                                    )}
                                    {selectedOrder.status === 'Đã giao' && (
                                        <p className="text-sm text-gray-500 mt-1">Ngày giao: <span className="font-semibold text-gray-800">{selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString('vi-VN') : selectedOrder.estimatedDelivery}</span></p>
                                    )}
                                    {selectedOrder.status === 'Đã hủy' && (
                                        <p className="text-sm text-gray-500 mt-1">Ngày hủy: <span className="font-semibold text-gray-800">{selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString('vi-VN') : "-"}</span></p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">Trạng thái: <span className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-full text-xs ${selectedOrder.statusColor}`}>{selectedOrder.status}</span></p>
                                </div>
                            </div>

                            {/* Thông tin giao hàng */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mt-4">
                                <h4 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                                    Thông tin giao hàng
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><p className="text-xs text-gray-500 uppercase font-bold mb-1">Người nhận</p><p className="font-semibold text-gray-800">{selectedOrder.receiverName}</p></div>
                                    <div><p className="text-xs text-gray-500 uppercase font-bold mb-1">Số điện thoại</p><p className="font-semibold text-gray-800">{selectedOrder.phone}</p></div>
                                    <div className="md:col-span-2"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Địa chỉ giao hàng</p><p className="font-semibold text-gray-800">{selectedOrder.address}</p></div>
                                    {selectedOrder.note && <div className="md:col-span-2"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Ghi chú</p><p className="font-semibold text-gray-800 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm">{selectedOrder.note}</p></div>}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Phương thức thanh toán</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {selectedOrder.paymentMethod?.toUpperCase() === 'VNPAY' ? (
                                                <>
                                                    <img src="https://vinadesign.vn/uploads/thumbnails/800/2023/05/vnpay-logo-vinadesign-25-12-59-16.jpg" alt="VNPAY" className="w-6 h-6 object-contain" />
                                                    <span className="font-semibold text-gray-800">Ví điện tử VNPAY</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                                                    <span className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

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
                                    {/* Phí vận chuyển */}
                                    <div className="flex justify-between w-full sm:w-1/2 text-gray-600 text-sm">
                                        <span>Phí vận chuyển:</span>
                                        <span className="font-semibold">{selectedOrder.shippingFee ? selectedOrder.shippingFee.toLocaleString('vi-VN') + 'đ' : '0đ'}</span>
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
                        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                            {selectedOrder.status === 'Chờ xác nhận' && (
                                <button
                                    onClick={() => handleCancelOrder(selectedOrder.realId)}
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
                                    onClick={() => handleConfirmReceived(selectedOrder.realId)}
                                    className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] transition-colors shadow-sm"
                                >
                                    Đã nhận được hàng
                                </button>
                            )}
                            {selectedOrder.status === 'Đã giao' && (
                                <button
                                    onClick={() => { setIsOrderModalOpen(false); handleTabChange('reviews'); }}
                                    className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] transition-colors shadow-sm"
                                >
                                    Đánh giá
                                </button>
                            )}
                            {(selectedOrder.status === 'Đã hủy' || selectedOrder.status === 'Đã giao') && (
                                <button
                                    onClick={() => handleBuyAgain(selectedOrder)}
                                    className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] transition-colors shadow-sm flex items-center gap-2"
                                >
                                    Mua lại
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
                            <h3 className="font-bold text-lg text-gray-800">{isEditReviewMode ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}</h3>
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
                                        {isEditReviewMode ? "Lưu thay đổi" : "Gửi đánh giá"}
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