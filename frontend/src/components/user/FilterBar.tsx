import { useState } from "react"

type Category = "all" | "Terrarium" | "Cây để bàn" | "Sen đá"

type SortOption =
    | "popular"
    | "newest"
    | "price-low"
    | "price-high"

type Props = {
    onCategoryChange?: (category: Category) => void
    onSortChange?: (sort: SortOption) => void
}

export default function FilterBar({
    onCategoryChange,
    onSortChange,
}: Props) {
    const [activeCategory, setActiveCategory] = useState<Category>("all")
    const [sort, setSort] = useState<SortOption>("popular")

    const categories: { label: string; value: Category }[] = [
        { label: "Tất cả", value: "all" },
        { label: "Terrarium", value: "Terrarium" },
        { label: "Cây để bàn", value: "Cây để bàn" },
        { label: "Sen đá", value: "Sen đá" },
    ]

    const handleCategoryClick = (category: Category) => {
        setActiveCategory(category)
        onCategoryChange?.(category)
    }

    const handleSortChange = (value: SortOption) => {
        setSort(value)
        onSortChange?.(value)
    }

    return (
        <section className="max-w-7xl mx-auto px-6 py-10 mb-[-30px]">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                {/* CATEGORY FILTER */}
                <div className="flex flex-col gap-3">

                    <div className="flex flex-wrap gap-3">
                        {categories.map((item) => (
                            <button
                                key={item.value}
                                onClick={() => handleCategoryClick(item.value)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all
                  ${activeCategory === item.value
                                        ? "bg-primary text-white shadow"
                                        : "bg-gray-100 text-gray-700 hover:bg-primary hover:text-white"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SORT */}
                <div className="flex items-center gap-4">
                    <span className="text-xs uppercase tracking-widest font-bold text-gray-500">
                        Sắp xếp
                    </span>

                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                handleSortChange(e.target.value as SortOption)
                            }
                            className="appearance-none px-4 py-2 pr-10 rounded-full bg-gray-100 border border-gray-200 text-primary font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="popular">Phổ biến nhất</option>
                            <option value="newest">Mới nhất</option>
                            <option value="price-low">Giá tăng dần</option>
                            <option value="price-high">Giá giảm dần</option>
                        </select>

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                            <span className="material-symbols-outlined text-lg">
                                expand_more
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}