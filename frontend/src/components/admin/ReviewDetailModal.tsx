import React, { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";
import Swal from "sweetalert2";

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
        shopName?: string;
        date?: string;
        avatar?: string;
        isAdmin?: boolean;
        updatedAt?: string;
        editCount?: number;
    }[];
};

interface ReviewDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    review: Review | null;
    onSuccess: () => void;
}

export default function ReviewDetailModal({ isOpen, onClose, review, onSuccess }: ReviewDetailModalProps) {
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);

    useEffect(() => {
        if (review && isOpen) {
            setReplyContent("");
            setEditingReplyId(null);
        }
    }, [review, isOpen]);

    if (!isOpen || !review) return null;

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            
            if (editingReplyId) {
                await axios.put(`http://localhost:8080/api/reviews/reply/${editingReplyId}`, {
                    comment: replyContent.trim()
                }, { headers: { Authorization: `Bearer ${token}` } });
                showSuccessToast("Cập nhật phản hồi thành công!", 2000);
            } else {
                await axios.post(`http://localhost:8080/api/reviews/reply`, {
                    reviewId: review.id,
                    comment: replyContent.trim()
                }, { headers: { Authorization: `Bearer ${token}` } });
                showSuccessToast("Gửi phản hồi thành công!", 2000);
            }
            
            setReplyContent("");
            setEditingReplyId(null);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Lỗi khi gửi phản hồi:", error);
            const msg = error.response?.data?.message || error.response?.data || "Có lỗi xảy ra khi phản hồi";
            showErrorToast(typeof msg === 'string' ? msg : "Có lỗi xảy ra", 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReplyContent("");
        setEditingReplyId(null);
        onClose();
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
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:8080/api/reviews/reply/${replyId}`, { headers: { Authorization: `Bearer ${token}` } });
                showSuccessToast("Đã xóa phản hồi thành công!", 2000);
                onSuccess();
            } catch (error: any) {
                showErrorToast(error.response?.data?.message || "Có lỗi xảy ra khi xóa", 2000);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Chi Tiết Đánh Giá & Phản Hồi</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6 space-y-6">
                    {/* Chi tiết đánh giá */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={review.image} alt={review.productName} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                            <div>
                                <h4 className="font-bold text-[#406D5E]">{review.productName}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-gray-500">{review.customerName} - {new Date(review.createdAt).toLocaleString('vi-VN')}</p>
                                    {(review.editCount || 0) > 0 && (
                                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100" title={`Cập nhật lúc: ${review.updatedAt ? new Date(review.updatedAt).toLocaleString('vi-VN') : ''}`}>
                                            Đã sửa ({review.editCount} lần)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                        </div>
                        <p className="text-sm text-gray-700 italic">"{review.comment || 'Không có bình luận'}"</p>
                    </div>

                    {/* Lịch sử phản hồi */}
                    {review.replies && review.replies.length > 0 && (
                        <div className="space-y-4 border-t border-gray-100 pt-5">
                            <h4 className="font-bold text-gray-800">Lịch sử phản hồi:</h4>
                            {review.replies.map(reply => (
                                <div key={reply.id} className="flex gap-3">
                                    {reply.avatar ? (
                                        <img src={reply.avatar} alt={reply.shopName} className={`w-10 h-10 rounded-full object-cover border ${reply.isAdmin ? 'border-emerald-200' : 'border-gray-200'}`} />
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full ${reply.isAdmin ? 'bg-primary' : 'bg-gray-400'} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}>
                                            {reply.shopName ? reply.shopName.charAt(0).toUpperCase() : 'M'}
                                        </div>
                                    )}
                                    <div className={`flex-1 ${reply.isAdmin ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-200'} rounded-2xl p-4 border`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className={`font-bold ${reply.isAdmin ? 'text-emerald-800' : 'text-gray-800'}`}>{reply.shopName}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-xs text-gray-500">{reply.date}</p>
                                                    {(reply.editCount || 0) > 0 && reply.updatedAt && (
                                                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100" title={`Cập nhật lúc: ${reply.updatedAt}`}>
                                                            Đã sửa ({reply.updatedAt})
                                                        </span>
                                                    )}
                                                    {reply.isAdmin && (!reply.editCount || reply.editCount < 2) && editingReplyId !== reply.id && (
                                                        <button 
                                                            onClick={() => {
                                                                setEditingReplyId(reply.id);
                                                                setReplyContent(reply.content);
                                                            }}
                                                            className="text-emerald-600 hover:text-primary transition-colors flex items-center ml-1"
                                                            title={`Sửa phản hồi này (Còn ${2 - (reply.editCount || 0)} lần)`}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                                        </button>
                                                    )}
                                                    {reply.isAdmin && (
                                                        <button 
                                                            onClick={() => handleDeleteReply(reply.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors flex items-center ml-1"
                                                            title="Xóa phản hồi này"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {editingReplyId === reply.id ? (
                                            <form onSubmit={handleReplySubmit} className="mt-2">
                                                <textarea 
                                                    rows={3}
                                                    required
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
                                                ></textarea>
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button type="button" onClick={() => { setEditingReplyId(null); setReplyContent(""); }} className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                                                        Hủy
                                                    </button>
                                                    <button type="submit" disabled={!replyContent.trim() || isSubmitting} className="px-3 py-1.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-[#2f5146] transition-colors shadow-sm flex items-center gap-1">
                                                        {isSubmitting ? <span className="material-symbols-outlined animate-spin text-[14px]">autorenew</span> : "Cập nhật"}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Form thêm phản hồi mới (ẩn đi khi đang sửa bình luận) */}
                    {!editingReplyId && (
                        <form onSubmit={handleReplySubmit} className="space-y-3">
                            <label className="block text-sm font-bold text-gray-800">Thêm phản hồi mới</label>
                            <textarea 
                                rows={3}
                                required
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Nhập nội dung phản hồi khách hàng..."
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
                            ></textarea>
                            
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors">
                                    Đóng
                                </button>
                                <button type="submit" disabled={!replyContent.trim() || isSubmitting} className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm">
                                    {isSubmitting ? <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> : <span className="material-symbols-outlined text-[18px]">send</span>}
                                    Gửi phản hồi
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}