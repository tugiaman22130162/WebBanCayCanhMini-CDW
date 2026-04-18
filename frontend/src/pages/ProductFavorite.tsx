import React from "react";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useFavorites } from "../data/useFavorites";

const ProductFavorite: React.FC = () => {
    const { favorites, toggleFavorite } = useFavorites();

    return (
        <div className="min-h-screen bg-background text-on-surface">
            <Header />

            {/* HEADER */}
            <header className="bg-white pt-28 pb-8 px-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <p className="text-sm uppercase tracking-widest text-primary font-bold">
                        Bộ Sưu Tập Cá Nhân
                    </p>

                    <h2 className="text-4xl font-bold text-on-surface mt-2 mb-2">
                        Sản phẩm yêu thích
                    </h2>

                    <p className="text-on-surface-variant max-w-2xl">
                        Những mầm xanh bạn đã chọn lọc cho khu vườn nhỏ của mình.
                    </p>
                </div>
            </header>

            {/* GRID */}
            <section className="px-6 py-12 max-w-7xl mx-auto">
                {favorites.length === 0 ? (
                    <div className="text-center py-20 text-on-surface-variant">
                        Bạn chưa có sản phẩm yêu thích nào 🌿
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {favorites.map((product) => (
                            <ProductCard
                                key={product.name}
                                product={product}
                                isFavorited={true}
                                onToggleFavorite={toggleFavorite}
                            />
                        ))}
                    </div>
                )}
            </section>
            <Footer />

        </div>
    );
};

export default ProductFavorite;