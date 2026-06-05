import { useEffect } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/user/Home"
import Products from "./pages/user/Products"
import Register from "./pages/user/Register"
import Login from "./pages/user/Login"
import ForgotPassword from "./pages/user/ForgotPassword"
import ResetPassword from "./pages/user/ResetPassword"
import ProductFavorite from "./pages/user/ProductFavorite"
import SellerProductList from "./pages/user/SellerProductList"
import NewsArrivalProduct from "./pages/user/NewsArrivalProduct"
import UserManagement from "./pages/admin/UserManagement"
import ProductManagement from "./pages/admin/ProductManagement"
import OrderManagement from "./pages/admin/OrderManagement"
import PromotionManagement from "./pages/admin/PromotionManagement"
import Dashboard from "./pages/admin/Dashboard"
import CategoryManagement from "./pages/admin/CategoryManagement"
import CancelPayment from "./pages/user/CancelPayment"
import SuccessPayment from "./pages/user/SuccessPayment"
import Checkout from "./pages/user/Checkout"
import Cart from "./pages/user/Cart"
import PaymentManagement from "./pages/admin/PaymentManagement"
import TerrariumBuilder from "./pages/user/TerrariumBuilder"
import About from "./pages/user/About"
import CareInstruction from "./pages/user/CareInstruction"
import Profile from "./pages/user/Profile"
import ProductDetail from "./pages/user/ProductDetail"
import TermsOfService from "./pages/user/TermsOfService"
import ShippingPolicy from "./pages/user/ShippingPolicy"
import NewsDetail from "./pages/user/NewsDetail"
import AdminProfile from "./pages/admin/AdminProfile"
import { AuthProvider } from "../src/context/AuthContext"
import OAuth2Success from "./pages/user/OAuth2Success"
import BlogManagement from "./pages/admin/BlogManagement"
import ReviewManagement from "./pages/admin/ReviewManagement"
import News from "./pages/user/News"
import TerrariumManagement from "./pages/admin/TerrariumManagement"

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* USER */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/favorites" element={<ProductFavorite />} />
          <Route path="/best-sellers" element={<SellerProductList />} />
          <Route path="/new-arrivals" element={<NewsArrivalProduct />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<SuccessPayment />} />
          <Route path="/cancel" element={<CancelPayment />} />
          <Route path="/builder" element={<TerrariumBuilder />} />
          <Route path="/about" element={<About />} />
          <Route path="/care-instruction" element={<CareInstruction />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:tab" element={<Profile />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/oauth2/success" element={<OAuth2Success />} />
          <Route path="/news" element={<News />} />

          {/* ADMIN */}
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/promotions" element={<PromotionManagement />} />
          <Route path="/admin/payments" element={<PaymentManagement />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/reviews" element={<ReviewManagement />} />
          <Route path="/admin/blogs" element={<BlogManagement />} />
          <Route path="/admin/terrariums" element={<TerrariumManagement />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}