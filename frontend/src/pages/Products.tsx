import React, { useMemo, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import FilterBar from "../components/FilterBar"
import ProductCard from "../components/ProductCard"
import { Product } from "../data/products"
import { useFavorites } from "../data/useFavorites"

const mockProducts: Product[] = [
    {
        id: 1,
        name: "Terrarium Forest Mini",
        price: 120000,
        image: "/images/terrarium.png",
        category: "Terrarium",
    },
    {
        id: 2,
        name: "Cây để bàn Monstera",
        price: 450000,
        image: "/images/cay_de_ban.webp",
        category: "Cây để bàn",
    },
    {
        id: 3,
        name: "Sen đá mix color",
        price: 25000,
        image: "/images/sen_da.webp",
        category: "Sen đá",
    },
    {
        id: 4,
        name: "Terrarium Glass Dome",
        price: 150000,
        image: "/images/terrarium.png",
        category: "Terrarium",
    },
]

export default function Products() {
    const [category, setCategory] = useState<string>("all")
    const [sort, setSort] = useState<string>("popular")
    const { isFavorited, toggleFavorite } = useFavorites();

    // FILTER + SORT LOGIC
    const filteredProducts = useMemo(() => {
        let data = [...mockProducts]

        // filter
        if (category !== "all") {
            data = data.filter((p) => p.category === category)
        }

        const getNumericPrice = (price: string | number) => {
            if (typeof price === "number") return price;
            return Number(price.replace(/[^0-9]/g, ""));
        };

        // sort
        if (sort === "price-low") {
            data.sort((a, b) => getNumericPrice(a.price) - getNumericPrice(b.price))
        }

        if (sort === "price-high") {
            data.sort((a, b) => getNumericPrice(b.price) - getNumericPrice(a.price))
        }

        return data
    }, [category, sort])

    return (
        <MainLayout>
            {/* HEADER SECTION */}
            <section className="bg-white pt-10 pb-6 px-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">

                    <h2 className="text-4xl font-bold text-on-surface mb-2">
                        Bộ sưu tập sản phẩm
                    </h2>

                    <p className="text-on-surface-variant">
                        Khám phá các loại cây cảnh và terrarium được chọn lọc kỹ lưỡng
                    </p>
                </div>
            </section>

            {/* FILTER BAR */}
            <FilterBar
                onCategoryChange={(value) => setCategory(value)}
                onSortChange={(value) => setSort(value)}
            />

            {/* PRODUCTS GRID */}
            <section className="mt-8 px-6 pb-20">
                <div className="max-w-7xl mx-auto">

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 text-on-surface-variant">
                            Không tìm thấy sản phẩm nào 🌿
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

                            {filteredProducts.map((product) => {
                                const isLiked = isFavorited(product);
                                return (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isFavorited={isLiked}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                )
                            })}

                        </div>
                    )}

                </div>
            </section>
        </MainLayout>
    )
}