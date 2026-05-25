import React, { useState, useEffect } from "react";

interface MyReviewsProps {
    userReviews: any[];
    pendingReviews: any[];
    onReviewClick: (item: any) => void;
}

export default function MyReviews({ userReviews, pendingReviews, onReviewClick }: MyReviewsProps) {
    const [reviewFilter, setReviewFilter] = useState<'pending' | 'completed'>('pending');

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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
                                            <span className="text-xs text-gray-500 font-medium">{review.date}</span>
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