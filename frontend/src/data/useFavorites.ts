import { useState, useEffect } from "react";
import { Product } from "./products";

export function useFavorites() {
    const [favorites, setFavorites] = useState<Product[]>(() => {
        try {
            const saved = localStorage.getItem("favorites");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const saved = localStorage.getItem("favorites");
                setFavorites(saved ? JSON.parse(saved) : []);
            } catch {
                setFavorites([]);
            }
        };

        // Lắng nghe sự kiện để đồng bộ ngay lập tức trên cùng một tab
        window.addEventListener("favoritesChanged", handleStorageChange);
        // Lắng nghe sự kiện storage để đồng bộ giữa các tab khác nhau
        window.addEventListener("storage", handleStorageChange);
        
        return () => {
            window.removeEventListener("favoritesChanged", handleStorageChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const toggleFavorite = (product: Product) => {
        setFavorites((prev) => {
            const isLiked = prev.some((p) => p.name === product.name);
            const newFavorites = isLiked
                ? prev.filter((p) => p.name !== product.name)
                : [...prev, product];
            
            localStorage.setItem("favorites", JSON.stringify(newFavorites));
            window.dispatchEvent(new Event("favoritesChanged"));
            return newFavorites;
        });
    };

    const isFavorited = (product: Product) => {
        return favorites.some((p) => p.name === product.name);
    };

    return { favorites, toggleFavorite, isFavorited };
}