import React from "react";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useFavorites } from "../data/useFavorites";
import { Product } from "../data/products";

const products: Product[] = [
    {
        id: 1,
        name: "Sen đá Echeveria laui",
        category: "Sen đá",
        price: "50.000đ",
        image: "./images/sen_da.jpg",
    },
    {
        id: 2,
        name: "Trầu bà Đế Vương Đỏ",
        category: "Cây để bàn",
        price: "450.000đ",
        image: "./images/cay_trong_nha.jpg",
    },
    {
        id: 3,
        name: "Terrarium treo",
        category: "Terrarium",
        price: "485.000đ",
        image: "./images/terrarium.jpg",
    },
    {
        id: 4,
        name: "Sen đá Kẹo bọc đường",
        category: "Sen đá",
        price: "258.000đ",
        image: "./images/sen_da_1.webp",
    },
];

const NewsArrivalProduct: React.FC = () => {
    const { isFavorited, toggleFavorite } = useFavorites();

    return (
        <div className="min-h-screen bg-background text-on-surface">
            <Header />

            {/* HEADER */}
            <header className="bg-white pt-28 pb-8 px-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-on-surface mb-2">Sản phẩm mới</h2>
                    <p className="text-on-surface-variant max-w-2xl">
                        Tuyển chọn những sản phẩm mới nhất, tinh tế và đầy cảm hứng tại MiniGarden.
                    </p>
                </div>
            </header>

            {/* GRID */}
            <section className="px-6 py-12 max-w-7xl mx-auto">
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
            </section>
            <Footer />
        </div>
    );
};

export default NewsArrivalProduct;