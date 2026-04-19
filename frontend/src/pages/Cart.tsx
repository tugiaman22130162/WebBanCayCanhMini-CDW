import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

// Mock data tạm thời để hiển thị giỏ hàng
const initialCartItems = [
    {
        id: 1,
        name: "Terrarium Forest Mini",
        price: 120000,
        image: "/images/terrarium.png",
        quantity: 1,
    },
    {
        id: 2,
        name: "Sen đá mix color",
        price: 25000,
        image: "/images/sen_da.webp",
        quantity: 2,
    },
];

export default function Cart() {
    const [cartItems, setCartItems] = useState(initialCartItems);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    // Xử lý chọn tất cả
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(cartItems.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    // Xử lý chọn từng sản phẩm
    const handleSelectItem = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    // Xử lý tăng giảm số lượng
    const handleUpdateQuantity = (id: number, delta: number) => {
        setCartItems(prev =>
            prev.map(item => {
                if (item.id === id) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    // Xử lý xóa sản phẩm
    const handleRemoveItem = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
        setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    };

    // Kiểm tra xem đã chọn tất cả chưa
    const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

    // Tính tổng tiền các sản phẩm ĐƯỢC CHỌN
    const totalSelectedPrice = cartItems
        .filter(item => selectedItems.includes(item.id))
        .reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#F8F9F5] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Nút Back quay lại mua sắm */}
                    <div className="mb-8">
                        <Link to="/products" className="inline-flex items-center gap-2 text-[#406D5E] font-bold group hover:text-[#2f5146] transition-colors">
                            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">
                                arrow_back
                            </span>
                            <span>Tiếp tục mua sắm</span>
                        </Link>
                    </div>

                    <h1 className="text-3xl font-black text-[#406D5E] mb-8">Giỏ hàng của bạn</h1>

                    <div className="flex flex-col gap-6">
                        {/* Phần 1: Danh sách sản phẩm trong giỏ hàng */}
                        <div className="space-y-4">
                            
                            {/* Header chọn tất cả */}
                            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="w-5 h-5 text-[#406D5E] bg-gray-100 border-gray-300 rounded focus:ring-[#406D5E] focus:ring-2 cursor-pointer accent-[#406D5E]"
                                    />
                                    <span className="font-semibold text-gray-800">
                                        Chọn tất cả ({cartItems.length} sản phẩm)
                                    </span>
                                </label>
                            </div>

                            {/* Danh sách các sản phẩm */}
                            {cartItems.length === 0 ? (
                                <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
                                    Giỏ hàng của bạn đang trống.
                                </div>
                            ) : (
                                cartItems.map(item => (
                                    <div key={item.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:shadow-md">
                                        
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => handleSelectItem(item.id)}
                                            className="w-5 h-5 text-[#406D5E] bg-gray-100 border-gray-300 rounded focus:ring-[#406D5E] focus:ring-2 cursor-pointer accent-[#406D5E] mt-1 sm:mt-0"
                                        />
                                        
                                        {/* Hình ảnh */}
                                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg border border-gray-100" />
                                        
                                        {/* Thông tin sản phẩm */}
                                        <div className="flex-1 space-y-1">
                                            <Link to={`/product/${item.id}`} className="font-bold text-lg text-gray-800 hover:text-[#406D5E] transition-colors line-clamp-2">
                                                {item.name}
                                            </Link>
                                            <p className="text-emerald-600 font-bold text-lg">
                                                {item.price.toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>

                                        {/* Hành động (Số lượng + Xóa) */}
                                        <div className="flex items-center justify-between w-full sm:w-auto gap-6 mt-4 sm:mt-0">
                                            {/* Nút tăng giảm số lượng */}
                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                <button onClick={() => handleUpdateQuantity(item.id, -1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-200 text-gray-600 transition-colors">
                                                    <span className="material-symbols-outlined text-sm font-bold">remove</span>
                                                </button>
                                                <span className="px-4 py-1 font-semibold text-gray-800 bg-white min-w-[40px] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button onClick={() => handleUpdateQuantity(item.id, 1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-200 text-gray-600 transition-colors">
                                                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                                                </button>
                                            </div>
                                            
                                            {/* Nút Xóa */}
                                            <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2" title="Xóa sản phẩm">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Phần 2: Tổng cộng và Nút thanh toán */}
                        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center gap-4 mt-2">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600 font-medium">Tổng thanh toán ({selectedItems.length} sản phẩm):</span>
                                <span className="text-2xl font-bold text-emerald-600">{totalSelectedPrice.toLocaleString('vi-VN')}đ</span>
                            </div>

                            <Link 
                                to="/checkout" 
                                onClick={(e) => {
                                    if (selectedItems.length === 0) {
                                        e.preventDefault();
                                        alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
                                    }
                                }}
                                className={`w-full sm:w-auto px-12 py-3 text-center font-bold rounded-[24px] transition-colors shadow-md ${selectedItems.length > 0 ? 'bg-[#406D5E] hover:bg-[#2f5146] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                Tiến hành thanh toán
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
