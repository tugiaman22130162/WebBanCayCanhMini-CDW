import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../../components/user/ProductCard";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import { useFavorites } from "../../data/useFavorites";
import { Product } from "../../data/products";
import axios from "axios";

const NewsArrivalProduct: React.FC = () => {
    const { isFavorited, toggleFavorite } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/products");
                const formattedData: Product[] = response.data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price || 0,
                    image: (item.images && item.images.length > 0) ? item.images[0] : "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=400&h=400&fit=crop",
                    category: item.categoryName || item.category?.name || item.category || "Chưa phân loại",
                })).reverse(); // Đảo ngược để hiển thị mới nhất trước
                
                setProducts(formattedData);
            } catch (error) {
                console.error("Lỗi khi lấy sản phẩm mới:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-background text-on-surface">
            <Header />

            {/* HEADER */}
            <header className="bg-white pt-28 pb-8 px-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <motion.nav 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex text-sm text-gray-500 mb-8"
                    >
                        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800 font-semibold truncate">Sản phẩm mới</span>
                    </motion.nav>
                    <h2 className="text-4xl font-bold text-on-surface mb-2">Sản phẩm mới</h2>
                    <p className="text-on-surface-variant max-w-2xl">
                        Tuyển chọn những sản phẩm mới nhất, tinh tế và đầy cảm hứng tại MiniGarden.
                    </p>
                </div>
            </header>

            {/* GRID */}
            <section className="px-6 py-12 max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => {
                            const isLiked = isFavorited(product);
                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isFavorited={isLiked}
                                    onToggleFavorite={toggleFavorite}
                                />
                            );
                        })}
                    </div>
                )}
            </section>
            <Footer />
        </div>
    );
};

export default NewsArrivalProduct;