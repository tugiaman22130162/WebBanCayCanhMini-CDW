import React, { useEffect, useMemo, useState } from "react"
import axios from "axios"
import MainLayout from "../layouts/MainLayout"
import FilterBar from "../components/FilterBar"
import ProductCard from "../components/ProductCard"
import { Product } from "../data/products"
import { useFavorites } from "../data/useFavorites"

export default function Products() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [category, setCategory] = useState<string>("all")
    const [sort, setSort] = useState<string>("popular")
    const { isFavorited, toggleFavorite } = useFavorites();

    // FETCH API
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get("http://localhost:8080/api/products");
                console.log("Dữ liệu API trả về:", response.data);
                const formattedData: Product[] = response.data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price || 0,
                    image: (item.images && item.images.length > 0) ? item.images[0] : "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop",
                    category: item.categoryName || item.category?.name || item.category || "Chưa phân loại",
                    categoryId: item.categoryId
                }));
                setProducts(formattedData);
            } catch (err: any) {
                console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
                setError(err.message || "Không thể kết nối đến máy chủ");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // FILTER + SORT LOGIC
    const filteredProducts = useMemo(() => {
        let data = [...products]

        // filter
        if (category && category !== "all") {
            data = data.filter((p: any) => 
                p.category === category || 
                String(p.categoryId) === String(category) || 
                p.category?.toLowerCase() === category.toLowerCase()
            )
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
    }, [products, category, sort])

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

                    {isLoading ? (
                        <div className="text-center py-20 text-on-surface-variant flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                            <p>Đang tải danh sách sản phẩm...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500 font-bold flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-4xl">error</span>
                            <p>Lỗi: {error}</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
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