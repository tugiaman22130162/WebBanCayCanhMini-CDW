import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "../../components/user/Header";
import { motion } from "framer-motion";

type CartItem = {
    id: number;
    productId: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
};

export default function Cart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Hàm gọi API lấy giỏ hàng
    const fetchCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setIsLoading(false);
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

            const response = await axios.get(`http://localhost:8080/api/cart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setCartItems(response.data.items || []);
            setTotalPrice(response.data.totalPrice || 0);
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        window.scrollTo(0, 0);
    }, []);

    // Hàm xử lý chọn "Tất cả"
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(cartItems.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    // Hàm xử lý chọn từng sản phẩm
    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
    };

    // Hàm tính tổng tiền các sản phẩm được chọn
    const calculateTotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(item.id))
            .reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Hàm cập nhật số lượng (+ / -)
    const updateQuantity = async (cartItemId: number, delta: number, currentQuantity: number) => {
        // Nếu số lượng là 1 và người dùng bấm trừ, hiển thị cảnh báo xóa
        if (currentQuantity === 1 && delta === -1) {
            removeItem(cartItemId);
            return;
        }

        const token = localStorage.getItem("token");
        try {
            await axios.put(`http://localhost:8080/api/cart/update/${cartItemId}?delta=${delta}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart(); // Cập nhật lại list sau khi thành công
            // Báo cho Header biết giỏ hàng thay đổi
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Lỗi cập nhật số lượng:", error);
            Swal.fire("Lỗi", "Không thể cập nhật số lượng", "error");
        }
    };

    // Hàm xóa sản phẩm
    const removeItem = async (cartItemId: number) => {
        const result = await Swal.fire({
            title: 'Xóa sản phẩm?',
            text: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
            icon: 'warning',
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: 'Xóa khỏi giỏ',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-red-600 transition-colors shadow-sm',
                cancelButton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-[#2f5146] transition-colors shadow-sm'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            const token = localStorage.getItem("token");
            try {
                await axios.delete(`http://localhost:8080/api/cart/remove/${cartItemId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchCart(); // Cập nhật lại list sau khi thành công
                setSelectedItems(selectedItems.filter(id => id !== cartItemId)); // Bỏ chọn nếu đang chọn
                // Báo cho Header biết giỏ hàng thay đổi
                window.dispatchEvent(new Event("cartUpdated"));
                
                Swal.fire({
                    toast: true,
                    position: 'bottom-end',
                    icon: 'success',
                    title: 'Đã xóa sản phẩm khỏi giỏ hàng',
                    showConfirmButton: false,
                    timer: 2000
                });
            } catch (error) {
                console.error("Lỗi khi xóa sản phẩm:", error);
                Swal.fire("Lỗi", "Không thể xóa sản phẩm", "error");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#F8F9F5]">
                <Header />
                <div className="flex-1 pt-[150px] pb-24 flex justify-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                        <p className="font-medium">Đang tải giỏ hàng...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-[#F8F9F5]">
                <Header />
                <div className="flex-1 pt-[150px] pb-24 flex justify-center">
                    <div className="text-center flex flex-col items-center gap-4">
                        <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-2">
                            <span className="material-symbols-outlined text-5xl">shopping_cart</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800">Giỏ hàng của bạn đang trống</h2>
                        <p className="text-gray-500 font-medium">Hãy tìm thêm những chậu cây xinh xắn cho góc nhỏ của mình nhé!</p>
                        <Link to="/products" className="mt-4 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#2f5146] transition-colors shadow-lg shadow-primary/20">
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9F5] relative">
            <Header />
            <div className="flex-1 pt-[100px] pb-[150px] font-body relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/products" className="inline-flex items-center gap-2 text-primary font-bold group mb-6">
                        <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
                        <span className="group-hover:underline">Tiếp tục mua sắm</span>
                    </Link>

                    <h1 className="text-3xl font-black text-gray-800 mb-8">Giỏ hàng của bạn</h1>

                    {/* Danh sách sản phẩm trong giỏ */}
                    <div className="space-y-4">
                        {/* Nút chọn tất cả phía trên danh sách */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <input 
                                type="checkbox" 
                                checked={cartItems.length > 0 && selectedItems.length === cartItems.length} 
                                onChange={handleSelectAll} 
                                className="w-5 h-5 accent-primary cursor-pointer ml-2" 
                            />
                            <span className="font-bold text-gray-700">Chọn tất cả ({cartItems.length} sản phẩm)</span>
                        </div>

                        {cartItems.map((item, index) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 sm:gap-6"
                            >
                                <input 
                                    type="checkbox" 
                                    checked={selectedItems.includes(item.id)}
                                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                                    className="w-5 h-5 accent-primary cursor-pointer ml-2 shrink-0" 
                                />
                                <img src={item.image || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=200&h=200&fit=crop"} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-100" />
                                
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <Link to={`/products/${item.productId}`} className="text-lg font-bold text-gray-800 hover:text-primary transition-colors line-clamp-1">{item.name}</Link>
                                        <p className="text-primary font-black mt-1">{item.price.toLocaleString('vi-VN')}đ</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-10">
                                            <button onClick={() => updateQuantity(item.id, -1, item.quantity)} className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined font-bold text-[18px]">remove</span>
                                            </button>
                                            <span className="w-10 h-full flex items-center justify-center font-bold text-gray-800 bg-white text-sm">
                                                {item.quantity}
                                            </span>
                                            <button onClick={() => updateQuantity(item.id, 1, item.quantity)} className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined font-bold text-[18px]">add</span>
                                            </button>
                                        </div>
                                    <button onClick={() => removeItem(item.id)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full shrink-0" title="Xóa sản phẩm">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sticky Footer: Thanh thanh toán dính chặt dưới đáy */}
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-40">
                    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={cartItems.length > 0 && selectedItems.length === cartItems.length} 
                                    onChange={handleSelectAll} 
                                    className="w-5 h-5 accent-primary cursor-pointer" 
                                />
                                <span className="font-semibold text-gray-700 whitespace-nowrap">Chọn tất cả ({cartItems.length})</span>
                            </label>
                            {selectedItems.length > 0 && (
                                <button 
                                    onClick={() => {
                                        Swal.fire({
                                            title: 'Xóa mục đã chọn?',
                                            text: "Bạn có chắc muốn xóa các sản phẩm này khỏi giỏ hàng?",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            showCloseButton: true,
                                            confirmButtonText: 'Xóa',
                                            cancelButtonText: 'Hủy',
                                            customClass: {
                                                confirmButton: 'bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-red-600 transition-colors shadow-sm',
                                                cancelButton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-[#2f5146] transition-colors shadow-sm'
                                            },
                                            buttonsStyling: false
                                        }).then(async (result) => {
                                            if (result.isConfirmed) {
                                                const token = localStorage.getItem("token");
                                                for (const id of selectedItems) {
                                                    await axios.delete(`http://localhost:8080/api/cart/remove/${id}`, {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    });
                                                }
                                                fetchCart();
                                                setSelectedItems([]);
                                                window.dispatchEvent(new Event("cartUpdated"));
                                            }
                                        });
                                    }}
                                    className="text-sm font-semibold text-red-500 hover:underline whitespace-nowrap ml-2"
                                >
                                    Xóa mục đã chọn
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                            <div className="text-right flex-1 sm:flex-none">
                                <div className="text-gray-600 font-medium text-sm sm:text-base">Tổng thanh toán ({selectedItems.length} SP):</div>
                                <div className="text-2xl font-black text-primary">{calculateTotal().toLocaleString('vi-VN')}đ</div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (selectedItems.length === 0) {
                                        Swal.fire("Chưa chọn sản phẩm", "Vui lòng chọn ít nhất 1 sản phẩm để thanh toán nhé!", "warning");
                                        return;
                                    }
                                    // Có thể truyền selectedItems sang trang checkout ở đây
                                    navigate('/checkout');
                                }} 
                                className={`px-6 sm:px-8 py-3 rounded-xl font-bold transition-all shadow-md whitespace-nowrap ${selectedItems.length > 0 ? 'bg-primary text-white hover:bg-[#2f5146] hover:scale-[1.02] active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                disabled={selectedItems.length === 0}
                            >
                                Mua Hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}