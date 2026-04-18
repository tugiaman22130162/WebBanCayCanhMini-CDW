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

        {/* ADMIN */}
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/products" element={<ProductManagement />} />
      </Routes>
    </BrowserRouter>
  )
}