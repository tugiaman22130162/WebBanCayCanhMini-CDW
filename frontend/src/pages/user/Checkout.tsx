import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Swal from "sweetalert2";
import CheckoutAddress from "../../components/user/CheckoutAddress";
import CheckoutShippingPayment from "../../components/user/CheckoutShippingPayment";
import CheckoutSummary from "../../components/user/CheckoutSummary";
import axios from "axios";

// Theo dõi vị trí con trỏ chuột để hiển thị thông báo
let cursorX = 0;
let cursorY = 0;
if (typeof window !== "undefined") {
    window.addEventListener("click", (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    }, true);
}

// Cấu hình mặc định cho Toast (Nhỏ gọn, hiển thị tại vị trí click chuột)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-start', // Đặt vị trí gốc để kích hoạt container
    showConfirmButton: false,
    timer: 2000,
    width: 'auto',
    padding: '0.4em 0.8em',
    customClass: {
        // Phá vỡ các giới hạn của lớp bọc ngoài cùng (container)
        container: '!fixed !p-0 !m-0 !w-auto !h-auto !overflow-visible !pointer-events-none',
        popup: '!rounded-full shadow-xl border border-gray-200 !min-h-0 !flex !items-center !gap-1.5 !m-0 !bg-white !pointer-events-auto',
        title: '!text-sm !font-bold !text-gray-700 !m-0 !p-0',
        icon: '!text-[8px] !m-0 !p-0',
    },
    didOpen: (toast) => {
        const container = Swal.getContainer();
        if (container) {
            // Tính toán vị trí chuột
            let topPos = cursorY - 50;
            let leftPos = cursorX + 15;

            if (topPos < 10) topPos = cursorY + 20;
            if (leftPos + toast.offsetWidth > window.innerWidth) leftPos = window.innerWidth - toast.offsetWidth - 10;

            // Dịch chuyển toàn bộ container đến đúng vị trí chuột
            container.style.transform = `translate(${leftPos}px, ${topPos}px)`;
        }

        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [shippingAddress, setShippingAddress] = useState("home");
    const [shippingServices, setShippingServices] = useState<any[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [productPromoCode, setProductPromoCode] = useState("");
    const [shippingPromoCode, setShippingPromoCode] = useState("");
    const [productDiscount, setProductDiscount] = useState(0);
    const [shippingDiscount, setShippingDiscount] = useState(0);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [apiShippingFee, setApiShippingFee] = useState<number | null>(null);
    const [estimatedDelivery, setEstimatedDelivery] = useState("Vui lòng chọn địa chỉ giao hàng");
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [note, setNote] = useState("");
    const [estimatedDateFrom, setEstimatedDateFrom] = useState<Date | null>(null);
    const [estimatedDateTo, setEstimatedDateTo] = useState<Date | null>(null);
    const [activeDistrictId, setActiveDistrictId] = useState<number | null>(null);


    useEffect(() => {
        const fetchCartItems = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/login');
                return;
            }

            // Nếu có dữ liệu "Mua Ngay" truyền từ trang Chi tiết sản phẩm
            if (location.state?.buyNowItem) {
                setCartItems([location.state.buyNowItem]);
                return; // Ngừng chạy, không cần gọi API tải giỏ hàng nữa
            }

            try {
                let userId;
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    userId = JSON.parse(userStr).id;
                } else {
                    const userRes = await axios.get("http://localhost:8080/api/users/me", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    userId = userRes.data.id;
                    localStorage.setItem("user", JSON.stringify(userRes.data));
                }

                let myDesigns: any[] = [];
                try {
                    const designsRes = await axios.get("http://localhost:8080/api/terrariums/my-designs", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    myDesigns = designsRes.data;
                } catch (e) {}

                const response = await axios.get(`http://localhost:8080/api/cart/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const allItems = response.data.items || [];
                const mappedItems = allItems.map((item: any) => {
                    if (item.product?.name && item.product.name.startsWith("Terrarium Thiết Kế #")) {
                        try {
                            const match = item.product.name.match(/Terrarium Thiết Kế #(\d+)/);
                            if (match) {
                                const designId = parseInt(match[1]);
                                const design = myDesigns.find((d: any) => d.id === designId);
                                if (design && design.userImage) {
                                    return { ...item, image: design.userImage, name: item.product.name };
                                }
                            }
                        } catch(e) {}
                    }
                    return item;
                });
                const selectedItemIds = location.state?.selectedItems || [];

                if (selectedItemIds.length > 0) {
                    setCartItems(mappedItems.filter((item: any) => selectedItemIds.includes(item.id)));
                } else {
                    setCartItems(mappedItems);
                }
            } catch (error) {
                console.error("Lỗi tải giỏ hàng thanh toán:", error);
                Toast.fire({ icon: 'error', title: 'Không thể tải giỏ hàng!' });
            }
        };
        fetchCartItems();
        window.scrollTo(0, 0);
    }, [navigate, location.state]);

    // 1. Lấy danh sách dịch vụ giao hàng khả dụng
    useEffect(() => {
        const fetchServices = async () => {
            if (!shippingAddress) return;
            const selectedAddr = addresses.find(a => String(a.id) === String(shippingAddress));
            if (!selectedAddr || !selectedAddr.districtId) return;

            setSelectedServiceId(0);
            setApiShippingFee(null);
            setActiveDistrictId(null);
            setEstimatedDelivery("Đang cập nhật tuyến đường...");

            try {
                const res = await axios.post("http://localhost:8080/api/ghn/services", {
                    to_district_id: Number(selectedAddr.districtId)
                });

                if (res.data.code === 200 && res.data.data && res.data.data.length > 0) {
                    // Chỉ lấy 1 phương thức giao hàng duy nhất (Ưu tiên Tiêu chuẩn - service_type_id: 2)
                    const singleService =
                        res.data.data.find((s: any) => s.service_type_id === 2) ||
                        res.data.data[0];

                    console.log("ALL SERVICES", res.data.data);
                    console.log("SELECTED SERVICE", singleService);

                    setShippingServices([singleService]);
                    setSelectedServiceId(singleService.service_id);
                    setActiveDistrictId(Number(selectedAddr.districtId));
                } else {
                    setShippingServices([]);
                    setSelectedServiceId(0);
                    setApiShippingFee(0);
                    setEstimatedDelivery("Rất tiếc, GHN không hỗ trợ giao hàng đến địa chỉ này");
                }
            } catch (error: any) {
                console.error("Lỗi lấy danh sách phương thức giao hàng:", error.response?.data ? JSON.stringify(error.response.data) : error.message);
                setShippingServices([]);
                setSelectedServiceId(0);
                setApiShippingFee(0);
                setEstimatedDelivery("Không thể kết nối đến Giao Hàng Nhanh");
            }
        };
        fetchServices();
    }, [cartItems, shippingAddress, addresses]);

    // 2. Tính phí và thời gian giao hàng cho dịch vụ đang được chọn
    useEffect(() => {
        const fetchShippingFee = async () => {
            if (cartItems.length === 0 || !shippingAddress) return;

            const selectedAddr = addresses.find(
                a => String(a.id) === String(shippingAddress)
            );

            if (!selectedAddr || Number(selectedAddr.districtId) !== activeDistrictId) return;

            if (!selectedAddr.districtId || !selectedAddr.wardCode) {
                setApiShippingFee(0);
                setEstimatedDelivery(
                    "Vui lòng Sửa lại địa chỉ và chọn đúng Quận/Huyện/Xã"
                );
                return;
            }

            if (!selectedServiceId) return;

            setIsCalculatingFee(true);

            // reset UI trước khi gọi API
            setApiShippingFee(null);
            setEstimatedDelivery("Đang tính...");
        setEstimatedDateFrom(null);
        setEstimatedDateTo(null);

            try {
                const totalWeight = cartItems.reduce(
                    (sum, item) => sum + ((item.quantity || 1) * 500),
                    0
                );

                const totalValue = cartItems.reduce(
                    (sum, item) =>
                        sum +
                        ((item.price || item.product?.price || 0) * item.quantity),
                    0
                );

                // gọi API phí ship
                const feeRes = await axios.post(
                    "http://localhost:8080/api/ghn/fee",
                    {
                        service_id: selectedServiceId,
                        to_district_id: Number(selectedAddr.districtId),
                        to_ward_code: String(selectedAddr.wardCode),
                        weight: Math.round(totalWeight) || 500,
                        length: 20,
                        width: 20,
                        height: 20,
                        insurance_value: Math.round(
                            totalValue > 5000000 ? 5000000 : totalValue
                        )
                    }
                );

                if (feeRes.data.code === 200) {
                    setApiShippingFee(feeRes.data.data.total);
                }

                // gọi API thời gian giao hàng
                const timeRes = await axios.post(
                    "http://localhost:8080/api/ghn/leadtime",
                    {
                        service_id: selectedServiceId,
                        to_district_id: Number(selectedAddr.districtId),
                        to_ward_code: String(selectedAddr.wardCode),
                    }
                );
                console.log("PAYLOAD SEND:", {
                    service_id: selectedServiceId,
                    to_district_id: selectedAddr.districtId,
                    to_ward_code: selectedAddr.wardCode,
                });
                console.log("TIME RESPONSE:", timeRes.data);
                console.log("LEADTIME:", timeRes.data.data?.leadtime);

                const today = new Date();

                const formatDate = (date: Date) =>
                    `${date.getDate().toString().padStart(2, '0')}/${(
                        date.getMonth() + 1
                    )
                        .toString()
                        .padStart(2, '0')}/${date.getFullYear()}`;

                const fallbackDate = new Date(today);
                fallbackDate.setDate(today.getDate() + 3);

                if (timeRes.data.code === 200 && timeRes.data.data) {
                    const leadtimeData = timeRes.data.data;
                    
                    // Ưu tiên sử dụng khoảng thời gian từ GHN trả về nếu có
                    if (leadtimeData.leadtime_order?.from_estimate_date && leadtimeData.leadtime_order?.to_estimate_date) {
                        const fromDate = new Date(leadtimeData.leadtime_order.from_estimate_date);
                        let toDate = new Date(leadtimeData.leadtime_order.to_estimate_date);
                        
                        const fromStr = formatDate(fromDate);
                        let toStr = formatDate(toDate);
                        
                        if (fromStr === toStr) {
                            toDate.setDate(toDate.getDate() + 1);
                            toStr = formatDate(toDate);
                        }
                        
                        setEstimatedDelivery(`${fromStr} - ${toStr}`);
                        setEstimatedDateFrom(fromDate);
                        setEstimatedDateTo(toDate);
                    } 
                    // Fallback tính từ leadtime timestamp
                    else if (leadtimeData.leadtime && leadtimeData.leadtime > 0) {
                        const leadtimeDate = new Date(leadtimeData.leadtime * 1000);
                        if (leadtimeDate.getTime() >= today.getTime()) {
                            // Tạo ngày bắt đầu giao (thường là sát ngày leadtime)
                            let fromDate = new Date(leadtimeDate);
                            fromDate.setDate(leadtimeDate.getDate() - 1);
                            
                            if(fromDate.getTime() < today.getTime()) {
                                fromDate = new Date(today);
                            }
                            
                            let toDate = new Date(leadtimeDate);
                            const fromStr = formatDate(fromDate);
                            let toStr = formatDate(toDate);
                            
                            if (fromStr === toStr) {
                                toDate.setDate(toDate.getDate() + 1);
                                toStr = formatDate(toDate);
                            }
                            
                            setEstimatedDelivery(`${fromStr} - ${toStr}`);
                            setEstimatedDateFrom(fromDate);
                            setEstimatedDateTo(toDate);
                        } else {
                            setEstimatedDelivery(`${formatDate(today)} - ${formatDate(fallbackDate)}`);
                            setEstimatedDateFrom(today);
                            setEstimatedDateTo(fallbackDate);
                        }
                    } else {
                        setEstimatedDelivery(`${formatDate(today)} - ${formatDate(fallbackDate)}`);
                        setEstimatedDateFrom(today);
                        setEstimatedDateTo(fallbackDate);
                    }
                } else {
                    setEstimatedDelivery(
                        `${formatDate(today)} - ${formatDate(fallbackDate)}`
                    );
                    setEstimatedDateFrom(today);
                    setEstimatedDateTo(fallbackDate);
                }
            } catch (error: any) {
                console.error(
                    "Lỗi tính phí ship qua GHN:",
                    error.response?.data ? JSON.stringify(error.response.data) : error.message
                );

                setApiShippingFee(0);
                setEstimatedDelivery("Lỗi kết nối đơn vị vận chuyển");
            } finally {
                setIsCalculatingFee(false);
            }
        };

        fetchShippingFee();
    }, [cartItems, shippingAddress, addresses, selectedServiceId, activeDistrictId]);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price || item.product?.price || 0) * item.quantity, 0);
    const shippingFee = apiShippingFee ?? 0;

    const total = Math.max(0, subtotal + shippingFee - productDiscount - shippingDiscount);

    const showToast = (icon: 'success' | 'error' | 'warning', title: string) => {
        Toast.fire({ icon, title });
    };

    const handlePlaceOrder = async () => {
        if (!shippingAddress || shippingAddress === "home") {
            showToast('warning', 'Vui lòng chọn địa chỉ giao hàng');
            return;
        }
        if (!selectedServiceId) {
            showToast('warning', 'Vui lòng chờ tính phí vận chuyển');
            return;
        }

        const validCartItemIds = cartItems.filter(item => item.id !== 'buy-now').map(item => item.id);

        const promotionCodes = [];
        if (productPromoCode) promotionCodes.push(productPromoCode);
        if (shippingPromoCode) promotionCodes.push(shippingPromoCode);

        // Gom toàn bộ thông tin đơn hàng
        const orderPayload = {
            items: cartItems.map(item => ({
                productId: item.productId || item.product?.id,
                quantity: item.quantity
            })),
            cartItemId: validCartItemIds.length > 0 ? validCartItemIds : null,
            addressId: Number(shippingAddress),
            shippingFee: apiShippingFee,
            discountAmount: productDiscount,
            paymentMethod: paymentMethod.toUpperCase(),
            promotionCode: promotionCodes.length > 0 ? promotionCodes.join(',') : null,
            note: note.trim(),
            estimatedDeliveryTimeFrom: estimatedDateFrom ? estimatedDateFrom.toISOString() : null,
            estimatedDeliveryTimeTo: estimatedDateTo ? estimatedDateTo.toISOString() : null
        };

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:8080/api/orders", orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Nếu khách chọn thanh toán VNPAY, lấy URL từ backend trả về và chuyển hướng sang cổng thanh toán
            if (paymentMethod === "vnpay" && response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
                return;
            }

            // Báo cho Navbar (Header) biết để cập nhật lại số lượng icon giỏ hàng
            window.dispatchEvent(new Event("cartUpdated"));

            // Nếu là COD thì báo thành công và chuyển trang
            showToast('success', 'Đặt hàng thành công!');
            setTimeout(() => navigate('/success', { state: { order: response.data } }), 1500);
        } catch (error: any) {
            console.error("Lỗi khi đặt hàng:", error);
            showToast('error', error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#F8F9F5] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Back to Cart Link */}
                    <div className="mb-8">
                        <Link to="/cart" className="inline-flex items-center gap-2 text-primary font-bold group">
                            <span className="material-symbols-outlined text-primary transition-transform group-hover:-translate-x-1">
                                arrow_back
                            </span>
                            <span>Quay lại giỏ hàng</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Side: Shipping & Payment */}
                        <div className="lg:col-span-7 space-y-8">

                            {/* 1. Shipping Address */}
                            <CheckoutAddress
                                shippingAddress={shippingAddress}
                                setShippingAddress={setShippingAddress}
                                addresses={addresses}
                                setAddresses={setAddresses}
                                showToast={showToast}
                            />

                            {/* 2 & 3. Shipping & Payment Method */}
                            <CheckoutShippingPayment
                                shippingServices={shippingServices}
                                selectedServiceId={selectedServiceId}
                                setSelectedServiceId={setSelectedServiceId}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                apiShippingFee={apiShippingFee}
                                estimatedDelivery={estimatedDelivery}
                                isCalculatingFee={isCalculatingFee}
                            />
                        </div>

                        {/* Right Side: Order Summary */}
                        <div className="lg:col-span-5">
                            <CheckoutSummary
                                cartItems={cartItems}
                                subtotal={subtotal}
                                shippingFee={shippingFee}
                                productDiscount={productDiscount}
                                shippingDiscount={shippingDiscount}
                                total={total}
                                productPromoCode={productPromoCode}
                                shippingPromoCode={shippingPromoCode}
                                setProductPromoCode={setProductPromoCode}
                                setShippingPromoCode={setShippingPromoCode}
                                setProductDiscount={setProductDiscount}
                                setShippingDiscount={setShippingDiscount}
                                showToast={showToast}
                                isOrderDisabled={shippingServices.length === 0 || isCalculatingFee}
                                onPlaceOrder={handlePlaceOrder}
                                note={note}
                                setNote={setNote}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}