import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ProductCard from "../user/ProductCard";
import { useFavorites } from "../../data/useFavorites";
import axios from "axios";
import { Product } from "../../data/products";

export default function NewArrivals() {
    const { isFavorited, toggleFavorite } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/products");
                // Đảo ngược mảng để lấy 4 sản phẩm mới nhất
                const formattedData: Product[] = response.data
                    .filter((item: any) => !item.name?.startsWith("Terrarium Thiết Kế #"))
                    .map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price || 0,
                        image: (item.images && item.images.length > 0) ? item.images[0] : "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=400&h=400&fit=crop",
                        category: item.categoryName || item.category?.name || item.category || "Chưa phân loại",
                        categoryId: item.categoryId || item.category?.id || null,
                        stock: item.quantity ?? item.stock ?? 0,
                    })).reverse().slice(0, 4);
                
                setProducts(formattedData);
            } catch (error) {
                console.error("Lỗi khi lấy sản phẩm mới:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNewArrivals();
    }, []);

    return (
        <section className="mt-[30px] py-10 px-8 bg-surface-container-lowest">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            Sản phẩm mới
                        </h2>
                        <p className="text-gray-600">
                            Tuyển chọn những sản phẩm mới nhất, tinh tế và đầy cảm hứng                        </p>
                    </div>

                    <Link
                        to="/new-arrivals"
                        className="px-6 py-2 rounded-full font-semibold text-white 
                    bg-gradient-to-r from-emerald-500 to-emerald-600
                    hover:from-emerald-600 hover:to-emerald-700
                    shadow-md hover:shadow-lg hover:shadow-emerald-300/40
                    active:scale-95
                    transition-all duration-300 flex items-center gap-2 group"
                    >
                        Xem tất cả
                    </Link>
                </div>

                {/* GRID */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => {
                            const isLiked = isFavorited(product);

                            return (
                                <div key={product.id} className="mt-[-30px]">
                                    <ProductCard
                                        product={product}
                                        isFavorited={isLiked}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}