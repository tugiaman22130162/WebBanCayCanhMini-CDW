import React from "react";
import ProductCard from "../../components/user/ProductCard";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import { useFavorites } from "../../data/useFavorites";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const ProductFavorite: React.FC = () => {
    const { favorites, toggleFavorite, isLoading } = useFavorites();
    const { isLoggedIn } = useAuth();

    const handleRemoveFavorite = (product: any) => {
        Swal.fire({
            title: 'Bỏ yêu thích?',
            text: `Bạn có chắc chắn muốn bỏ yêu thích sản phẩm "${product.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-error text-on-error font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                cancelButton: 'bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                popup: 'bg-surface rounded-xl shadow-2xl border border-outline-variant',
                title: 'text-gray-800 font-bold text-2xl'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                await toggleFavorite(product);
                
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Đã xóa thành công!',
                    timer: 1500,
                    showConfirmButton: false,
                    width: 'auto',
                    padding: '0.5em 1em',
                    customClass: {
                        popup: 'mb-6 mt-16 rounded-full shadow-lg border border-gray-100 flex items-center',
                        title: 'text-sm font-bold text-gray-700 whitespace-nowrap',
                    }
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-background text-on-surface">
            <Header />

            {/* HEADER */}
            <header className="bg-white pt-28 pb-8 px-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <motion.nav 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex text-sm text-gray-500 mb-8"
                    >
                        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800 font-semibold truncate">Sản phẩm yêu thích</span>
                    </motion.nav>
                    <p className="text-sm uppercase tracking-widest text-primary font-bold">
                        Bộ Sưu Tập Cá Nhân
                    </p>

                    <h2 className="text-4xl font-bold text-on-surface mt-2 mb-2">
                        Sản phẩm yêu thích
                    </h2>

                    <p className="text-on-surface-variant max-w-2xl">
                        Những mầm xanh bạn đã chọn lọc cho khu vườn nhỏ của mình.
                    </p>
                </div>
            </header>

            {/* GRID */}
            <section className="px-6 py-12 max-w-7xl mx-auto">
                {!isLoggedIn ? (
                    <div className="text-center py-20 text-on-surface-variant flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-5xl text-gray-300">lock</span>
                        <p>Vui lòng đăng nhập để xem danh sách yêu thích của bạn 🌿</p>
                        <Link to="/login" className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-[#2f5146] transition-colors shadow-sm">Đăng nhập</Link>
                    </div>
                ) : isLoading ? (
                    <div className="text-center py-20 text-on-surface-variant flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                        <p>Đang tải danh sách yêu thích...</p>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-20 text-on-surface-variant">
                        Bạn chưa có sản phẩm yêu thích nào 🌿
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {favorites.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isFavorited={true}
                                onToggleFavorite={handleRemoveFavorite}
                            />
                        ))}
                    </div>
                )}
            </section>
            <Footer />

        </div>
    );
};

export default ProductFavorite;