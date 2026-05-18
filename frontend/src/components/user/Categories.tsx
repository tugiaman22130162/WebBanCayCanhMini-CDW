import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Category {
    id: number;
    name: string;
    description: string;
    slug: string;
    image_url?: string;
    imageUrl?: string;
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/categories");
                setCategories(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <section className="mt-[30px] pt-6 pb-20 px-8 bg-surface-container-lowest overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Title */}
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">
                        Danh mục sản phẩm
                    </h2>
                    <p className="text-on-surface-variant">
                        Những lựa chọn tuyệt vời cho khu vườn mini của bạn
                    </p>
                </div>

                {/* GRID */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                    </div>
                ) : categories.length > 0 ? (
                    categories.length <= 3 ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:h-[620px]">
                            {/* LEFT BIG CARD */}
                            <div className="group md:col-span-8 relative overflow-hidden rounded-2xl bg-surface-container-lowest h-full transition-all duration-500 hover:shadow-2xl">
                                <img
                                    src={categories[0].image_url || categories[0].imageUrl || "/images/terrarium.png"}
                                    alt={categories[0].name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-8">
                                    <h3 className="text-3xl font-bold text-white mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        {categories[0].name}
                                    </h3>
                                    <p className="text-white/80 mb-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                        {categories[0].description}
                                    </p>
                                    <Link to={`/products?category=${categories[0].id}`} className="text-white font-semibold underline translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-900">
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            {categories.length > 1 && (
                                <div className="md:col-span-4 flex flex-col gap-6 h-full">
                                    {categories.slice(1, 3).map((category, index) => (
                                        <div key={category.id} className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-surface-container-lowest transition-all duration-500 hover:shadow-xl">
                                            <img
                                                src={category.image_url || category.imageUrl || (index === 0 ? "/images/cay_de_ban.webp" : "/images/sen_da.webp")}
                                                alt={category.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                                <h3 className="text-xl font-bold text-white translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                    {category.name}
                                                </h3>
                                                <p className="text-white/80 text-sm translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                                    {category.description}
                                                </p>
                                                <Link to={`/products?category=${category.id}`} className="text-white font-semibold underline translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-900">
                                                    Xem chi tiết
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((category) => (
                                <div key={category.id} className="group relative overflow-hidden rounded-2xl h-[300px] sm:h-[350px] bg-surface-container-lowest transition-all duration-500 hover:shadow-xl">
                                    <img
                                        src={category.image_url || category.imageUrl || "/images/terrarium.png"}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                                        <h3 className="text-xl font-bold text-white translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            {category.name}
                                        </h3>
                                        <p className="text-white/80 text-sm translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                            {category.description}
                                        </p>
                                        <Link to={`/products?category=${category.id}`} className="text-white font-semibold underline translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-900">
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        Chưa có danh mục sản phẩm nào.
                    </div>
                )}
            </div>
        </section>
    );
}
