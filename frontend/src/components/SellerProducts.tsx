import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useFavorites } from "../data/useFavorites";

const products = [
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

export default function SellerProducts() {
    const { isFavorited, toggleFavorite } = useFavorites();

    return (
        <section className="mt-[30px] py-10 px-8 bg-surface-container-lowest">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            Sản phẩm bán chạy
                        </h2>
                        <p className="text-gray-600">
                            Tuyển chọn những sản phẩm mới nhất, tinh tế và đầy cảm hứng{" "}
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
                </div>

                {/* GRID */}
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
            </div>
        </section>
    );
}
