import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import type { Product } from "../../data/products";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

type Props = {
    product: Product;
    isFavorited?: boolean;
    showFavoriteButton?: boolean;
    onToggleFavorite?: (product: Product) => void;
};

// Cache dùng chung cho tất cả ProductCard để chỉ gọi API 1 lần duy nhất
let cachedPromotions: any[] | null = null;
let fetchPromotionsPromise: Promise<any[]> | null = null;

const ProductCard: React.FC<Props> = ({
    product,
    isFavorited,
    showFavoriteButton = true,
    onToggleFavorite,
}) => {
    //thêm sản phẩm vào giỏ hàng
    const navigate = useNavigate();
    const location = useLocation();
    const imageRef = useRef<HTMLImageElement>(null);

    const [promotions, setPromotions] = useState<any[]>(cachedPromotions || []);

    // Lấy danh sách khuyến mãi chung
    useEffect(() => {
        if (!cachedPromotions) {
            if (!fetchPromotionsPromise) {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                fetchPromotionsPromise = axios.get("http://localhost:8080/api/promotions", { headers })
                    .then(res => {
                        // Lọc mã đang hoạt động VÀ (không giới hạn HOẶC số lượng còn lại > 0)
                        const activePromos = res.data.filter((p: any) => p.isActive && (!p.quantity || p.quantity - (p.usedCount || 0) > 0));
                        cachedPromotions = activePromos;
                        return activePromos;
                    })
                    .catch(() => {
                        fetchPromotionsPromise = null; // Cho phép gọi lại nếu lỗi
                        return [];
                    });
            }
            if (fetchPromotionsPromise) {
                fetchPromotionsPromise.then(activePromos => setPromotions(activePromos));
            }
        }
    }, []);

    const handleToggleFavorite = () => {
        if (onToggleFavorite) {
            onToggleFavorite(product);
        }
    };
     // Xử lý thêm vào giỏ hàng khi click vào nút "Thêm vào giỏ"
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Ngăn chặn sự kiện click lan truyền ra ngoài
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!',
                icon: 'warning',
                showCancelButton: true,
                showCloseButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy',
                customClass: {
                    confirmButton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-[#2f5146] transition-colors shadow-sm',
                    cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-gray-300 transition-colors shadow-sm'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
                }
            });
            return;
        }

        try {
            let userId;
            const userStr = localStorage.getItem("user");
            if (userStr) {
                userId = JSON.parse(userStr).id;
            } 
            if (!userId) {
                const userRes = await axios.get("http://localhost:8080/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                userId = userRes.data.id;
                localStorage.setItem("user", JSON.stringify(userRes.data));
            }

            const response = await axios.post("http://localhost:8080/api/cart/add", {
                userId: userId,
                productId: product.id,
                quantity: 1 // Click ở ngoài thẻ chỉ thêm 1 sản phẩm
            }, { headers: { Authorization: `Bearer ${token}` } });
            //hiệu ứng bay vào giỏ hàng
            if (response.status >= 200 && response.status < 300) {
                if (imageRef.current) {
                    const cartIcon = document.getElementById("cart-icon");
                    if (cartIcon) {
                        const imgRect = imageRef.current.getBoundingClientRect();
                        const cartRect = cartIcon.getBoundingClientRect();
                        const flyingImg = document.createElement("img");
                        flyingImg.src = imageRef.current.src; // Lấy trực tiếp src từ ảnh đã render để tránh lỗi đường dẫn
                        flyingImg.style.position = "fixed";
                        flyingImg.style.top = `${imgRect.top}px`;
                        flyingImg.style.left = `${imgRect.left}px`;
                        flyingImg.style.width = `${imgRect.width}px`;
                        flyingImg.style.height = `${imgRect.height}px`;
                        flyingImg.style.objectFit = "cover";
                        flyingImg.style.borderRadius = "16px";
                        flyingImg.style.zIndex = "9999";
                        flyingImg.style.transition = "all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)";
                        flyingImg.style.pointerEvents = "none";
                        document.body.appendChild(flyingImg);
                        
                        // Dùng setTimeout để đảm bảo frame CSS ban đầu kịp cập nhật
                        setTimeout(() => {
                            flyingImg.style.top = `${cartRect.top}px`;
                            flyingImg.style.left = `${cartRect.left}px`;
                            flyingImg.style.width = "20px";
                            flyingImg.style.height = "20px";
                            flyingImg.style.opacity = "0.2";
                        }, 10);

                        flyingImg.addEventListener("transitionend", () => {
                            flyingImg.remove();
                            cartIcon.classList.add("scale-125");
                            setTimeout(() => cartIcon.classList.remove("scale-125"), 300);
                        });
                    }
                }
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Đã thêm ${product.name} vào giỏ!`, showConfirmButton: false, timer: 2000 });
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (error) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Không thể thêm vào giỏ hàng!', showConfirmButton: false, timer: 2000 });
        }
    };

    const isOutOfStock = (product as any).stock === 0 || (product as any).stock === '0';

    // Lọc ra các mã KHUYẾN MÃI áp dụng cho Sản phẩm này hoặc Danh mục của nó
    const applicablePromos = useMemo(() => {
        return promotions.filter(promo => {
            if (!product) return false;
            if (promo.endDate && new Date(promo.endDate) < new Date()) return false;
           
            if (promo.type === 'SHOP') return false; // Chỉ áp dụng cho Danh mục và Sản phẩm cụ thể
            if (promo.type === 'SHIPPING') return false; // Không lấy mã vận chuyển
            if (promo.type === 'PRODUCT' && promo.targetId != null && String(promo.targetId) === String(product.id)) return true;
            if (promo.type === 'CATEGORY' && ((promo.targetId != null && String(promo.targetId) === String((product as any).categoryId)) || (promo.targetName != null && promo.targetName === product.category))) return true;
            return false;
        });
    }, [promotions, product]);

    const productPrice = Number(product?.price) || 0;

    // Tính toán giá hiển thị (afterPricePromotion) và % giảm lớn nhất
    const { afterPricePromotion, maxDiscountPercent } = useMemo(() => {
        if (!product || applicablePromos.length === 0) return { afterPricePromotion: productPrice, maxDiscountPercent: 0 };
        
        let maxDiscountAmount = 0;
        let bestPercent = 0;
        
        applicablePromos.forEach(promo => {
            if (promo.type === 'SHIPPING') return; // Không dùng mã vận chuyển để tính giảm giá trực tiếp vào thẻ sản phẩm

            let discountAmount = 0;
            let currentPercent = 0;
            
            if (promo.discountType === 'PERCENTAGE') {
                discountAmount = productPrice * (promo.discountValue / 100);
                currentPercent = promo.discountValue;
                if (promo.maxDiscountValue > 0 && discountAmount > promo.maxDiscountValue) {
                    discountAmount = promo.maxDiscountValue;
                    currentPercent = Math.round((discountAmount / productPrice) * 100);
                }
            } else if (promo.discountType === 'FIXED_AMOUNT') {
                discountAmount = promo.discountValue;
                currentPercent = Math.round((discountAmount / productPrice) * 100);
            }
            
            if (discountAmount > maxDiscountAmount) {
                maxDiscountAmount = discountAmount;
                bestPercent = currentPercent;
            }
        });
        
        if (maxDiscountAmount > productPrice) maxDiscountAmount = productPrice;
        
        return {
            afterPricePromotion: productPrice - maxDiscountAmount,
            maxDiscountPercent: bestPercent
        };
    }, [product, applicablePromos]);

    // Giá gốc (chỉ hiển thị nếu có giảm giá)
    const originalPriceString =
        afterPricePromotion < productPrice
            ? productPrice.toLocaleString("vi-VN") + "đ"
            : null;

    const priceString = afterPricePromotion.toLocaleString("vi-VN") + "đ";

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group h-full flex flex-col border-[2px] border-gray-200 rounded-xl p-6 bg-white"
        >
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-6 relative">
                {/* lay id tu database de tao link den trang chi tiet san pham */}
                <Link to={`/products/${product.id}`} className="block w-full h-full">
                    <motion.img
                        ref={imageRef}
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                    />
                </Link>

                <span className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1 rounded-full pointer-events-none">
                    {product.category}
                </span>

                {showFavoriteButton && (
                    <motion.button
                        onClick={handleToggleFavorite}
                        whileTap={{ scale: 0.8 }}
                        animate={isFavorited ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center"
                    >
                        <span className={`material-symbols-outlined ${isFavorited ? "text-red-500" : "text-black"}`} style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>
                            favorite
                        </span>
                    </motion.button>
                )}
            </div>

            <div className="flex flex-col flex-grow gap-3">
                <div className="flex items-start justify-between gap-2">
                    <Link to={`/products/${product.id}`} className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold break-words hover:text-primary transition-colors line-clamp-2">{product.name}</h4>
                    </Link>
                    {isOutOfStock && (
                        <span className="shrink-0 bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 mt-1 whitespace-nowrap shadow-sm">
                            Hết hàng
                        </span>
                    )}
                </div>
                
                <div className="flex items-end gap-2 flex-wrap mb-1">
                    <p className="text-xl font-black text-primary leading-none">{priceString}</p>
                    {originalPriceString && (
                        <p className="text-sm text-gray-400 line-through mb-0.5">{originalPriceString}</p>
                    )}
                    {maxDiscountPercent > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full">
                            -{maxDiscountPercent}%
                        </span>
                    )}
                </div>

                <button 
                    onClick={handleAddToCart} 
                    disabled={isOutOfStock}
                    className={`w-full mt-auto pt-3 pb-3 rounded-xl font-semibold transition-all ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-container hover:scale-[1.02] active:scale-95'}`}
                >
                    {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;