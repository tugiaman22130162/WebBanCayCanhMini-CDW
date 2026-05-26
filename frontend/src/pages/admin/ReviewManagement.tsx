import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";
import { useSearchParams } from "react-router-dom";
import ReviewDetailModal from "../../components/admin/ReviewDetailModal";

type ReviewStatus = 'VISIBLE' | 'HIDDEN';

type Review = {
    id: number;
    productName: string;
    customerName: string;
    rating: number;
    comment: string;
    status: ReviewStatus;
    createdAt: string;
    updatedAt?: string;
    editCount?: number;
    image: string;
    replies?: {
        id: number;
        content: string;
        shopName: string;
        date: string;
        avatar?: string;
        isAdmin?: boolean;
        updatedAt?: string;
        editCount?: number;
    }[];
};

export default function ReviewManagement() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get("search") || "";
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'ALL'>('ALL');
    const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Reply Modal
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, ratingFilter]);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            // Thử gọi /api/reviews/all (admin) hoặc /api/reviews
            const response = await axios.get("http://localhost:8080/api/reviews/all", {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => axios.get("http://localhost:8080/api/reviews", {
                headers: { Authorization: `Bearer ${token}` }
            }));
            
            const formattedData = response.data.map((r: any) => ({
                id: r.id,
                productName: r.productName || r.product?.name || "Sản phẩm",
                customerName: r.userName || r.customerName || r.user?.fullName || "Khách hàng",
                rating: r.rating,
                comment: r.comment || r.content,
                status: (r.visible === false || r.status === false) ? 'HIDDEN' : 'VISIBLE',
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                editCount: r.editCount || 0,
                image: r.image || r.productImage || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop",
                replies: r.replies || []
            }));
            
            // Sắp xếp theo ngày mới nhất
            formattedData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            setReviews(formattedData);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đánh giá:", error);
            showErrorToast("Không thể tải danh sách đánh giá", 2000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: ReviewStatus) => {
        try {
            const newStatus = currentStatus === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8080/api/reviews/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccessToast(`Đã ${newStatus === 'VISIBLE' ? 'hiển thị' : 'ẩn'} đánh giá!`, 2000);
            fetchReviews();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            showErrorToast("Không thể cập nhật trạng thái", 2000);
        }
    };

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchSearch = r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                r.comment.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
            const matchRating = ratingFilter === 'ALL' || r.rating === ratingFilter;
            return matchSearch && matchStatus && matchRating;
        });
    }, [reviews, searchTerm, statusFilter, ratingFilter]);

    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    const paginatedReviews = filteredReviews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusLabel = (status: ReviewStatus) => {
        return status === 'VISIBLE' ? 'Đang hiện' : 'Đã ẩn';
    };

    const getStatusColor = (status: ReviewStatus) => {
        return status === 'VISIBLE' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-gray-600 bg-gray-100 border-gray-200';
    };

    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Đánh Giá</h2>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng đánh giá</p>
                                <h3 className="text-3xl font-black text-gray-800">{reviews.length}</h3>
                            </div>
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">rate_review</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Đánh giá tốt (4-5 sao)</p>
                                <h3 className="text-3xl font-black text-emerald-600">
                                    {reviews.filter(r => r.rating >= 4).length}
                                </h3>
                            </div>
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">sentiment_very_satisfied</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Đánh giá tệ (1-2 sao)</p>
                                <h3 className="text-3xl font-black text-red-600">
                                    {reviews.filter(r => r.rating <= 2).length}
                                </h3>
                            </div>
                            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">sentiment_dissatisfied</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Đánh giá trung bình</p>
                                <h3 className="text-3xl font-black text-yellow-600">
                                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0}
                                    <span className="text-lg"> / 5</span>
                                </h3>
                            </div>
                            <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">star</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-t-2xl border border-gray-50 border-b-0 flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="appearance-none w-full px-4 py-2.5 pr-10 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#006c49] outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="VISIBLE">Đang hiện</option>
                                <option value="HIDDEN">Đã ẩn</option>
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                            </span>
                        </div>
                        <div className="relative w-full sm:w-48">
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                                className="appearance-none w-full px-4 py-2.5 pr-10 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#006c49] outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                            >
                                <option value="ALL">Tất cả số sao</option>
                                <option value={5}>5 sao</option>
                                <option value={4}>4 sao</option>
                                <option value={3}>3 sao</option>
                                <option value={2}>2 sao</option>
                                <option value={1}>1 sao</option>
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-b-2xl shadow-sm border border-gray-50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="text-left p-4 pl-6">ID</th>
                                        <th className="text-left p-4 w-1/4">Sản phẩm</th>
                                        <th className="text-left p-4">Khách hàng</th>
                                        <th className="text-center p-4">Đánh giá</th>
                                        <th className="text-center p-4">Trạng thái</th>
                                        <th className="text-right p-4 pr-6">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Đang tải đánh giá...</td></tr>
                                    ) : paginatedReviews.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Không tìm thấy đánh giá nào.</td></tr>
                                    ) : (
                                        paginatedReviews.map((review) => (
                                            <tr key={review.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                                <td className="p-4 pl-6 font-bold text-gray-600">#{review.id}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={review.image} alt={review.productName} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                                                        <span className="font-bold text-[#406D5E] line-clamp-2">{review.productName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold text-gray-800">{review.customerName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                                        {(review.editCount || 0) > 0 && (
                                                            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100" title="Khách hàng đã chỉnh sửa">
                                                                Đã sửa
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(review.status)}`}>
                                                        {getStatusLabel(review.status)}
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 text-right space-x-2">
                                                    <button 
                                                        onClick={() => {setSelectedReview(review); setIsReplyModalOpen(true);}}
                                                        className={`group px-2 py-1 text-sm rounded transition ${(review.replies && review.replies.length > 0) ? 'hover:bg-emerald-50' : 'hover:bg-gray-100'}`} 
                                                        title={(review.replies && review.replies.length > 0) ? "Xem chi tiết & Phản hồi" : "Xem chi tiết & Phản hồi"}
                                                    >
                                                        <span className={`material-symbols-outlined text-[20px] align-middle transition-colors ${(review.replies && review.replies.length > 0) ? 'text-emerald-500 group-hover:text-emerald-700' : 'text-blue-500 group-hover:text-blue-700'}`}>
                                                            {(review.replies && review.replies.length > 0) ? 'mark_chat_read' : 'reply'}
                                                        </span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleStatus(review.id, review.status)}
                                                        className={`group px-2 py-1 text-sm rounded transition ${review.status === 'VISIBLE' ? 'hover:bg-yellow-50' : 'hover:bg-emerald-50'}`}
                                                        title={review.status === 'VISIBLE' ? "Ẩn đánh giá" : "Hiển thị đánh giá"}
                                                    >
                                                        <span className={`material-symbols-outlined text-[20px] align-middle transition-colors ${review.status === 'VISIBLE' ? 'text-yellow-500 group-hover:text-yellow-600' : 'text-emerald-500 group-hover:text-emerald-600'}`}>
                                                            {review.status === 'VISIBLE' ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 text-sm text-gray-500">
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50 transition"
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded transition ${currentPage === page ? 'bg-[#006c49] text-white font-bold' : 'border hover:bg-gray-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50 transition"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* REVIEW DETAIL MODAL */}
            <ReviewDetailModal 
                isOpen={isReplyModalOpen} 
                onClose={() => setIsReplyModalOpen(false)} 
                review={selectedReview} 
                onSuccess={fetchReviews} 
            />
        </div>
    );
}