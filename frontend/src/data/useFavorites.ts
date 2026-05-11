import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export function useFavorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { token, isLoggedIn } = useAuth();

    // Lấy danh sách sản phẩm yêu thích từ API
    const fetchFavorites = useCallback(async () => {
        if (!isLoggedIn || !token) {
            setFavorites([]);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/favorites', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Format dữ liệu trả về để khớp với thuộc tính 'image' mà ProductCard yêu cầu
            const formattedData = response.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price || 0,
                image: (item.images && item.images.length > 0) ? item.images[0] : "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=400&h=400&fit=crop",
                category: item.categoryName || item.category?.name || item.category || "Chưa phân loại",
            }));
            setFavorites(formattedData);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu thích:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token, isLoggedIn]);

    useEffect(() => {
        fetchFavorites();

        // Lắng nghe sự kiện để đồng bộ state ngay lập tức giữa các hook (VD: từ Products sang Header)
        const handleLocalToggle = (e: Event) => {
            const { product, isAdd } = (e as CustomEvent).detail;
            setFavorites(prev => {
                if (isAdd) {
                    // Tránh thêm trùng lặp
                    if (!prev.find(p => p.id === product.id)) return [...prev, product];
                    return prev;
                } else {
                    return prev.filter(p => p.id !== product.id);
                }
            });
        };
        window.addEventListener('localFavoriteToggle', handleLocalToggle);
        return () => window.removeEventListener('localFavoriteToggle', handleLocalToggle);
    }, [fetchFavorites]);

    // Kiểm tra sản phẩm đã nằm trong danh sách yêu thích chưa
    const isFavorited = useCallback((product: any) => {
        return favorites.some(fav => fav.id === product.id);
    }, [favorites]);

    // Hàm xử lý Thêm / Xóa khỏi danh sách yêu thích
    const toggleFavorite = useCallback(async (product: any) => {
        if (!isLoggedIn || !token) {
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để lưu sản phẩm vào danh sách yêu thích!',
                confirmButtonText: 'Đăng nhập ngay',
                showCancelButton: true,
                cancelButtonText: 'Đóng',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    cancelButton: 'bg-error text-on-error font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    popup: 'bg-surface rounded-xl shadow-2xl border border-outline-variant',
                    title: 'text-primary font-bold text-2xl',
                    htmlContainer: 'text-on-surface-variant font-medium'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                }
            });
            return;
        }

        const currentlyFavorited = isFavorited(product);

        // Cập nhật giao diện ngay lập tức để tăng trải nghiệm người dùng
        // Phát event để tất cả các hook useFavorites ở các component khác đều nhận được sự thay đổi
        window.dispatchEvent(new CustomEvent('localFavoriteToggle', { detail: { product, isAdd: !currentlyFavorited } }));

        try {
            if (currentlyFavorited) {
                await axios.delete(`http://localhost:8080/api/favorites/${product.id}`, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post(`http://localhost:8080/api/favorites/${product.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu thích:', error);
            fetchFavorites(); // Phục hồi lại dữ liệu cũ nếu lỗi
            Swal.fire({ 
                toast: true, 
                position: 'top-end', 
                icon: 'error', 
                title: 'Không thể cập nhật danh sách yêu thích!', 
                showConfirmButton: false, 
                timer: 2000,
                width: 'auto',
                padding: '0.5em 1em',
                customClass: {
                    popup: 'mb-6 bg-error-container rounded-full shadow-lg border border-error/20 flex items-center',
                    title: 'text-sm font-bold text-on-error-container whitespace-nowrap'
                }
            });
        }
    }, [isLoggedIn, token, isFavorited, fetchFavorites]);

    return { favorites, isFavorited, toggleFavorite, isLoading, refreshFavorites: fetchFavorites };
}