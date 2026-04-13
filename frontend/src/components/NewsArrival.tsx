import React, { useState } from "react";
import { motion } from "framer-motion";

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

export default function NewArrivals() {
    const [liked, setLiked] = useState<number[]>([]);

    const toggleFavorite = (id: number) => {
        setLiked((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

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

                    <button className="px-6 py-2 rounded-full font-semibold text-white 
bg-gradient-to-r from-emerald-500 to-emerald-600
hover:from-emerald-600 hover:to-emerald-700
shadow-md hover:shadow-lg hover:shadow-emerald-300/40
active:scale-95
transition-all duration-300 flex items-center gap-2 group"
                    >
                        Xem tất cả

                    </button>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => {
                        const isLiked = liked.includes(product.id);

                        return (
                            <motion.div
                                key={product.id}
                                whileHover={{ y: -8 }}
                                className="group mt-[-30px] border-[2px] border-gray-200 rounded-xl p-6 bg-white w-[calc(100%+5px)]"                            >

                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-6 relative">

                                    <motion.img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                    />

                                    {/* Favorite Button */}
                                    <motion.button
                                        onClick={() => toggleFavorite(product.id)}
                                        whileTap={{ scale: 0.8 }}
                                        animate={
                                            isLiked
                                                ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] }
                                                : {}
                                        }
                                        transition={{ duration: 0.4 }}
                                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center"
                                    >
                                        <span
                                            className={`material-symbols-outlined ${isLiked ? "text-red-500" : "text-black"
                                                }`}
                                            style={{
                                                fontVariationSettings: isLiked
                                                    ? "'FILL' 1"
                                                    : "'FILL' 0",
                                            }}
                                        >
                                            favorite
                                        </span>
                                    </motion.button>

                                </div>

                                <h4 className="text-lg font-bold mb-1">{product.name}</h4>
                                <p className="text-gray-500 text-sm mb-2">
                                    {product.category}
                                </p>
                                <p className="text-emerald-600 font-bold">
                                    {product.price}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}