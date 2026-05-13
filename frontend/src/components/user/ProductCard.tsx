import React, { useRef } from "react";
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

    // Demo tính toán phần trăm giảm giá (Cố định 20%)
    const mockDiscountPercent = 10;

    // Giá gốc (lấy trực tiếp từ database)
    const originalPriceString =
        typeof product.price === "number"
            ? product.price.toLocaleString("vi-VN") + "đ"
            : null;

    // Giá sau khi giảm (giá bán thực tế)
    const priceString =
        typeof product.price === "number"
            ? (product.price * (1 - mockDiscountPercent / 100)).toLocaleString("vi-VN") + "đ"
            : product.price;

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
                <Link to={`/products/${product.id}`}>
                    <h4 className="text-lg font-bold break-words hover:text-primary transition-colors">{product.name}</h4>
                </Link>
                
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-emerald-600 font-bold">{priceString}</p>
                    {originalPriceString && (
                        <p className="text-sm text-gray-400 line-through">{originalPriceString}</p>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full">
                        -{mockDiscountPercent}%
                    </span>
                </div>

                <button onClick={handleAddToCart} className="w-full mt-auto pt-3 pb-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container hover:scale-[1.02] active:scale-95 transition-all">
                    Thêm vào giỏ
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;