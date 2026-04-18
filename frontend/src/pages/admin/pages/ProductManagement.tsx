import React from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

export default function ProductManagement() {
    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />

            {/* MAIN */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-8 flex-1 overflow-y-auto">
                    {/* HEADER */}
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-4xl font-extrabold">Quản Lý Sản Phẩm</h2>

                        </div>

                        <div className="flex gap-3">
                            <button className="px-6 py-3 rounded-xl bg-white">
                                Bộ lọc
                            </button>
                            <button className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold">
                                Thêm Sản Phẩm
                            </button>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                        <Stat title="Tổng Sản Phẩm" value="1,284" icon="inventory_2" iconBgColor="bg-blue-50" iconTextColor="text-blue-600" color="text-on-surface" />
                        <Stat title="Sắp Hết Hàng" value="18" icon="warning" iconBgColor="bg-yellow-50" iconTextColor="text-yellow-600" color="text-yellow-600" />
                        <Stat title="Hết Hàng" value="04" icon="error" iconBgColor="bg-red-50" iconTextColor="text-red-600" color="text-red-500" />
                        <Stat title="Danh Mục" value="12" icon="category" iconBgColor="bg-purple-50" iconTextColor="text-purple-600" color="text-on-surface" />
                    </div>

                    {/* PRODUCTS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <ProductCard name="Monstera Deliciosa" price="450.000đ" stock="42" sku="MD-001" />
                        <ProductCard name="Echeveria Rose" price="120.000đ" stock="03" sku="ER-042" low />
                        <ProductCard name="Fiddle Leaf Fig" price="1.250.000đ" stock="15" sku="FLF-09" />
                        <OutOfStockCard />
                        <ProductCard name="Calathea Orbifolia" price="280.000đ" stock="11" sku="CO-112" />
                    </div>
                </main>
            </div>
        </div>
    );
}

type StatProps = {
    title: string;
    value: string | number;
    color?: string;
    icon: string;
    iconBgColor?: string;
    iconTextColor?: string;
};

function Stat({ title, value, color = "text-primary", icon, iconBgColor = "bg-gray-50", iconTextColor = "text-gray-600" }: StatProps) {
    return (
        <div className="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
                <p className="text-xs uppercase text-on-surface-variant font-semibold mb-1">{title}</p>
                <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full ${iconBgColor} ${iconTextColor} flex items-center justify-center`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
        </div>
    );
}

type ProductCardProps = {
    name: string;
    price: string;
    stock: string | number;
    sku: string;
    low?: boolean;
};

function ProductCard({ name, price, stock, sku, low }: ProductCardProps) {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow">
            <div className="h-56 bg-gray-200" />

            <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold">{name}</h3>
                <p className="font-black">{price}</p>

                <div className="flex justify-between text-sm">
                    <span>{stock} chậu</span>
                    <span>{sku}</span>
                </div>

                <button className="w-full bg-primary text-on-primary py-2 rounded-xl font-bold">
                    Chi tiết
                </button>
            </div>
        </div>
    );
}

function OutOfStockCard() {
    return (
        <div className="bg-gray-100 rounded-3xl overflow-hidden opacity-60">
            <div className="h-56 bg-gray-300 flex items-center justify-center text-red-500 font-bold">
                Out of Stock
            </div>
            <div className="p-6">
                <h3 className="font-bold">Cactus Mix Set</h3>
                <p className="text-red-500 font-bold">Hết hàng</p>
            </div>
        </div>
    );
}