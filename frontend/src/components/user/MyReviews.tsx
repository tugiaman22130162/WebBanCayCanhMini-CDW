import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface MyReviewsProps {
    userReviews: any[];
    pendingReviews: any[];
    onReviewClick: (item: any) => void;
    onEditReviewClick: (item: any) => void;
    onDeleteReviewClick: (reviewId: number) => void;
    onReplyReviewSubmit: (reviewId: number, content: string) => Promise<void>;
    onEditReplySubmit: (replyId: number, content: string) => Promise<void>;
    onDeleteReplyClick: (replyId: number) => void;
}

export default function MyReviews({ userReviews, pendingReviews, onReviewClick, onEditReviewClick, onDeleteReviewClick, onReplyReviewSubmit, onEditReplySubmit, onDeleteReplyClick }: MyReviewsProps) {
    const [searchParams] = useSearchParams();
    const tabQuery = searchParams.get("tab");

    const [reviewFilter, setReviewFilter] = useState<'pending' | 'completed'>(tabQuery === 'reviewed' ? 'completed' : 'pending');
    const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    const [editReplyText, setEditReplyText] = useState("");

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        if (tabQuery === 'reviewed') {
            setReviewFilter('completed');
        }
    }, [tabQuery]);

    // Reset trang về 1 mỗi khi chuyển Tab (Chưa đánh giá / Đã đánh giá)
    useEffect(() => {
        setCurrentPage(1);
    }, [reviewFilter]);

    const currentList = reviewFilter === 'completed' ? userReviews : pendingReviews;
    const totalPages = Math.ceil(currentList.length / itemsPerPage);
    const paginatedList = currentList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
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
                    paginatedList.length > 0 ? (
                        paginatedList.map(review => (
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
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-gray-500 font-medium">{review.date}</span>
                                                {review.updatedAt && (
                                                    <span className="text-[10px] text-gray-400 mt-0.5">(Đã sửa: {review.updatedAt})</span>
                                                )}
                                                {(!review.editCount || review.editCount < 2) && (
                                                    <button onClick={() => onEditReviewClick(review)} className="mt-2 text-xs text-primary font-bold flex items-center gap-1 group hover:text-[#2f5146] transition-colors">
                                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                                        <span className="group-hover">Chỉnh sửa</span>
                                                    </button>
                                                )}
                                                <button onClick={() => onDeleteReviewClick(review.id)} className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1 group hover:text-red-700 transition-colors">
                                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                                    <span className="group-hover">Xóa</span>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-3">{review.content}</p>
                                        
                                        {review.reviewImages && review.reviewImages.length > 0 && (
                                            <div className="flex gap-2 mt-3">
                                                {review.reviewImages.map((imgUrl: string, idx: number) => (
                                                    <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
                                                        <img src={imgUrl} alt="Review" className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* PHẢN HỒI TỪ ADMIN */}
                                        {review.replies && review.replies.length > 0 && (
                                            <div className="mt-4 space-y-3">
                                                {review.replies.map((reply: any, idx: number) => (
                                                    <div key={idx} className="flex gap-3">
                                                        <div className="w-1 bg-gray-200 rounded-full shrink-0"></div>
                                                        <div className={`flex-1 ${reply.isAdmin ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-200'} rounded-xl p-3 border`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {reply.avatar ? (
                                                                        <img src={reply.avatar} alt={reply.shopName} className={`w-6 h-6 rounded-full object-cover shadow-sm border ${reply.isAdmin ? 'border-emerald-200' : 'border-gray-200'}`} />
                                                                    ) : (
                                                                        <div className={`w-6 h-6 rounded-full ${reply.isAdmin ? 'bg-primary' : 'bg-gray-400'} text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm`}>
                                                                            {reply.shopName ? reply.shopName.charAt(0).toUpperCase() : 'M'}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-1">
                                                                        <span className={`material-symbols-outlined ${reply.isAdmin ? 'text-emerald-600' : 'text-gray-500'} text-[14px]`}>reply</span>
                                                                        <p className={`text-xs font-bold ${reply.isAdmin ? 'text-emerald-800' : 'text-gray-700'}`}>{reply.isAdmin ? reply.shopName : `Phản hồi từ ${reply.shopName}`}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-auto shrink-0 flex items-start gap-2">
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-[10px] text-gray-500 font-medium block">{reply.date}</span>
                                                                        {(reply.editCount || 0) > 0 && reply.updatedAt && <span className="text-[9px] text-gray-400 font-medium block">(Đã sửa: {reply.updatedAt})</span>}
                                                                    </div>
                                                                    {!reply.isAdmin && editingReplyId !== reply.id && (
                                                                        <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                                                            {(!reply.editCount || reply.editCount < 2) && (
                                                                                <button onClick={() => { setEditingReplyId(reply.id); setEditReplyText(reply.content); }} className="text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                                                                            )}
                                                                            <button onClick={() => onDeleteReplyClick(reply.id)} className="text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            {editingReplyId === reply.id ? (
                                                                <form onSubmit={async (e) => { e.preventDefault(); await onEditReplySubmit(reply.id, editReplyText); setEditingReplyId(null); setEditReplyText(""); }} className="mt-2 pl-8">
                                                                    <textarea required rows={2} value={editReplyText} onChange={(e) => setEditReplyText(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-xs" />
                                                                    <div className="flex justify-end gap-2 mt-2">
                                                                        <button type="button" onClick={() => setEditingReplyId(null)} className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                                                                            Hủy
                                                                        </button>
                                                                        <button type="submit" className="px-3 py-1.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-[#2f5146] transition-colors shadow-sm flex items-center gap-1">
                                                                            Cập nhật
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            ) : (
                                                                <p className="text-xs text-gray-700 font-medium leading-relaxed pl-8">{reply.content}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Nút phản hồi dành cho User */}
                                        <button 
                                            onClick={() => { setReplyingReviewId(review.id); setReplyText(""); }}
                                            className="text-xs text-primary font-bold mt-4 flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-lg w-fit transition-colors hover:bg-primary/10"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">reply</span> Phản hồi
                                        </button>

                                        {/* Form nhập phản hồi */}
                                        {replyingReviewId === review.id && (
                                            <form 
                                                onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    if (!replyText.trim()) return;
                                                    setIsSubmittingReply(true);
                                                    try {
                                                        await onReplyReviewSubmit(review.id, replyText);
                                                        setReplyingReviewId(null);
                                                        setReplyText("");
                                                    } catch (error) {
                                                        console.error(error);
                                                    } finally {
                                                        setIsSubmittingReply(false);
                                                    }
                                                }}
                                                className="mt-3 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in"
                                            >
                                                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Nhập bình luận phản hồi của bạn..." required rows={3} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm" />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button type="button" onClick={() => setReplyingReviewId(null)} className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                                                        Hủy
                                                    </button>
                                                    <button type="submit" disabled={isSubmittingReply} className="px-4 py-1.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-[#2f5146] transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm">
                                                        {isSubmittingReply && <span className="material-symbols-outlined animate-spin text-[14px]">autorenew</span>}
                                                        {isSubmittingReply ? "Đang gửi..." : "Gửi phản hồi"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
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
                    paginatedList.length > 0 ? (
                        paginatedList.map(item => (
                            <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex gap-4">
                                    <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                                    <div>
                                        <h4 className="font-bold text-gray-800">{item.productName}</h4>
                                        <p className="text-sm text-gray-500 mt-1">Đơn hàng: <span className="font-medium">{item.orderId}</span></p>
                                        <p className="text-xs text-gray-400 mt-1">Ngày giao: {item.date}</p>
                                    </div>
                                </div>
                                <button onClick={() => onReviewClick(item)} className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-[#2f5146] transition-colors whitespace-nowrap shadow-sm">
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

            {/* Điều hướng phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 text-sm text-gray-500">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded transition ${currentPage === page ? 'bg-primary text-white font-bold' : 'border hover:bg-gray-50'}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}