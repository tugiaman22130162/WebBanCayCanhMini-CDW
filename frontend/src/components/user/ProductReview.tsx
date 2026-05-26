import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";
import Swal from "sweetalert2";

interface ProductReviewsProp {
    productId: number;
    productRating: number;
    initialTotalReviews: number;
    onReviewAdded?: (rating: number) => void;
}

export default function ProductReview({ productId, productRating, initialTotalReviews, onReviewAdded }: ProductReviewsProp) {
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviewImages, setReviewImages] = useState<string[]>([]);
    const [reviewFiles, setReviewFiles] = useState<File[]>([]);
    
    // State lưu danh sách reviews thật từ backend
    const [reviewsList, setReviewsList] = useState<any[]>([]);
    
    // State kiểm tra user có quyền đánh giá không
    const { isLoggedIn, token, user } = useAuth();
    const [eligibleOrderItemId, setEligibleOrderItemId] = useState<number | null>(null);
    const [hasBoughtProduct, setHasBoughtProduct] = useState(false);

    // State trả lời đánh giá (dành cho Admin hoặc Người đã mua hàng)
    const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    const [editReplyText, setEditReplyText] = useState("");

    // Hàm fetch danh sách review từ Backend
    const fetchReviews = async () => {
        try {
            const tokenStr = localStorage.getItem("token");
            const headers = tokenStr ? { Authorization: `Bearer ${tokenStr}` } : {};
            const res = await axios.get(`http://localhost:8080/api/reviews/product/${productId}`, { headers });
            
            // Lấy mảng dữ liệu (Xử lý cả trường hợp Backend trả về kiểu Phân trang có bọc trong 'content')
            const dataArray = Array.isArray(res.data) ? res.data : (res.data?.content || []);
            
            const formattedReviews = dataArray.map((r: any) => ({
                id: r.id,
                user: r.userName || "Khách hàng",
                avatar: r.userAvatar || "https://i.pravatar.cc/150",
                rating: r.rating,
                date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
                updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString('vi-VN') : null,
                editCount: r.editCount || 0,
                content: r.comment,
                images: r.reviewImages || [],
                replies: r.replies?.map((rep: any) => ({...rep})) || []
            }));
            setReviewsList(formattedReviews);
        } catch (error) {
            console.error("Lỗi lấy danh sách đánh giá:", error);
        }
    };

    // 1. Tải danh sách khi load trang
    useEffect(() => {
        fetchReviews();
    }, [productId]);

    // 2. Kiểm tra xem User này có đơn hàng nào Đã Giao và chứa Product này mà chưa Review không
    useEffect(() => {
        const checkEligibility = async () => {
            if (!isLoggedIn || !token) return;
            try {
                const response = await axios.get("http://localhost:8080/api/orders/my-orders", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                let foundOrderItemId = null;
                let bought = false;
                
                for (const order of response.data) {
                    if (order.status === 'DELIVERED') {
                        const itemInOrder = order.items.find((item: any) => 
                            (item.product?.id === productId || item.productId === productId)
                        );
                        
                        if (itemInOrder) {
                            bought = true;
                            if (!itemInOrder.isReviewed) {
                                foundOrderItemId = itemInOrder.id;
                            }
                        }
                    }
                }
                setEligibleOrderItemId(foundOrderItemId);
                setHasBoughtProduct(bought);
            } catch (error) {
                console.error("Lỗi kiểm tra quyền đánh giá:", error);
            }
        };
        
        checkEligibility();
    }, [productId, isLoggedIn, token]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            
            setReviewFiles(prev => [...prev, ...files].slice(0, 3));
            setReviewImages(prev => [...prev, ...newPreviews].slice(0, 3));
        }
    };

    const handleRemoveImage = (index: number) => {
        setReviewFiles(prev => prev.filter((_, i) => i !== index));
        setReviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewText.trim()) {
            showErrorToast("Vui lòng nhập nội dung đánh giá!", 2000);
            return;
        }
        
        if (!eligibleOrderItemId) {
            showErrorToast("Lỗi: Không tìm thấy thông tin đơn hàng hợp lệ để đánh giá.", 2000);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('rating', newRating.toString());
            formData.append('comment', reviewText);
            reviewFiles.forEach(file => {
                formData.append('images', file);
            });

            // Gọi API chạy ngầm (không dùng await) để tránh block UI (do Cloudinary upload lâu)
            axios.post(`http://localhost:8080/api/reviews/order-items/${eligibleOrderItemId}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }).then(() => {
                // Tải lại danh sách review từ Backend sau khi server đã lưu thành công
                fetchReviews();
            }).catch(error => {
                console.error("Lỗi khi lưu đánh giá trên server:", error);
            });

            // Cập nhật UI ngay lập tức (Optimistic Update)
            const newReviewObj = {
                id: Date.now(),
                user: "Khách hàng (Bạn)",
                avatar: "https://i.pravatar.cc/150",
                rating: newRating,
                date: new Date().toLocaleDateString('vi-VN'),
                content: reviewText,
                images: [...reviewImages] // Dùng mảng ảnh preview tạm thời
            };
            
            setReviewsList(prev => [newReviewObj, ...prev]);
            if (onReviewAdded) onReviewAdded(newRating);
            
            setEligibleOrderItemId(null);
            setIsWritingReview(false);
            setReviewText("");
            setReviewImages([]);
            setReviewFiles([]);
            setNewRating(5);
            
            showSuccessToast('Cảm ơn bạn đã gửi đánh giá!', 2000);
        } catch (error: any) {
            console.error("Lỗi khi gửi đánh giá:", error);
            showErrorToast(error.response?.data?.message || 'Lỗi khi gửi đánh giá', 2000);
        }
    };

    const handleReplySubmit = async (e: React.FormEvent, reviewId: number) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setIsSubmittingReply(true);
        try {
            await axios.post("http://localhost:8080/api/reviews/reply", {
                reviewId,
                comment: replyText.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccessToast("Gửi phản hồi thành công!", 2000);
            setReplyingReviewId(null);
            setReplyText("");
            fetchReviews();
        } catch (error: any) {
            console.error("Lỗi khi gửi phản hồi:", error);
            showErrorToast(error.response?.data?.message || "Lỗi khi gửi phản hồi", 2000);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleEditReplySubmit = async (e: React.FormEvent, replyId: number) => {
        e.preventDefault();
        if (!editReplyText.trim()) return;
        setIsSubmittingReply(true);
        try {
            await axios.put(`http://localhost:8080/api/reviews/reply/${replyId}`, {
                comment: editReplyText.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccessToast("Cập nhật phản hồi thành công!", 2000);
            setEditingReplyId(null);
            setEditReplyText("");
            fetchReviews();
        } catch (error: any) {
            showErrorToast(error.response?.data?.message || "Lỗi khi cập nhật phản hồi", 2000);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleDeleteReply = async (replyId: number) => {
        const result = await Swal.fire({
            title: 'Xóa phản hồi?',
            text: "Bạn có chắc chắn muốn xóa phản hồi này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-red-600',
                cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-gray-300'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/api/reviews/reply/${replyId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSuccessToast("Đã xóa phản hồi!", 2000);
                fetchReviews();
            } catch (error: any) {
                showErrorToast(error.response?.data?.message || "Lỗi khi xóa phản hồi", 2000);
            }
        }
    };

    const renderStars = (rating: number, size = "text-[20px]") => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                    const fillPercentage = Math.max(0, Math.min(100, (rating - star + 1) * 100));
                    return (
                        <div key={star} className={`relative inline-flex ${size}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1em] h-[1em] text-gray-200">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <div className="absolute top-0 left-0 overflow-hidden h-full whitespace-nowrap" style={{ width: `${fillPercentage}%` }}>
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1em] h-[1em] text-yellow-400">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const totalReviews = reviewsList.length > 0 ? reviewsList.length : (initialTotalReviews || 0);
    const displayRating = reviewsList.length > 0 
        ? (reviewsList.reduce((acc, cur) => acc + cur.rating, 0) / reviewsList.length).toFixed(1) 
        : productRating;

    const getStarCount = (star: number) => {
        return reviewsList.filter(r => Math.round(r.rating) === star).length;
    };

    const getStarPercentage = (star: number) => {
        if (totalReviews === 0) return 0;
        return (getStarCount(star) / totalReviews) * 100;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="grid md:grid-cols-12 gap-10 border-b border-gray-100 pb-10 mb-10">
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <h3 className="text-gray-500 font-bold mb-2">Đánh giá trung bình</h3>
                    <span className="text-6xl font-black text-gray-800">{displayRating}</span>
                    <div className="my-3">{renderStars(Number(displayRating), "text-[24px]")}</div>
                    <span className="text-sm text-gray-500 font-medium">{totalReviews} lượt đánh giá</span>
                </div>
                
                <div className="md:col-span-8 flex flex-col justify-center space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-4">
                            <div className="flex items-center gap-1 w-12 shrink-0">
                                <span className="font-bold text-gray-600">{star}</span>
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                            </div>
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-yellow-400 rounded-full" 
                                    style={{ width: `${getStarPercentage(star)}%` }}
                                ></div>
                            </div>
                            <span className="text-sm text-gray-500 font-medium w-10 text-right">
                                {getStarCount(star)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-bold text-gray-800">Đánh giá từ khách hàng</h3>
                {eligibleOrderItemId && (
                    <button 
                        onClick={() => setIsWritingReview(!isWritingReview)} 
                        className={`px-5 py-2.5 font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 text-sm ${isWritingReview ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary text-white hover:bg-[#2f5146]'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {isWritingReview ? 'close' : 'edit_square'}
                        </span>
                        {isWritingReview ? "Hủy" : "Viết đánh giá"}
                    </button>
                )}
            </div>

            {isWritingReview && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-10 border border-gray-200"
                >
                    <h4 className="font-bold text-gray-800 mb-4 text-lg">Đánh giá sản phẩm này</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-700">Chất lượng:</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setNewRating(star)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 ${star <= (hoverRating || newRating) ? "text-yellow-400" : "text-gray-300"}`}>
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-500">
                                {newRating === 5 ? "Tuyệt vời" : newRating === 4 ? "Rất tốt" : newRating === 3 ? "Bình thường" : newRating === 2 ? "Kém" : "Rất tệ"}
                            </span>
                        </div>

                        <div>
                            <textarea required rows={4} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none bg-white text-sm font-medium text-gray-800"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Thêm hình ảnh (Tối đa 3 ảnh)</label>
                            <div className="flex flex-wrap gap-4 mt-2">
                                {reviewImages.map((src, index) => (
                                    <div key={index} className="relative w-20 h-20 rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                                        <img src={src} alt="preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button type="button" onClick={() => handleRemoveImage(index)} className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </div>
                                    </div>
                                ))}
                                {reviewImages.length < 3 && (
                                    <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center bg-white hover:bg-primary/5 cursor-pointer transition-colors">
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button type="submit" className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-[#2f5146] transition-colors shadow-md">Gửi đánh giá</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="space-y-4">
                {reviewsList.map((review: any) => (
                    <div key={review.id} className="flex gap-4 sm:gap-6 border border-gray-100 rounded-xl p-5 hover:bg-gray-50 transition-colors">
                        <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0" />
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h4 className="font-bold text-gray-800">{review.user}</h4>
                                    {renderStars(review.rating, "text-[16px]")}
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 font-medium block">{review.date}</span>
                                    {review.updatedAt && <span className="text-[10px] text-gray-400 font-medium block">(Đã sửa: {review.updatedAt})</span>}
                                </div>
                            </div>
                            <p className="text-gray-600 mt-2 font-medium leading-relaxed">{review.content}</p>
                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-3 mt-4">
                                    {review.images.map((img: string, idx: number) => (
                                        <img key={idx} src={img.trim()} alt="Review" className="w-20 h-20 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                                    ))}
                                </div>
                            )}

                            {/* Nút phản hồi dành cho Admin hoặc User đã mua sản phẩm */}
                            {(user?.role === 'ADMIN' || hasBoughtProduct) && (
                                <button 
                                    onClick={() => { setReplyingReviewId(review.id); setReplyText(""); }}
                                    className="text-xs text-primary font-bold mt-3 flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-lg w-fit transition-colors hover:bg-primary/10"
                                >
                                    <span className="material-symbols-outlined text-[16px]">reply</span> Phản hồi đánh giá này
                                </button>
                            )}

                            {/* Form phản hồi */}
                            {replyingReviewId === review.id && (
                                <form 
                                    onSubmit={(e) => handleReplySubmit(e, review.id)}
                                    className="mt-3 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in"
                                >
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={user?.role === 'ADMIN' ? "Nhập nội dung phản hồi với tư cách Quản trị viên..." : "Nhập bình luận phản hồi của bạn..."}
                                        required
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setReplyingReviewId(null)}
                                            className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingReply}
                                            className="px-4 py-1.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-[#2f5146] transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
                                        >
                                            {isSubmittingReply && <span className="material-symbols-outlined animate-spin text-[14px]">autorenew</span>}
                                            {isSubmittingReply ? "Đang gửi..." : "Gửi phản hồi"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {review.replies && review.replies.length > 0 && (
                                <div className="mt-5 space-y-4">
                                    {review.replies.map((reply: any, idx: number) => (
                                        <div key={idx} className="flex gap-3 md:gap-4">
                                            <div className="w-1 md:w-1.5 bg-gray-200 rounded-full shrink-0"></div>
                                            <div className={`flex-1 ${reply.isAdmin ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-200'} rounded-2xl p-4 md:p-5 border`}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {reply.avatar ? (
                                                            <img src={reply.avatar} alt={reply.shopName} className={`w-8 h-8 rounded-full object-cover shadow-sm border ${reply.isAdmin ? 'border-emerald-200' : 'border-gray-300'}`} />
                                                        ) : (
                                                            <div className={`w-8 h-8 rounded-full ${reply.isAdmin ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                                                                {reply.shopName.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`material-symbols-outlined ${reply.isAdmin ? 'text-emerald-600' : 'text-gray-400'} text-[18px]`}>reply</span>
                                                            <p className={`text-sm font-bold ${reply.isAdmin ? 'text-emerald-800' : 'text-gray-700'}`}>{reply.isAdmin ? reply.shopName : `Phản hồi từ ${reply.shopName}`}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-auto shrink-0 flex items-start gap-3">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs text-gray-500 font-medium block">{reply.date}</span>
                                                            {(reply.editCount || 0) > 0 && reply.updatedAt && (
                                                                <span className="text-[10px] text-gray-400 font-medium block mt-0.5">(Đã sửa: {reply.updatedAt})</span>
                                                            )}
                                                        </div>
                                                        {/* Nút hành động cho phản hồi */}
                                                        {(user?.id === reply.userId || user?.role === 'ADMIN') && editingReplyId !== reply.id && (
                                                            <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                                                {user?.id === reply.userId && (!reply.editCount || reply.editCount < 2) && (
                                                                    <button onClick={() => { setEditingReplyId(reply.id); setEditReplyText(reply.content); }} className="text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                                                                )}
                                                                <button onClick={() => handleDeleteReply(reply.id)} className="text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {editingReplyId === reply.id ? (
                                                    <form onSubmit={(e) => handleEditReplySubmit(e, reply.id)} className="mt-2 pl-11">
                                                        <textarea required rows={2} value={editReplyText} onChange={(e) => setEditReplyText(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm" />
                                                        <div className="flex justify-end gap-2 mt-2">
                                                            <button type="button" onClick={() => setEditingReplyId(null)} className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                                                                Hủy
                                                            </button>
                                                            <button type="submit" disabled={isSubmittingReply} className="px-3 py-1.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-[#2f5146] transition-colors shadow-sm flex items-center gap-1">
                                                                {isSubmittingReply ? <span className="material-symbols-outlined animate-spin text-[14px]">autorenew</span> : "Cập nhật"}
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <p className="text-sm text-gray-700 font-medium leading-relaxed pl-11">{reply.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}