import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ProductCard from "../../components/user/ProductCard";
import ProductReview from "../../components/user/ProductReview";
import ProductCartAction from "../../components/user/ProductCartAction";
import { useFavorites } from "../../data/useFavorites";
import axios from "axios";
import { motion } from "framer-motion";

export default function ProductDetail() {
    const { id } = useParams();
    const { isFavorited, toggleFavorite } = useFavorites();

    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [viewedProducts, setViewedProducts] = useState<any[]>([]);
    const [promotions, setPromotions] = useState<any[]>([]);

    const [mainImage, setMainImage] = useState("");
    const [activeTab, setActiveTab] = useState<'description' | 'care' | 'reviews'>('description');
    const [totalReviews, setTotalReviews] = useState(0);

    // Ref cho ảnh chính để làm hiệu ứng bay vào giỏ hàng
    const imageRef = useRef<HTMLImageElement>(null);

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
                    rating: 4.8, // Tạm thời Fake rating nếu DB chưa có
                    reviewCount: 2, // Tạm thời mock data
                    soldCount: 350,
                    category: data.categoryName || data.category?.name || data.category || "Chưa phân loại",
                    categoryId: data.categoryId || data.category?.id || null,
                    images: data.images?.length > 0 ? data.images : ["https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=1080&h=1080&q=80&fit=crop"],
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
                setTotalReviews(formattedProduct.reviewCount);

                // Xử lý Cập nhật và Lấy Sản phẩm vừa xem từ LocalStorage
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

                //Gọi API Lấy sản phẩm liên quan (Gợi ý) từ DB
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
                        image: (item.images && item.images.length > 0) ? item.images[0] : "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=800&h=800&q=80&fit=crop",
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
        if (id) {
            fetchProductDetail();
        }
    }, [id]);

    // Gọi API lấy danh sách mã khuyến mãi
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                // Cố gắng gọi API lấy promotion (sử dụng token nếu có)
                const res = await axios.get("http://localhost:8080/api/promotions", { headers });
                
                // Chỉ lưu các mã đang ở trạng thái Hoạt động
                setPromotions(res.data.filter((p: any) => p.isActive));
            } catch (err) {
                console.error("Lỗi lấy danh sách khuyến mãi:", err);
            }
        };
        fetchPromotions();
    }, []);

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

    // Lọc ra các mã KHUYẾN MÃI chỉ áp dụng cho Sản phẩm này (PRODUCT) hoặc Danh mục của nó (CATEGORY)
    const applicablePromos = promotions.filter(promo => {
        if (!product) return false;
        // Bỏ qua nếu mã đã hết hạn
        if (promo.endDate && new Date(promo.endDate) < new Date()) return false;
        
        if (promo.type === 'SHOP') return false; // Không lấy mã Toàn Shop
        if (promo.type === 'SHIPPING') return false; // Không lấy mã Vận chuyển
        if (promo.type === 'PRODUCT' && promo.targetId != null && String(promo.targetId) === String(product.id)) return true;
        if (promo.type === 'CATEGORY' && ((promo.targetId != null && String(promo.targetId) === String(product.categoryId)) || (promo.targetName != null && promo.targetName === product.category))) return true;
        
        return false;
    });

    // Tính toán giá hiển thị (afterPricePromotion) dựa trên mã giảm lớn nhất
    const afterPricePromotion = useMemo(() => {
        if (!product || applicablePromos.length === 0) return product?.price || 0;
        
        let maxDiscountAmount = 0;
        applicablePromos.forEach(promo => {
            if (promo.type === 'SHIPPING') return; // Không dùng mã vận chuyển để tính giảm giá trực tiếp vào sản phẩm

            let discountAmount = 0;
            if (promo.discountType === 'PERCENTAGE') {
                discountAmount = product.price * (promo.discountValue / 100);
                // Ràng buộc mức giảm tối đa nếu có cấu hình maxDiscountValue
                if (promo.maxDiscountValue > 0 && discountAmount > promo.maxDiscountValue) {
                    discountAmount = promo.maxDiscountValue;
                }
            } else if (promo.discountType === 'FIXED_AMOUNT') {
                discountAmount = promo.discountValue;
            }
            if (discountAmount > maxDiscountAmount) {
                maxDiscountAmount = discountAmount;
            }
        });
        
        if (maxDiscountAmount > product.price) maxDiscountAmount = product.price;
        return product.price - maxDiscountAmount;
    }, [product, applicablePromos]);

    if (isLoading) {
        return (
            <MainLayout>
                <div className="bg-[#F8F9F5] min-h-screen pt-[120px] pb-24 flex justify-center">
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
                <div className="bg-[#F8F9F5] min-h-screen pt-[120px] pb-24 flex justify-center">
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
                <div className="bg-[#F8F9F5] min-h-screen pt-[50px] pb-24 font-body">
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

                    {/* PRODUCT TOP SECTION*/}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="bg-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
                    >
                        
                        {/* Hình ảnh */}
                        <div className="flex flex-col gap-4 lg:col-span-5 xl:col-span-5">
                            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                                <img ref={imageRef} src={mainImage} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
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
                                {afterPricePromotion < product.price ? (
                                    <>
                                        <span className="text-3xl md:text-4xl font-black text-primary">{afterPricePromotion.toLocaleString('vi-VN')}đ</span>
                                        <span className="text-lg text-gray-400 line-through mb-1">{product.price.toLocaleString('vi-VN')}đ</span>
                                    </>
                                ) : (
                                    <span className="text-3xl md:text-4xl font-black text-primary">{product.price.toLocaleString('vi-VN')}đ</span>
                                )}
                            </div>

                            {/* HIỂN THỊ MÃ KHUYẾN MÃI (NẾU CÓ) */}
                            {applicablePromos.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px] text-red-500">local_activity</span>
                                        Mã ưu đãi áp dụng
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {applicablePromos.map(promo => (
                                            <div key={promo.id} className={`flex items-center gap-2 px-3 py-2 ${promo.type === 'SHIPPING' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} rounded-xl relative overflow-hidden group shadow-sm`}>
                                                {/* Hiệu ứng khoét lỗ 2 bên làm hình vé (ticket) */}
                                                <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-r ${promo.type === 'SHIPPING' ? 'border-blue-200' : 'border-red-200'}`}></div>
                                                <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-l ${promo.type === 'SHIPPING' ? 'border-blue-200' : 'border-red-200'}`}></div>
                                                
                                                <span className={`text-sm font-black ${promo.type === 'SHIPPING' ? 'text-blue-600' : 'text-red-600'} pl-2`}>
                                                    {promo.type === 'SHIPPING' ? (
                                                        promo.discountType === 'FREE' ? 'Freeship' : `Giảm ship ${promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString('vi-VN')}đ`}`
                                                    ) : (
                                                        `Giảm ${promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : promo.discountType === 'FIXED_AMOUNT' ? `${promo.discountValue.toLocaleString('vi-VN')}đ` : 'Miễn phí'}`
                                                    )}
                                                </span>
                                                <span className={`text-xs font-bold ${promo.type === 'SHIPPING' ? 'text-blue-500 border-blue-100' : 'text-red-500 border-red-100'} bg-white px-2 py-1 rounded-md border pr-2 tracking-wide`}>
                                                    Mã: {promo.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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

                            <ProductCartAction 
                                product={product} 
                                mainImage={mainImage} 
                                imageRef={imageRef} 
                            />
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
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                                        <div className="md:col-span-5 lg:col-span-4">
                                            <h4 className="text-xl font-bold text-gray-800 mb-4">Thông số chi tiết</h4>
                                            <div className="flex flex-col gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-sm">
                                                <div className="flex gap-3 border-b border-gray-300 pb-3">
                                                    <span className="text-gray-500 font-bold w-24 shrink-0 text-left">Kích thước:</span>
                                                    <span className="font-bold text-gray-800 text-left">{product.specifications.size}</span>
                                                </div>
                                                <div className="flex gap-3 border-b border-gray-300 pb-3">
                                                    <span className="text-gray-500 font-bold w-24 shrink-0 text-left">Xuất xứ:</span>
                                                    <span className="font-bold text-gray-800 text-left">{product.specifications.origin}</span>
                                                </div>
                                                <div className="flex gap-3 border-b border-gray-300 pb-3">
                                                    <span className="text-gray-500 font-bold w-24 shrink-0 text-left">Loại chậu:</span>
                                                    <span className="font-bold text-gray-800 text-left">{product.specifications.potType}</span>
                                                </div>
                                                <div className="flex gap-3 pb-1">
                                                    <span className="text-gray-500 font-bold w-24 shrink-0 text-left">Trọng lượng:</span>
                                                    <span className="font-bold text-gray-800 text-left">{product.specifications.weight}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-7 lg:col-span-8">
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
                                        </div>
                                    </div>
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
                                <ProductReview 
                                    productRating={product.rating} 
                                    initialTotalReviews={product.reviewCount} 
                                    onReviewAdded={() => setTotalReviews(prev => prev + 1)}
                                />
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