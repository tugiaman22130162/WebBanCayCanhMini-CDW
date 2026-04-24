import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Products from "./pages/Products"
import Register from "./pages/Register"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import ProductFavorite from "./pages/ProductFavorite"
import SellerProduct from "./pages/SellerProduct"
import NewsArrivalProduct from "./pages/NewsArrivalProduct"
import UserManagement from "./pages/admin/pages/UserManagement"
import ProductManagement from "./pages/admin/pages/ProductManagement"
import OrderManagement from "./pages/admin/pages/OrderManagement"
import PromotionManagement from "./pages/admin/pages/PromotionManagement"
import Dashboard from "./pages/admin/pages/Dashboard"
import CategoryManagement from "./pages/admin/pages/CategoryManagement"
import CancelPayment from "./pages/CancelPayment"
import SuccessPayment from "./pages/SuccessPayment"
import Checkout from "./pages/Checkout"
import Cart from "./pages/Cart"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* USER */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/favorites" element={<ProductFavorite />} />
        <Route path="/best-sellers" element={<SellerProduct />} />
        <Route path="/new-arrivals" element={<NewsArrivalProduct />} />
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/checkout" element={<Checkout />}/>
        <Route path="/success" element={<SuccessPayment />} />
        <Route path="/cancel" element={<CancelPayment />} />

        {/* ADMIN */}
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/products" element={<ProductManagement />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
        <Route path="/admin/categories" element={<CategoryManagement />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/promotions" element={<PromotionManagement />} />
      </Routes>
    </BrowserRouter>
  )
}