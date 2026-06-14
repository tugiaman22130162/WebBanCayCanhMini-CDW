import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

interface ProductCartActionsProp {
    product: any;
    mainImage: string;
    imageRef: React.RefObject<HTMLImageElement>;
}

export default function ProductCartAction({ product, mainImage, imageRef }: ProductCartActionsProp) {
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    const handleAddToCart = async () => {
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

            const response = await axios.post(
                "http://localhost:8080/api/cart/add",
                {
                    userId: userId,
                    productId: product.id,
                    quantity: quantity
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                if (imageRef.current) {
                    const cartIcon = document.getElementById("cart-icon");
                    if (cartIcon) {
                        const imgRect = imageRef.current.getBoundingClientRect();
                        const cartRect = cartIcon.getBoundingClientRect();

                        const flyingImg = document.createElement("img");
                        flyingImg.src = mainImage;
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

                        flyingImg.offsetWidth;

                        flyingImg.style.top = `${cartRect.top}px`;
                        flyingImg.style.left = `${cartRect.left}px`;
                        flyingImg.style.width = "20px";
                        flyingImg.style.height = "20px";
                        flyingImg.style.opacity = "0.2";

                        flyingImg.addEventListener("transitionend", () => {
                            flyingImg.remove();
                            cartIcon.classList.add("scale-125");
                            setTimeout(() => cartIcon.classList.remove("scale-125"), 300);
                        });
                    }
                }

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Đã thêm ${quantity} ${product.name} vào giỏ hàng!`,
                    showConfirmButton: false,
                    timer: 2000
                });
                window.dispatchEvent(new Event("cartUpdated"));
            }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Có lỗi xảy ra, không thể thêm vào giỏ hàng!',
                showConfirmButton: false,
                timer: 2000
            });
        }
    };

    const handleBuyNow = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập để mua hàng!',
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
        const buyNowItem = {
            id: 'buy-now',
            productId: product.id,
            name: product.name,
            price: product.price,
            image: mainImage,
            quantity: quantity,
            categoryId: product.categoryId
        };
        navigate("/checkout", { state: { buyNowItem } });
    };

    return (
        <div className="mt-auto space-y-6">
            <div className="flex items-center gap-4">
                <span className="font-bold text-gray-700">Số lượng:</span>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-12">
                    <button disabled={product.stock === 0} onClick={() => setQuantity(Math.max(1, quantity - 1))} className={`w-12 h-full flex items-center justify-center transition-colors ${product.stock === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-primary'}`}>
                        <span className="material-symbols-outlined font-bold">remove</span>
                    </button>
                    <span className="w-12 h-full flex items-center justify-center font-bold text-gray-800 bg-white">
                        {product.stock === 0 ? 0 : quantity}
                    </span>
                    <button disabled={product.stock === 0} onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className={`w-12 h-full flex items-center justify-center transition-colors ${product.stock === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-primary'}`}>
                        <span className="material-symbols-outlined font-bold">add</span>
                    </button>
                </div>
                {product.stock === 0 ? (
                    <span className="text-sm text-red-500 font-bold ml-2">Hết hàng</span>
                ) : (
                    <span className="text-sm text-gray-500 font-medium ml-2">Còn {product.stock} sản phẩm</span>
                )}
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={handleAddToCart} 
                    disabled={product.stock === 0}
                    className={`flex-1 py-4 border-2 font-bold rounded-xl flex justify-center items-center gap-2 transition-colors ${product.stock === 0 ? 'border-primary/50 text-primary/50 cursor-not-allowed' : 'border-primary text-primary hover:bg-primary/5'}`}
                >
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                    {product.stock === 0 ? 'Hết hàng' : 'Thêm Vào Giỏ'}
                </button>
                <button 
                    onClick={handleBuyNow} 
                    disabled={product.stock === 0}
                    className={`flex-1 py-4 font-bold rounded-xl flex justify-center items-center gap-2 transition-all ${product.stock === 0 ? 'bg-primary/50 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-[#2f5146] shadow-lg shadow-primary/30 active:scale-[0.98]'}`}
                >
                    Mua Ngay
                </button>
            </div>

            {/* Cam kết của shop */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                    Giao hàng toàn quốc
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
                    Đóng gói an toàn 4 lớp
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <span className="material-symbols-outlined text-primary text-[20px]">published_with_changes</span>
                    Bảo hành 1 đổi 1 (7 ngày)
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
                    Hỗ trợ hướng dẫn chăm sóc
                </div>
            </div>
        </div>
    );
}