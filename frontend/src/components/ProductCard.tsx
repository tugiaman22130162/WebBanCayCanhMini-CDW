import React from "react";
import { motion } from "framer-motion";
import type { Product } from "../data/products";

type Props = {
    product: Product;
    isFavorited?: boolean;
    showFavoriteButton?: boolean;
    onToggleFavorite?: (product: Product) => void;
};

const ProductCard: React.FC<Props> = ({
    product,
    isFavorited,
    showFavoriteButton = true,
    onToggleFavorite,
}) => {
    const handleToggleFavorite = () => {
        if (onToggleFavorite) {
            onToggleFavorite(product);
        }
    };

    const priceString =
        typeof product.price === "number"
            ? product.price.toLocaleString("vi-VN") + "đ"
            : product.price;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group h-full flex flex-col border-[2px] border-gray-200 rounded-xl p-6 bg-white"
        >
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-6 relative">
                <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                />

                <span className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1 rounded-full">
                    {product.category}
                </span>

                {showFavoriteButton && (
                    <motion.button
                        onClick={handleToggleFavorite}
                        whileTap={{ scale: 0.8 }}
                        animate={isFavorited ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center"
                    >
                        <span className={`material-symbols-outlined ${isFavorited ? "text-red-500" : "text-black"}`} style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>
                            favorite
                        </span>
                    </motion.button>
                )}
            </div>

            <div className="flex flex-col flex-grow gap-3">
                <h4 className="text-lg font-bold line-clamp-1">{product.name}</h4>
                <p className="text-emerald-600 font-bold">{priceString}</p>

                <button className="w-full mt-auto pt-3 pb-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container hover:scale-[1.02] active:scale-95 transition-all">
                    Thêm vào giỏ
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;