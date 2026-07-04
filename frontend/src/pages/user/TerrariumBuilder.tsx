import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

type ContainerType = { id: string; name: string; price: number; cssStyle: string; description: string; };
type SoilType = { id: string; name: string; price: number; cssStyle: string; };
type Plant = { id: string; name: string; price: number; image: string; light: string; humidity: string; careLevel: string; maxPerContainer?: number; }
type PlantInstance = Plant & { instanceId: string; x?: number; y?: number; z?: number; };

const TerrariumBuilder: React.FC = () => {
    const [containers, setContainers] = useState<ContainerType[]>([]);
    const [soils, setSoils] = useState<SoilType[]>([]);
    const [plants, setPlants] = useState<Plant[]>([]);

    // --- SELECTED STATES ---
    const [selectedContainer, setSelectedContainer] = useState<ContainerType | null>(null);
    const [selectedSoil, setSelectedSoil] = useState<SoilType | null>(null);
    const [selectedPlants, setSelectedPlants] = useState<PlantInstance[]>([]);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [designNote, setDesignNote] = useState("");
    const [isSubmittingPending, setIsSubmittingPending] = useState(false);
    const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
    const [editingDraftId, setEditingDraftId] = useState<number | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    const [isMyDesignsModalOpen, setIsMyDesignsModalOpen] = useState(false);
    const [myDesigns, setMyDesigns] = useState<any[]>([]);
    const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, isLoading } = useAuth();
    
    const highestZRef = useRef(100);

    // Chuyển hướng nếu chưa đăng nhập
    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để có thể sử dụng tính năng Tự thiết kế Terrarium bạn nhé!',
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
                    navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
                } else {
                    navigate('/'); // Nếu bấm Đóng thì đưa về trang chủ để không kẹt ở Loading
                }
            });
        }
    }, [isLoading, isLoggedIn, navigate, location.pathname, location.search]);

    // Lấy dữ liệu API
    useEffect(() => {
        setIsFetching(true);
        axios.get("http://localhost:8080/api/terrarium-components").then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            const c = data.filter((x: any) => x.type === 'CONTAINER');
            const s = data.filter((x: any) => x.type === 'SOIL');
            const p = data.filter((x: any) => x.type === 'PLANT');

            setContainers(c);
            setSoils(s);
            setPlants(p);

            // Set Mặc định
            if (c.length > 0) setSelectedContainer(c[0]);
            if (s.length > 0) setSelectedSoil(s[0]);
            if (p.length > 0) setSelectedPlants([{ ...p[0], instanceId: `${p[0].id}-${Date.now()}`, z: highestZRef.current++ }]);
        }).catch(err => {
            console.error("Lỗi tải tài nguyên thiết kế:", err);
        }).finally(() => {
            setIsFetching(false);
        });
    }, []);

    const fetchMyDesigns = async () => {
        setIsLoadingDesigns(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/api/terrariums/my-designs", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyDesigns(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách thiết kế của tôi:", error);
            if (isLoggedIn) {
                showErrorToast("Có lỗi khi tải danh sách thiết kế", 2000);
            }
        } finally {
            setIsLoadingDesigns(false);
        }
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('openModal') === 'true') {
            setIsMyDesignsModalOpen(true);
            if (localStorage.getItem("token")) {
                fetchMyDesigns();
            }
        }
    }, [location.search]);

    // --- XỬ LÝ GỬI BẢN NHÁP ---
    const handleSubmitDraft = async (designId: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8080/api/terrariums/${designId}/submit-draft`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccessToast("Đã gửi yêu cầu thiết kế thành công!", 2500);
            fetchMyDesigns(); // Tải lại danh sách thiết kế để cập nhật trạng thái
        } catch (error) {
            console.error("Lỗi gửi bản nháp:", error);
            showErrorToast("Có lỗi xảy ra khi gửi bản nháp.", 2500);
        }
    };

    // --- XỬ LÝ XÓA BẢN NHÁP ---
    const handleDeleteDraft = async (designId: number) => {
        const result = await Swal.fire({
            title: 'Xóa bản nháp?',
            text: "Bạn có chắc chắn muốn xóa bản nháp này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-red-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:bg-red-600 transition-all mx-2',
                cancelButton: 'bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl shadow-md hover:bg-gray-300 transition-all mx-2',
                popup: 'bg-surface rounded-xl shadow-2xl border border-outline-variant',
                title: 'text-gray-800 font-bold text-2xl'
            }
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:8080/api/terrariums/${designId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSuccessToast("Đã xóa bản nháp thành công!", 2000);
                if (editingDraftId === designId) {
                    setEditingDraftId(null);
                    setDesignNote("");
                }
                fetchMyDesigns();
            } catch (error) {
                console.error("Lỗi xóa bản nháp:", error);
                showErrorToast("Có lỗi xảy ra khi xóa bản nháp.", 2500);
            }
        }
    };

    // --- XỬ LÝ SỬA BẢN NHÁP ---
    const handleEditDraft = (design: any) => {
        setEditingDraftId(design.id);
        setDesignNote(design.userNote || "");

        // Tìm và chọn Bình
        const container = containers.find(c => c.name === design.containerName);
        if (container) setSelectedContainer(container);

        // Tìm và chọn Đất
        const soil = soils.find(s => s.name === design.soilName);
        if (soil) setSelectedSoil(soil);

        // Phân tích danh sách Cây và Tọa độ (nếu có)
        const parsedPlants: PlantInstance[] = [];
        if (design.plantPositions) {
            // Tải lại cây kèm tọa độ chính xác đã lưu
            const positions = design.plantPositions.split(';');
            let maxZ = highestZRef.current;
            positions.forEach((pos: string) => {
                const [pName, xStr, yStr, zStr] = pos.split('|');
                const foundPlant = plants.find(p => p.name === pName);
                if (foundPlant) {
                    const parsedZ = zStr !== undefined ? parseInt(zStr, 10) : highestZRef.current++;
                    if (parsedZ >= maxZ) maxZ = parsedZ + 1;
                    parsedPlants.push({
                        ...foundPlant,
                        instanceId: `${foundPlant.id}-${Date.now()}-${Math.random()}`,
                        x: parseFloat(xStr) || 0,
                        y: parseFloat(yStr) || 15,
                        z: parsedZ
                    });
                }
            });
            highestZRef.current = maxZ;
        } else if (design.plants) {
            // Bản nháp cũ chưa có tọa độ
            const plantEntries = design.plants.split(', ');
            plantEntries.forEach((entry: string) => {
                const match = entry.match(/^(\d+)x\s+(.+)$/);
                if (match) {
                    const count = parseInt(match[1], 10);
                    const pName = match[2];
                    const foundPlant = plants.find(p => p.name === pName);
                    if (foundPlant) {
                        for (let i = 0; i < count; i++) {
                            parsedPlants.push({ ...foundPlant, instanceId: `${foundPlant.id}-${Date.now()}-${Math.random()}`, x: 0, y: 15, z: highestZRef.current++ });
                        }
                    }
                }
            });
        }
        setSelectedPlants(parsedPlants);
        setIsMyDesignsModalOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- XỬ LÝ MUA NGAY KHI ĐÃ DUYỆT ---
    const handleBuyNow = async (design: any) => {
        try {
            const token = localStorage.getItem("token");
            // Gọi API để tạo/lấy Product ID tương ứng với bản thiết kế này
            const res = await axios.post(`http://localhost:8080/api/terrariums/${design.id}/checkout-product`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const buyNowItem = {
                id: 'buy-now',
                productId: res.data.productId,
                name: `Terrarium Thiết Kế #${design.id}`,
                price: design.totalPrice,
                image: design.userImage || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=400&h=400&fit=crop",
                quantity: 1,
                isCustomTerrarium: true,
                customTerrariumId: design.id
            };
            navigate('/checkout', { state: { buyNowItem } });
        } catch (error: any) {
            showErrorToast(error.response?.data?.message || "Không thể khởi tạo thanh toán cho thiết kế này.", 3000);
        }
    };

    // Tham chiếu để giới hạn khu vực kéo thả
    const constraintsRef = useRef<HTMLDivElement>(null);
    const terrariumCaptureRef = useRef<HTMLDivElement>(null);

    // --- XỬ LÝ LỰA CHỌN CÂY ---
    const handleAddPlant = (plant: Plant) => {
        const uniqueTypes = new Set(selectedPlants.map(p => p.id));
        const currentQuantityOfThisPlant = selectedPlants.filter(p => p.id === plant.id).length;

        if (!uniqueTypes.has(plant.id) && uniqueTypes.size >= 3) {
            Swal.fire({
                icon: 'warning',
                title: 'Giới hạn loại cây',
                text: 'Không gian bình có hạn! Bạn chỉ có thể chọn tối đa 3 LOẠI cây khác nhau.',
                confirmButtonText: 'Đã hiểu',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    popup: 'bg-surface rounded-xl shadow-2xl border border-outline-variant !w-auto',
                    title: 'text-primary font-bold text-2xl',
                    htmlContainer: 'text-on-surface-variant font-medium whitespace-nowrap px-4'
                }
            });
            return;
        }

        const limit = plant.maxPerContainer || 1; // Mặc định 1 nếu Admin chưa cài đặt
        if (currentQuantityOfThisPlant >= limit) {
            Swal.fire({
                icon: 'warning',
                title: 'Giới hạn số lượng',
                text: `Bạn chỉ có thể thêm tối đa ${limit} cây ${plant.name} vào bình này.`,
                confirmButtonText: 'Đã hiểu',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    popup: 'bg-surface rounded-xl shadow-2xl border border-outline-variant !w-auto',
                    title: 'text-primary font-bold text-2xl',
                    htmlContainer: 'text-on-surface-variant font-medium whitespace-nowrap px-4'
                }
            });
            return;
        }

        const newPlantInstance: PlantInstance = { ...plant, instanceId: `${plant.id}-${Date.now()}-${Math.random()}`, x: 0, y: 15, z: highestZRef.current++ };
        setSelectedPlants([...selectedPlants, newPlantInstance]);
    };

    const handleRemovePlant = (plantId: string) => {
        const index = selectedPlants.map(p => p.id).lastIndexOf(plantId);
        if (index !== -1) {
            const newPlants = [...selectedPlants];
            newPlants.splice(index, 1);
            setSelectedPlants(newPlants);
        }
    };

    // --- XỬ LÝ CHỒNG LÊN NHAU (Z-INDEX) ---
    const bringToFront = (instanceId: string) => {
        setSelectedPlants(prev => prev.map(p => 
            p.instanceId === instanceId 
                ? { ...p, z: highestZRef.current++ }
                : p
        ));
    };

    // --- TÍNH TỔNG TIỀN ---
    const totalPrice = (selectedContainer?.price || 0) + (selectedSoil?.price || 0) + selectedPlants.reduce((sum, p) => sum + p.price, 0);

    // --- LẤY THÔNG TIN CHĂM SÓC ---
    // Hiển thị thông tin của cây đầu tiên được chọn, nếu không có thì để trống
    const careInfo = selectedPlants.length > 0 ? selectedPlants[0] : null;

    // --- XỬ LÝ THÊM VÀO GIỎ HÀNG ---
    const handleSaveOrSubmit = async (status: 'PENDING' | 'DRAFT') => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để lưu bản thiết kế Terrarium.',
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
                    navigate("/login?redirect=/builder");
                }
            });
            return;
        }

        if (status === 'PENDING') setIsSubmittingPending(true);
        else setIsSubmittingDraft(true);
        try {
            const plantNames = selectedPlants.reduce((acc, p) => {
                acc[p.name] = (acc[p.name] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            const plantsStr = Object.entries(plantNames).map(([name, count]) => `${count}x ${name}`).join(", ");
            const positionsStr = selectedPlants.map(p => `${p.name}|${p.x ?? 0}|${p.y ?? 15}|${p.z ?? 0}`).join(';');

            const payload = {
                containerName: selectedContainer?.name,
                containerPrice: selectedContainer?.price,
                soilName: selectedSoil?.name,
                soilPrice: selectedSoil?.price,
                plants: plantsStr,
                plantPositions: positionsStr, // Gửi tọa độ lên backend
                plantsPrice: selectedPlants.reduce((sum, p) => sum + p.price, 0),
                totalPrice: totalPrice,
                userNote: designNote,
                status: status // <-- Gửi trạng thái lên backend
            };

            const formData = new FormData();
            formData.append("design", new Blob([JSON.stringify(payload)], { type: "application/json" }));

            // Chụp ảnh thiết kế hiện tại và gửi lên
            if (terrariumCaptureRef.current) {
                const canvas = await html2canvas(terrariumCaptureRef.current, {
                    backgroundColor: null, // Nền trong suốt
                    useCORS: true,
                    scale: 2 // Tăng độ phân giải ảnh chụp
                });
                const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (imageBlob) {
                    formData.append("image", imageBlob, "terrarium-design.png");
                }
            }

            const url = editingDraftId
                ? `http://localhost:8080/api/terrariums/${editingDraftId}`
                : "http://localhost:8080/api/terrariums";
            const method = editingDraftId ? axios.put : axios.post;

            await method(url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (status === 'PENDING') {
                showSuccessToast(editingDraftId ? "Cập nhật và gửi yêu cầu thành công!" : "Đã gửi yêu cầu thiết kế thành công!", 2500);
                setDesignNote("");
                setEditingDraftId(null); // Trở về trạng thái tạo mới
            } else {
                showSuccessToast(editingDraftId ? "Cập nhật bản nháp thành công!" : "Lưu bản nháp thành công!", 2000);
            }
        } catch (error) {
            console.error("Lỗi lưu thiết kế:", error);
            showErrorToast(status === 'PENDING' ? "Lỗi gửi bản thiết kế. Vui lòng thử lại sau." : "Lỗi lưu bản nháp.", 2500);
        } finally {
            if (status === 'PENDING') setIsSubmittingPending(false);
            else setIsSubmittingDraft(false);
        }
    };

    if (isLoading || !isLoggedIn || isFetching) {
        return (
            <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                <p className="ml-2 font-bold text-gray-500">Đang tải tài nguyên thiết kế...</p>
            </div>
        )
    }

    if (!selectedContainer || !selectedSoil || plants.length === 0) {
        return (
            <div className="bg-background text-on-surface font-body flex flex-col min-h-screen">
                <Header />
                <main className="pt-[85px] flex-1 flex flex-col items-center justify-center text-center px-4">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory_2</span>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có nguyên liệu thiết kế</h2>
                    <p className="text-gray-500">Hiện tại cửa hàng đang cập nhật các nguyên liệu. Bạn vui lòng quay lại sau nhé!</p>
                    <button onClick={() => navigate('/products')} className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-[#2f5146] transition-colors">
                        Xem các sản phẩm khác
                    </button>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="bg-background text-on-surface font-body flex flex-col min-h-screen">
            <Header />

            <main className="pt-[84px] flex-1 flex flex-col lg:flex-row">
                {/* SIDEBAR TRÁI - CÁC TÙY CHỌN */}
                <aside className="w-full lg:w-[400px] bg-white border-r border-gray-100 p-6 md:p-8 flex flex-col gap-8 shadow-sm z-10 overflow-y-auto">
                    <div>
                        <h1 className="text-3xl font-extrabold text-primary mb-1">
                            Thiết Kế Terrarium
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            {editingDraftId ? `Đang chỉnh sửa bản nháp #${editingDraftId}` : 'Tự tay tạo nên hệ sinh thái thu nhỏ của riêng bạn'}
                        </p>
                        {editingDraftId && (
                            <button
                                onClick={() => { setEditingDraftId(null); setDesignNote(""); }}
                                className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 transition-colors w-fit flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[20px]">cancel</span>
                                Hủy chỉnh sửa (Tạo mới)
                            </button>
                        )}
                    </div>

                    {/* Chọn Bình */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-gray-800">1. Chọn loại bình</p>
                            <span className="text-xs font-bold text-primary">{selectedContainer.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {containers.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedContainer(c)}
                                    className={`py-3 px-2 text-sm font-semibold rounded-xl transition-all border-2 ${selectedContainer?.id === c.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-600'}`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chọn Nền */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-gray-800">2. Chọn đất nền</p>
                            <span className="text-xs font-bold text-primary">{selectedSoil.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {soils.map(s => (
                                <div key={s.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setSelectedSoil(s)}>
                                    <div
                                        className={`w-12 h-12 rounded-full shadow-inner transition-transform ${selectedSoil?.id === s.id ? 'ring-4 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: s.cssStyle }}
                                        title={s.name + ` (+${s.price.toLocaleString()}đ)`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chọn Cây */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-gray-800">3. Chọn Cây Mini (Tối đa 3 loại)</p>
                            <span className="text-xs font-bold text-primary">Đã chọn: {new Set(selectedPlants.map(p => p.id)).size}/3 loại</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {plants.map(plant => {
                                const quantity = selectedPlants.filter(p => p.id === plant.id).length;
                                return (
                                    <div
                                        key={plant.id}
                                        onClick={() => quantity === 0 && handleAddPlant(plant)}
                                        className={`relative rounded-2xl p-2 transition-all border-2 bg-white ${quantity > 0 ? 'border-primary shadow-md' : 'border-gray-100 hover:border-gray-300 cursor-pointer'}`}
                                    >
                                        <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-2 overflow-hidden p-2">
                                            <img src={plant.image} alt={plant.name} className="w-full h-full object-contain drop-shadow-md" />
                                        </div>
                                        <p className="text-xs font-bold text-center text-gray-800 line-clamp-1">{plant.name}</p>
                                        <p className="text-[10px] font-semibold text-center text-emerald-600 mb-1">+{plant.price.toLocaleString('vi-VN')}đ</p>

                                        {/* Bộ điều khiển số lượng */}
                                        {quantity > 0 && (
                                            <div className="absolute top-2 right-2 flex items-center bg-white border border-primary rounded-lg shadow-sm overflow-hidden z-10">
                                                <button onClick={(e) => { e.stopPropagation(); handleRemovePlant(plant.id); }} className="w-6 h-6 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                                                    <span className="material-symbols-outlined text-[14px] font-bold">remove</span>
                                                </button>
                                                <span className="w-4 text-center text-xs font-bold text-gray-800">{quantity}</span>
                                                <button onClick={(e) => { e.stopPropagation(); handleAddPlant(plant); }} className="w-6 h-6 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                                                    <span className="material-symbols-outlined text-[14px] font-bold">add</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Yêu cầu thiết kế */}
                    <div>
                        <p className="text-sm font-bold text-gray-800 mb-3">4. Yêu cầu thiết kế (Tùy chọn)</p>
                        <textarea
                            rows={3}
                            placeholder="Ví dụ: Trồng cây sen đá ở chính giữa, rêu phủ xung quanh..."
                            value={designNote}
                            onChange={(e) => setDesignNote(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                        ></textarea>
                    </div>

                    {/* Tổng tiền & Đặt hàng */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-end mb-4">
                            <p className="text-sm font-bold text-gray-500">Tổng cộng</p>
                            <p className="text-3xl font-black text-primary">
                                {totalPrice.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <button onClick={() => handleSaveOrSubmit('PENDING')} disabled={isSubmittingPending || isSubmittingDraft} className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-md hover:bg-[#2f5146] hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:bg-gray-400">
                            {isSubmittingPending ? <span className="material-symbols-outlined animate-spin">autorenew</span> : <span className="material-symbols-outlined">send</span>}
                            {isSubmittingPending ? "Đang gửi..." : "Gửi Yêu Cầu Thiết Kế"}
                        </button>
                        <div className="flex gap-3 mt-3">
                            <button onClick={() => handleSaveOrSubmit('DRAFT')} disabled={isSubmittingPending || isSubmittingDraft} className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-base shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:bg-gray-400">
                                {isSubmittingDraft ? <span className="material-symbols-outlined animate-spin text-lg">autorenew</span> : <span className="material-symbols-outlined text-lg">draft</span>}
                                {isSubmittingDraft ? "Đang lưu..." : (editingDraftId ? "Cập nhật Nháp" : "Lưu Nháp")}
                            </button>
                            <button onClick={() => { setIsMyDesignsModalOpen(true); fetchMyDesigns(); }} className="w-14 h-14 shrink-0 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm" title="Bộ sưu tập thiết kế">
                                <span className="material-symbols-outlined">collections_bookmark</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* CENTER - PREVIEW (XEM TRƯỚC) */}
                <section className="flex-1 relative bg-[#DCE3DE] flex items-center justify-center p-10 overflow-hidden min-h-[500px] lg:min-h-0 shadow-inner">
                    {/* Hiệu ứng Ánh sáng nền */}
                    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-300/40 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-lime-300/30 blur-[100px] rounded-full pointer-events-none" />

                    {/* Bộ điều khiển Zoom */}
                    <div className="absolute top-6 right-6 z-40 flex flex-col bg-white/80 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-gray-100">
                        <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors shadow-sm mb-1" title="Phóng to">
                            <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                        </button>
                        <div className="text-center text-[10px] font-bold text-gray-500 py-1">
                            {Math.round(zoomLevel * 100)}%
                        </div>
                        <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors shadow-sm" title="Thu nhỏ">
                            <span className="material-symbols-outlined text-[20px]">zoom_out</span>
                        </button>
                        <div className="w-full h-px bg-gray-200 my-1"></div>
                        <button onClick={() => setZoomLevel(1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors shadow-sm" title="Đặt lại">
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                        </button>
                    </div>

                    {/* TERRARIUM MOCKUP */}
                    <div ref={terrariumCaptureRef} className="relative flex items-end justify-center mx-auto h-[460px] w-full transition-transform duration-300 ease-out" style={{ transform: `scale(${zoomLevel})` }}>

                        {/* Bóng đổ dưới đáy bình (Realism: 2 lớp bóng, 1 đậm ở giữa, 1 nhạt lan tỏa) */}
                        <div className="absolute bottom-4 w-[160px] h-6 bg-black/30 blur-md rounded-[100%] pointer-events-none" />
                        <div className="absolute bottom-2 w-[260px] h-12 bg-black/10 blur-xl rounded-[100%] pointer-events-none" />

                        {/* Hình dáng kính (Container) */}
                        <div ref={constraintsRef} className={`relative bg-gradient-to-r from-white/20 via-white/5 to-white/20 border-2 border-white/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.6),inset_10px_0_40px_rgba(255,255,255,0.3),inset_-10px_0_30px_rgba(255,255,255,0.3),0_20px_40px_-10px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden flex flex-col justify-end transition-all duration-700 ease-in-out mb-10 ${selectedContainer.cssStyle}`}>

                            {/* Hiệu ứng phản chiếu của kính (Glare cong 3D) */}
                            <div className="absolute inset-y-0 left-[8%] w-[12%] bg-gradient-to-r from-white/40 to-transparent rounded-full blur-md pointer-events-none z-30 transform -skew-x-6" />
                            <div className="absolute inset-y-0 right-[5%] w-[8%] bg-gradient-to-l from-white/20 to-transparent rounded-full blur-sm pointer-events-none z-30" />
                            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-[30deg] pointer-events-none z-30 mix-blend-overlay" />

                            {/* Hiệu ứng giọt sương (Dew drops / Condensation) */}
                            <div className="absolute inset-0 z-30 pointer-events-none opacity-40 mix-blend-overlay" style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 1.5px), radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                                backgroundSize: '16px 24px, 10px 14px',
                                backgroundPosition: '0 0, 8px 12px'
                            }} />

                            {/* Lớp Cây (Plants) - Nằm bên trong bình, trên lớp đất */}
                            <div className="absolute bottom-[26%] left-0 w-full grid place-items-end justify-center px-4 z-20 pointer-events-none">
                                <AnimatePresence>
                                    {selectedPlants.map((plant, index) => (
                                        <motion.div
                                            key={plant.instanceId}
                                            drag
                                            dragConstraints={constraintsRef}
                                            dragElastic={0.1}
                                            dragMomentum={false}
                                            whileDrag={{ scale: 1.15, cursor: "grabbing" }}
                                            initial={{ x: 0, y: 50, opacity: 0, scale: 0.8 }}
                                            animate={{ x: plant.x ?? 0, y: plant.y ?? 15, opacity: 1, scale: 1 }}
                                            exit={{ y: 50, opacity: 0, scale: 0.8 }}
                                            transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                                            onPointerDown={() => bringToFront(plant.instanceId)}
                                            onDragEnd={(e: any, info: any) => {
                                                const newPlants = [...selectedPlants];
                                                newPlants[index] = {
                                                    ...newPlants[index],
                                                    x: (plant.x ?? 0) + (info.offset.x / zoomLevel),
                                                    y: (plant.y ?? 15) + (info.offset.y / zoomLevel)
                                                };
                                                setSelectedPlants(newPlants);
                                            }}
                                            className="relative group w-24 sm:w-32 origin-bottom drop-shadow-[0_15px_10px_rgba(0,0,0,0.5)] pointer-events-auto cursor-grab"
                                            style={{
                                                gridArea: '1 / 1',
                                                zIndex: plant.z ?? (selectedPlants.length - index),
                                                filter: 'contrast(1.05) brightness(0.95)'
                                            }}
                                        >
                                            <img
                                                src={plant.image}
                                                alt={plant.name}
                                                className="w-full h-full object-contain pointer-events-none"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newPlants = [...selectedPlants];
                                                    newPlants.splice(index, 1);
                                                    setSelectedPlants(newPlants);
                                                }}
                                                onPointerDownCapture={(e) => e.stopPropagation()}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-50"
                                                title="Xóa cây này"
                                                data-html2canvas-ignore="true"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Lớp Đất nền (Soil) - Có độ sâu 3D và vân đất */}
                            <div
                                className="w-full h-[28%] transition-colors duration-700 z-10 relative shadow-[inset_0_20px_20px_-10px_rgba(0,0,0,0.6)]"
                                style={{ backgroundColor: selectedSoil.cssStyle }}
                            >
                                {/* Vân đất dạng nhiễu và bóng viền */}
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_50%,_rgba(0,0,0,0.8)_100%)] mix-blend-multiply opacity-80" />
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2)_75%,transparent_75%,transparent)] bg-[length:4px_4px] opacity-20" />
                                <div className="absolute top-0 w-full h-1.5 bg-black/40 blur-[1px]" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* RIGHT SIDEBAR - INFO */}
                <aside className="w-full lg:w-[320px] bg-white border-l border-gray-100 p-6 md:p-8 flex flex-col gap-6 shadow-sm z-10">
                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                        <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 border-b border-emerald-200/50 pb-2">
                            <span className="material-symbols-outlined text-[20px]">psychiatry</span>
                            Mức độ chăm sóc
                        </h3>
                        {careInfo ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm"><span className="text-emerald-700 font-medium">Ánh sáng:</span><span className="font-bold text-gray-800">{careInfo.light}</span></div>
                                <div className="flex justify-between items-center text-sm"><span className="text-emerald-700 font-medium">Độ ẩm:</span><span className="font-bold text-gray-800">{careInfo.humidity}</span></div>
                                <div className="flex justify-between items-center text-sm"><span className="text-emerald-700 font-medium">Mức độ:</span><span className="font-bold text-primary px-2 py-0.5 bg-white rounded-md shadow-sm">{careInfo.careLevel}</span></div>
                            </div>
                        ) : (
                            <p className="text-sm text-emerald-700 font-medium">Hãy chọn ít nhất 1 loại cây để xem thông tin chăm sóc chi tiết.</p>
                        )}
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-gray-500">info</span>
                            Mẹo nhỏ
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            {selectedContainer.description}
                        </p>
                    </div>
                </aside>
            </main>

            {/* MODAL DANH SÁCH THIẾT KẾ ĐÃ LƯU */}
            {isMyDesignsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50 shrink-0">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">collections_bookmark</span>
                                Bộ sưu tập thiết kế của tôi
                            </h3>
                            <button onClick={() => setIsMyDesignsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {isLoadingDesigns ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
                                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                                    <p className="font-medium">Đang tải thiết kế...</p>
                                </div>
                            ) : myDesigns.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
                                    <span className="material-symbols-outlined text-6xl text-gray-300">inventory_2</span>
                                    <p className="font-medium text-lg text-gray-600">Bạn chưa có thiết kế nào.</p>
                                    <p className="text-sm">Hãy tự tay tạo nên một bình Terrarium thật đẹp nhé!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {myDesigns.map(design => (
                                        <div key={design.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                            <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                                                <div>
                                                    <p className="font-bold text-gray-800">Thiết kế #{design.id}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{new Date(design.createdAt).toLocaleString('vi-VN')}</p>
                                                </div>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${design.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        design.status === 'DRAFT' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                            design.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                design.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                    {design.status === 'PENDING' ? 'Đang chờ duyệt' :
                                                        design.status === 'DRAFT' ? 'Bản nháp' :
                                                            design.status === 'APPROVED' ? 'Đã duyệt' :
                                                                design.status === 'REJECTED' ? 'Bị từ chối' :
                                                                    'Khách đã đặt'}
                                                </span>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col gap-3">
                                                <div className="flex gap-3 items-center">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-gray-400">category</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold uppercase">Bình</p>
                                                        <p className="text-sm font-semibold text-gray-800">{design.containerName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 items-center">
                                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-amber-600">landscape</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold uppercase">Đất Nền</p>
                                                        <p className="text-sm font-semibold text-gray-800">{design.soilName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 items-start">
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-emerald-600">potted_plant</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Cây</p>
                                                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{design.plants}</p>
                                                    </div>
                                                </div>
                                                {design.userNote && (
                                                    <div className="mt-2 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                                        <p className="text-xs text-yellow-800 font-bold mb-1">Ghi chú:</p>
                                                        <p className="text-sm text-yellow-700">{design.userNote}</p>
                                                    </div>
                                                )}
                                                {design.userImage && (
                                                    <div className="mt-2">
                                                        <p className="text-xs text-gray-500 font-bold mb-1">Ảnh đính kèm:</p>
                                                        <img src={design.userImage} alt="User design" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                                                    </div>
                                                )}
                                                {design.adminReply && (
                                                    <div className="mt-2 bg-red-50 p-3 rounded-xl border border-red-100">
                                                        <p className="text-xs text-red-800 font-bold mb-1">Phản hồi từ Admin:</p>
                                                        <p className="text-sm text-red-700">{design.adminReply}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 border-t border-gray-100 flex flex-col gap-3 bg-gray-50/30">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-gray-500">Tổng tiền:</span>
                                                    <span className="text-xl font-black text-primary">{design.totalPrice.toLocaleString('vi-VN')}đ</span>
                                                </div>
                                                {design.status === 'DRAFT' && (
                                                    <div className="flex gap-2 mt-1">
                                                        <button onClick={() => handleEditDraft(design)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                            Chỉnh sửa
                                                        </button>
                                                        <button onClick={() => handleSubmitDraft(design.id)} className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#2f5146] transition-colors flex items-center justify-center gap-2">
                                                            <span className="material-symbols-outlined text-[18px]">send</span>
                                                            Gửi yêu cầu
                                                        </button>
                                                        <button onClick={() => handleDeleteDraft(design.id)} className="px-3 bg-red-50 text-red-500 rounded-xl shadow-sm hover:bg-red-100 transition-colors flex items-center justify-center" title="Xóa bản nháp">
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                                {design.status === 'APPROVED' && (
                                                    <div className="flex gap-2 mt-1">
                                                        <button onClick={() => handleBuyNow(design)} className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#2f5146] transition-colors flex items-center justify-center gap-2">
                                                            <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                                                            Mua ngay
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t border-gray-100 flex justify-end bg-white shrink-0">
                            <button onClick={() => setIsMyDesignsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default TerrariumBuilder;