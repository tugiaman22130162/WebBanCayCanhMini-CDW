import React, { useMemo, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import FilterBar from "../components/FilterBar"

type Product = {
    id: number
    name: string
    price: number
    image: string
    category: "Terrarium" | "Cây để bàn" | "Sen đá"
}

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

    // FILTER + SORT LOGIC
    const filteredProducts = useMemo(() => {
        let data = [...mockProducts]

        // filter
        if (category !== "all") {
            data = data.filter((p) => p.category === category)
        }

        // sort
        if (sort === "price-low") {
            data.sort((a, b) => a.price - b.price)
        }

        if (sort === "price-high") {
            data.sort((a, b) => b.price - a.price)
        }

        return data
    }, [category, sort])

    return (
        <MainLayout>
            {/* HEADER SECTION */}
            <section className="bg-white pt-10 pb-6 px-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">

                    <h1 className="text-4xl font-black text-on-surface mb-2">
                        Bộ sưu tập sản phẩm
                    </h1>

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

                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300"
                                >

                                    {/* IMAGE */}
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                        />

                                        {/* badge */}
                                        <span className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1 rounded-full">
                                            {product.category}
                                        </span>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-5 space-y-3">

                                        <h3 className="font-bold text-lg text-on-surface line-clamp-1">
                                            {product.name}
                                        </h3>

                                        <p className="text-emerald-600 font-bold text-xl">
                                            {product.price.toLocaleString("vi-VN")}đ
                                        </p>

                                        <button className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all">
                                            Thêm vào giỏ
                                        </button>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </div>
            </section>
        </MainLayout>
    )
}