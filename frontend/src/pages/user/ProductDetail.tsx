import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ProductCard from "../../components/user/ProductCard";
import { useFavorites } from "../../data/useFavorites";
import axios from "axios";
import { motion } from "framer-motion";

// --- MOCK DATA ---
const mockReviews = [
    {
        id: 1,
        user: "Nguyễn Trần Nhã Uyên",
        avatar: "https://i.pravatar.cc/150?u=uyen",
        rating: 5,
        date: "25/04/2026",
        content: "Bình terrarium rất đẹp, rêu xanh mướt. Gói hàng cực kỳ cẩn thận không bị xô lệch chút nào. Sẽ ủng hộ shop thêm nhiều lần nữa!",
        images: ["/images/terrarium.png"],
        reply: {
            shopName: "MiniGarden",
            date: "26/04/2026",
            content: "Dạ MiniGarden cảm ơn bạn Nhã Uyên đã tin tưởng và gửi đánh giá 5 sao. Chúc bạn có không gian làm việc thật thư giãn với chiếc bình Terrarium này nhé 🥰"
        }
    },
    {
        id: 2,
        user: "Trần Minh Hoàng",
        avatar: "https://i.pravatar.cc/150?u=hoang",
        rating: 4,
        date: "22/04/2026",
        content: "Cây đẹp y hình, nhân viên tư vấn nhiệt tình. Tuy nhiên thời gian giao hàng hơi lâu một chút do mình ở tỉnh.",
        images: [],
        reply: {
            shopName: "MiniGarden",
            date: "23/04/2026",
            content: "Cảm ơn anh Hoàng đã góp ý ạ! Shop sẽ làm việc lại với đơn vị vận chuyển để cải thiện thời gian giao hàng đi tỉnh nhanh hơn trong tương lai. Rất mong anh tiếp tục ủng hộ shop nha!"
        }
    }
];

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isFavorited, toggleFavorite } = useFavorites();

    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [viewedProducts, setViewedProducts] = useState<any[]>([]);

    const [mainImage, setMainImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'care' | 'reviews'>('description');

    // State quản lý Form Viết đánh giá
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviewImages, setReviewImages] = useState<string[]>([]);

    // State lưu trữ danh sách bình luận (để hiển thị ngay khi vừa thêm)
    const [reviewsList, setReviewsList] = useState<any[]>(mockReviews);

    // Gọi API lấy dữ liệu sản phẩm
    useEffect(() => {
        const fetchProductDetail = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8080/api/products/${id}`);
                const data = response.data;
                
                // Format dữ liệu API trả về để đưa vào giao diện
                const formattedProduct = {
                    id: data.id,
                    name: data.name,
                    price: data.price || 0,
                    originalPrice: data.price ? data.price * 1.2 : 0, // Làm mờ giá gốc để tạo hiệu ứng giảm giá (tùy chọn)
                    rating: 4.8, // Tạm thời Fake rating nếu DB chưa có
                    reviewCount: mockReviews.length,
                    soldCount: 350,
                    category: data.categoryName || data.category?.name || data.category || "Chưa phân loại",
                    images: data.images?.length > 0 ? data.images : ["https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=600&h=600&fit=crop"],
                    description: data.description || "Chưa có mô tả cho sản phẩm này.",
                    summary: {
                        light: data.details?.light || "Ánh sáng gián tiếp hoặc đèn huỳnh quang.",
                        water: data.details?.water || "Tưới khi thấy đất mặt đã khô.",
                        temperature: data.details?.temperature || "18°C - 28°C (Mát mẻ, phòng máy lạnh)."
                    },
                    care: {
                        light: data.details?.care_instruction?.sunlight || data.details?.light || "Nên đặt cây ở nơi có ánh sáng tự nhiên.",
                        water: data.details?.care_instruction?.watering || data.details?.water || "Tưới lượng vừa đủ để đất ẩm nhẹ.",
                        temperature: data.details?.temperature || "Phù hợp với khí hậu trong nhà.",
                        fertilizer: data.details?.care_instruction?.fertilizing || "Bón phân định kỳ mỗi tháng 1 lần."
                    },
                    specifications: {
                        size: data.details?.size || "Đang cập nhật",
                        origin: data.details?.origin || "Đang cập nhật",
                        potType: data.details?.potType || "Đang cập nhật",
                        weight: data.details?.weight ? `${data.details?.weight} kg` : "Đang cập nhật",
                        note: data.details?.note || ""
                    },
                    stock: data.quantity || 0
                };
                
                setProduct(formattedProduct);
                setMainImage(formattedProduct.images[0]);

                // --- Xử lý Cập nhật và Lấy Sản phẩm vừa xem từ LocalStorage ---
                const viewed = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
                const updatedViewed = viewed.filter((item: any) => item.id !== formattedProduct.id);
                updatedViewed.unshift({
                    id: formattedProduct.id,
                    name: formattedProduct.name,
                    price: formattedProduct.price,
                    image: formattedProduct.images[0],
                    category: formattedProduct.category
                });
                // Chỉ lưu tối đa 5 sản phẩm gần nhất (để khi trừ sản phẩm hiện tại ra vẫn còn đủ 4)
                if (updatedViewed.length > 5) updatedViewed.pop();
                localStorage.setItem("viewedProducts", JSON.stringify(updatedViewed));
                
                // Cập nhật state (bỏ sản phẩm hiện tại ra khỏi danh sách vừa xem)
                setViewedProducts(updatedViewed.filter((item: any) => item.id !== formattedProduct.id).slice(0, 4));

                // --- Gọi API Lấy sản phẩm liên quan (Gợi ý) từ DB ---
                try {
                    // Lấy tất cả sản phẩm đang có trong Database
                    const relatedRes = await axios.get(`http://localhost:8080/api/products`);
                    
                    // Lọc ra các sản phẩm có "cùng Danh mục" và "khác ID sản phẩm hiện tại"
                    const sameCategoryProducts = relatedRes.data.filter((item: any) => {
                        const itemCategory = item.categoryName || item.category?.name || item.category;
                        const currentCategory = data.categoryName || data.category?.name || data.category;
                        return itemCategory === currentCategory && item.id !== data.id;
                    }).slice(0, 4); // Chỉ lấy tối đa 4 sản phẩm

                    const formattedRelated = sameCategoryProducts.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price || 0,
                        image: (item.images && item.images.length > 0) ? item.images[0] : "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=400&h=400&fit=crop",
                        category: item.categoryName || item.category?.name || item.category || "Chưa phân loại"
                    }));
                    setRelatedProducts(formattedRelated);
                } catch (err) {
                    console.error("Lỗi tải sản phẩm liên quan:", err);
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết sản phẩm:", err);
                setError("Không thể tải thông tin sản phẩm. Vui lòng kiểm tra lại.");
            } finally {
                setIsLoading(false);
            }
        };

        window.scrollTo(0, 0);
        setQuantity(1);
        if (id) {
            fetchProductDetail();
        }
    }, [id]);

    // Xử lý tải ảnh đánh giá
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setReviewImages(prev => [...prev, ...newPreviews].slice(0, 3)); // Tối đa 3 ảnh
        }
    };

    const handleRemoveImage = (index: number) => {
        setReviewImages(prev => prev.filter((_, i) => i !== index));
    };

    // Xử lý submit đánh giá
    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewText.trim()) {
            alert("Vui lòng nhập nội dung đánh giá!");
            return;
        }

        // Tạo đối tượng bình luận mới
        const newReviewObj = {
            id: Date.now(),
            user: "Khách hàng (Bạn)",
            avatar: "https://i.pravatar.cc/150?u=khachhang",
            rating: newRating,
            date: new Date().toLocaleDateString('vi-VN'),
            content: reviewText,
            images: reviewImages
        };

        // Thêm ngay vào đầu danh sách hiển thị
        setReviewsList(prev => [newReviewObj, ...prev]);

        setIsWritingReview(false);
        setReviewText("");
        setReviewImages([]);
        setNewRating(5);
    };

    const handleAddToCart = () => {
        alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
    };

    const handleBuyNow = () => {
        navigate("/checkout");
    };

    const renderStars = (rating: number, size = "text-[20px]") => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                    // Tính phần trăm fill cho từng ngôi sao (ví dụ rating 4.8 -> ngôi sao thứ 5 sẽ được fill 80%)
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

    // Tính tổng số lượng đánh giá thực tế sau khi thêm
    const totalReviews = (product?.reviewCount || 0) - mockReviews.length + reviewsList.length;

    if (isLoading) {
        return (
            <MainLayout>
                <div className="bg-[#F8F9F5] min-h-screen pt-[150px] pb-24 flex justify-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                        <p className="font-medium">Đang tải thông tin sản phẩm...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !product) {
        return (
            <MainLayout>
                <div className="bg-[#F8F9F5] min-h-screen pt-[150px] pb-24 flex justify-center">
                    <div className="text-center text-red-500 font-bold flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl">error</span>
                        <p>{error || "Sản phẩm không tồn tại"}</p>
                        <Link to="/products" className="mt-4 px-6 py-2 bg-primary text-white rounded-xl hover:bg-[#2f5146] transition-colors shadow-md">Quay lại cửa hàng</Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="bg-[#F8F9F5] min-h-screen pt-[100px] pb-24 font-body">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                    
                    {/* Breadcrumbs */}
                    <motion.nav 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex text-sm text-gray-500 mb-8"
                    >
                        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span className="mx-2">/</span>
                        <Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
                        <span className="mx-2">/</span>
                        <Link to="/products" className="hover:text-primary transition-colors">{product.category}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800 font-semibold truncate">{product.name}</span>
                    </motion.nav>

                    {/* --- PRODUCT TOP SECTION --- */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="bg-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
                    >
                        
                        {/* Hình ảnh */}
                        <div className="flex flex-col gap-4 lg:col-span-5 xl:col-span-5">
                            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                                <img src={mainImage} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                                {product.images.map((img: string, idx: number) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setMainImage(img)}
                                        className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chi tiết thông tin */}
                        <div className="flex flex-col lg:col-span-7 xl:col-span-7">
                            <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">{product.category}</p>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 leading-tight">{product.name}</h1>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-5">
                                <div className="flex items-center gap-2">
                                    {renderStars(product.rating)}
                                    <span className="font-bold text-gray-700">{product.rating}</span>
                                </div>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-gray-600 text-sm"><span className="font-bold text-gray-800">{totalReviews}</span> Đánh giá</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-gray-600 text-sm">Đã bán <span className="font-bold text-gray-800">{product.soldCount}</span></span>
                            </div>

                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-3xl md:text-4xl font-black text-primary">{product.price.toLocaleString('vi-VN')}đ</span>
                                {product.originalPrice > product.price && (
                                    <>
                                        <span className="text-lg text-gray-400 line-through mb-1 font-semibold">{product.originalPrice.toLocaleString('vi-VN')}đ</span>
                                        <span className="text-sm font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-lg mb-1">
                                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="bg-emerald-50 rounded-2xl p-5 mb-6 border border-emerald-100 space-y-3">
                                <h3 className="font-bold text-emerald-800 text-sm uppercase tracking-wider mb-2">Tóm tắt chăm sóc</h3>
                                <div className="flex items-center gap-3 text-sm text-emerald-700">
                                    <span className="material-symbols-outlined text-[20px]">light_mode</span>
                                    <span className="font-medium line-clamp-1">{product.summary.light}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-emerald-700">
                                    <span className="material-symbols-outlined text-[20px]">water_drop</span>
                                    <span className="font-medium line-clamp-1">{product.summary.water}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-emerald-700">
                                    <span className="material-symbols-outlined text-[20px]">thermostat</span>
                                    <span className="font-medium line-clamp-1">{product.summary.temperature}</span>
                                </div>
                            </div>

                            <div className="mt-auto space-y-5">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-700">Số lượng:</span>
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-12">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined font-bold">remove</span>
                                        </button>
                                        <span className="w-12 h-full flex items-center justify-center font-bold text-gray-800 bg-white">
                                            {quantity}
                                        </span>
                                        <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined font-bold">add</span>
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium ml-2">Còn {product.stock} sản phẩm</span>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={handleAddToCart} className="flex-1 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors flex justify-center items-center gap-2">
                                        <span className="material-symbols-outlined">add_shopping_cart</span>
                                        Thêm Vào Giỏ
                                    </button>
                                    <button onClick={handleBuyNow} className="flex-1 py-4 bg-primary text-white font-bold rounded-xl hover:bg-[#2f5146] shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                                        Mua Ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* --- TABS SECTION --- */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.7 }}
                        className="mt-16 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="flex border-b border-gray-100 overflow-x-auto hide-scrollbar">
                            <button 
                                onClick={() => setActiveTab('description')}
                                className={`px-8 py-5 text-sm sm:text-base font-bold whitespace-nowrap transition-colors relative ${activeTab === 'description' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Mô tả sản phẩm
                                {activeTab === 'description' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-md"></span>}
                            </button>
                            <button 
                                onClick={() => setActiveTab('care')}
                                className={`px-8 py-5 text-sm sm:text-base font-bold whitespace-nowrap transition-colors relative ${activeTab === 'care' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Hướng dẫn chăm sóc
                                {activeTab === 'care' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-md"></span>}
                            </button>
                            <button 
                                onClick={() => setActiveTab('reviews')}
                                className={`px-8 py-5 text-sm sm:text-base font-bold whitespace-nowrap transition-colors relative ${activeTab === 'reviews' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Đánh giá ({totalReviews})
                                {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-md"></span>}
                            </button>
                        </div>

                        <div className="p-6 md:p-10">
                            {/* Tab 1: Mô tả */}
                            {activeTab === 'description' && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                                >
                                    <h4 className="text-xl font-bold text-gray-800 mb-4">Thông số chi tiết</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm">
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500 font-bold">Kích thước:</span>
                                            <span className="font-bold text-gray-800">{product.specifications.size}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500 font-bold">Xuất xứ:</span>
                                            <span className="font-bold text-gray-800">{product.specifications.origin}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2 sm:border-b-0">
                                            <span className="text-gray-500 font-bold">Loại chậu:</span>
                                            <span className="font-bold text-gray-800">{product.specifications.potType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-bold">Trọng lượng:</span>
                                            <span className="font-bold text-gray-800">{product.specifications.weight}</span>
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-bold text-gray-800 mb-4">Mô tả sản phẩm</h4>
                                    <div className="prose max-w-none text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                                        {product.description}
                                    </div>

                                    {product.specifications.note && (
                                        <div className="mt-8 bg-orange-50 border border-orange-100 p-4 rounded-xl text-orange-800 text-sm font-medium flex gap-3 items-start">
                                            <span className="material-symbols-outlined text-orange-500">info</span>
                                            <div><span className="font-bold block mb-1">Lưu ý:</span> {product.specifications.note}</div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Tab 2: Chăm sóc */}
                            {activeTab === 'care' && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                                    className="grid sm:grid-cols-2 gap-8"
                                >
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-2xl">light_mode</span>
                                        </div>
                                        <h4 className="font-bold text-gray-800 mb-2">Ánh sáng</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">{product.care.light}</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-2xl">water_drop</span>
                                        </div>
                                        <h4 className="font-bold text-gray-800 mb-2">Tưới nước</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">{product.care.water}</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-2xl">thermostat</span>
                                        </div>
                                        <h4 className="font-bold text-gray-800 mb-2">Nhiệt độ & Độ ẩm</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">{product.care.temperature}</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-2xl">eco</span>
                                        </div>
                                        <h4 className="font-bold text-gray-800 mb-2">Dinh dưỡng</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">{product.care.fertilizer}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Tab 3: Đánh giá */}
                            {activeTab === 'reviews' && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                                >
                                    <div className="grid md:grid-cols-12 gap-10 border-b border-gray-100 pb-10 mb-10">
                                        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <h3 className="text-gray-500 font-bold mb-2">Đánh giá trung bình</h3>
                                            <span className="text-6xl font-black text-gray-800">{product.rating}</span>
                                            <div className="my-3">{renderStars(product.rating, "text-[24px]")}</div>
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
                                                            style={{ width: star === 5 ? '80%' : star === 4 ? '15%' : star === 3 ? '5%' : '0%' }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-500 font-medium w-10 text-right">
                                                        {star === 5 ? '98' : star === 4 ? '20' : star === 3 ? '6' : '0'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nút Viết Đánh Giá & Form */}
                                    <div className="flex justify-between items-end mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">Đánh giá từ khách hàng</h3>
                                        <button 
                                            onClick={() => setIsWritingReview(!isWritingReview)} 
                                            className={`px-5 py-2.5 font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 text-sm ${isWritingReview ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary text-white hover:bg-[#2f5146]'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {isWritingReview ? 'close' : 'edit_square'}
                                            </span>
                                            {isWritingReview ? "Hủy" : "Viết đánh giá"}
                                        </button>
                                    </div>

                                    {isWritingReview && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                                            className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-10 border border-gray-200"
                                        >
                                            <h4 className="font-bold text-gray-800 mb-4 text-lg">Đánh giá sản phẩm này</h4>
                                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                                {/* Chọn Sao */}
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
                                                                <svg 
                                                                    viewBox="0 0 24 24" 
                                                                    fill="currentColor" 
                                                                    className={`w-8 h-8 ${star <= (hoverRating || newRating) ? "text-yellow-400" : "text-gray-300"}`}
                                                                >
                                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                                </svg>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-500">
                                                        {newRating === 5 ? "Tuyệt vời" : newRating === 4 ? "Rất tốt" : newRating === 3 ? "Bình thường" : newRating === 2 ? "Kém" : "Rất tệ"}
                                                    </span>
                                                </div>

                                                {/* Nội dung */}
                                                <div>
                                                    <textarea required rows={4} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none bg-white text-sm font-medium text-gray-800"></textarea>
                                                </div>

                                                {/* Tải ảnh */}
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

                                    <div className="space-y-8">
                                        {reviewsList.map((review: any) => (
                                            <div key={review.id} className="flex gap-4 sm:gap-6 border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                                                <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div>
                                                            <h4 className="font-bold text-gray-800">{review.user}</h4>
                                                            {renderStars(review.rating, "text-[16px]")}
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                                                    </div>
                                                    <p className="text-gray-600 mt-2 font-medium leading-relaxed">{review.content}</p>
                                                    {review.images && review.images.length > 0 && (
                                                        <div className="flex gap-3 mt-4">
                                                            {review.images.map((img: string, idx: number) => (
                                                                <img key={idx} src={img} alt="Review" className="w-20 h-20 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Phản hồi của shop */}
                                                    {review.reply && (
                                                        <div className="mt-5 bg-emerald-50/50 rounded-2xl p-4 md:p-5 border border-emerald-100">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">MG</div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-emerald-800">Phản hồi từ {review.reply.shopName}</p>
                                                                    <p className="text-xs text-gray-500 font-medium">{review.reply.date}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-700 font-medium leading-relaxed pl-11">{review.reply.content}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* --- RELATED PRODUCTS SECTION --- */}
                    <div className="mt-20">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6 }}
                            className="flex justify-between items-end mb-8"
                        >
                            <div>
                                <h2 className="text-3xl font-black text-gray-800">Sản phẩm gợi ý</h2>
                                <p className="text-gray-500 font-medium mt-2">Những sự lựa chọn tuyệt vời khác cho bạn</p>
                            </div>
                            <Link to="/products" className="hidden sm:flex items-center gap-1 text-primary font-bold hover:text-primary-container transition-colors">
                                Xem tất cả <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </Link>
                        </motion.div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {relatedProducts.map((product: any, index: number) => {
                                const isLiked = isFavorited(product);
                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 0.6, delay: index * 0.15 }}
                                    >
                                        <ProductCard
                                            product={product}
                                            isFavorited={isLiked}
                                            onToggleFavorite={toggleFavorite}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- RECENTLY VIEWED SECTION --- */}
                    <div className="mt-24">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6 }}
                            className="mb-8 border-t border-gray-200 pt-10"
                        >
                            <h2 className="text-2xl font-black text-gray-800">Sản phẩm vừa xem</h2>
                        </motion.div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {viewedProducts.map((product: any, index: number) => {
                                const isLiked = isFavorited(product);
                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 0.6, delay: index * 0.15 }}
                                    >
                                        <ProductCard
                                            product={product}
                                            isFavorited={isLiked}
                                            onToggleFavorite={toggleFavorite}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}