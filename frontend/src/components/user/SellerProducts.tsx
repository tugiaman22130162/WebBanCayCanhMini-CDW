import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useFavorites } from "../../data/useFavorites";
import axios from "axios";
import { Product } from "../../data/products";

export default function SellerProducts() {
    const { isFavorited, toggleFavorite } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/products/best-sellers");
                const formattedData: Product[] = response.data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price || 0,
                    image: (item.images && item.images.length > 0) ? item.images[0] : "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=400&h=400&fit=crop",
                    category: item.categoryName || item.category_name || item.category?.name || item.category || "Chưa phân loại",
                    categoryId: item.categoryId || item.category_id || item.category?.id || null,
                }));
                setProducts(formattedData);
            } catch (error) {
                console.error("Lỗi khi lấy sản phẩm bán chạy:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBestSellers();
    }, []);

    return (
        <section className="mt-[30px] py-10 px-8 bg-surface-container-lowest">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-end mb-16"
                >
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            Sản phẩm bán chạy
                        </h2>
                        <p className="text-gray-600">
                            Tuyển chọn những sản phẩm được yêu thích nhất tại MiniGarden
                        </p>
                    </div>

                    <Link
                        to="/best-sellers"
                        className="px-6 py-2 rounded-full font-semibold text-white 
bg-gradient-to-r from-emerald-500 to-emerald-600
hover:from-emerald-600 hover:to-emerald-700
shadow-md hover:shadow-lg hover:shadow-emerald-300/40
active:scale-95
transition-all duration-300 flex items-center gap-2 group"
                    >
                        Xem tất cả
                    </Link>
                </motion.div>

                {/* GRID */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, index) => {
                            const isLiked = isFavorited(product);
                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
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
                ) : (
                    <div className="text-center py-10 text-gray-500">Chưa có dữ liệu sản phẩm bán chạy.</div>
                )}
            </div>
        </section>
    );
}
