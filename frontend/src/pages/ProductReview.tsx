import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function ProductReview() {
    const navigate = useNavigate();
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Mock data sản phẩm đang được đánh giá
    const product = {
        id: 1,
        name: "Terrarium Forest Mini",
        category: "Terrarium",
        image: "/images/terrarium.png",
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            // Cho phép upload tối đa 3 ảnh
            setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 3)); 
        }
    };

    const handleRemoveImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Cảm ơn bạn đã gửi đánh giá cho sản phẩm này!");
        navigate("/products");
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#fff8f5] pt-[84px] pb-12 px-4 sm:px-6 lg:px-8 font-body flex flex-col">
                <div className="max-w-4xl w-full mx-auto">
                    
                    {/* Nút quay lại */}
                    <div className="mb-6" style={{marginTop: "-50px"}}>
                        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-primary font-bold group">
                            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">
                                arrow_back
                            </span>
                            <span>Quay lại</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        
                        {/* Thông tin sản phẩm */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
                                <p className="text-sm text-gray-500 font-medium">Phân loại: {product.category}</p>
                            </div>
                        </div>

                        {/* Form Đánh giá */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            
                            {/* Đánh giá sao */}
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <p className="font-bold text-gray-700 text-lg">Bạn cảm thấy sản phẩm này thế nào?</p>
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
                                                className={`material-symbols-outlined text-4xl md:text-5xl ${
                                                    star <= (hoverRating || rating)
                                                        ? "text-yellow-400"
                                                        : "text-gray-200"
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

                            {/* Text Nhận xét */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Chia sẻ trải nghiệm của bạn <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    rows={5}
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này nhé..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none bg-gray-50 focus:bg-white text-sm font-medium text-gray-800"
                                ></textarea>
                            </div>

                            {/* Hình ảnh/Video đính kèm */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Thêm hình ảnh thực tế (Tối đa 3)</label>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                                            <img src={src} alt="preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button type="button" onClick={() => handleRemoveImage(index)} className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 3 && (
                                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center bg-gray-50 hover:bg-primary-container/10 cursor-pointer transition-colors">
                                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
                                            <span className="text-[10px] text-gray-500 mt-1 font-medium">Thêm ảnh</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="pt-6 mt-2 border-t border-gray-100 flex gap-3">
                                <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="flex-1 py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-[#2f5146] transition-colors shadow-md">
                                    Gửi đánh giá
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}