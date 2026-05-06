import MainLayout from "../../layouts/MainLayout"
import Hero from "../../components/user/Hero"
import Categories from "../../components/user/Categories"
import Blog from "../../components/user/Blog"
import NewArrivals from "../../components/user/NewsArrival"
import SellerProducts from "../../components/user/SellerProducts"
import ChatbotWidget from "../../components/user/ChatbotWidget"

export default function Home() {
  return (
    <MainLayout>
      <Hero />
      <Categories />
      <SellerProducts />
      <NewArrivals />
      <Blog />
      <ChatbotWidget />
    </MainLayout>
  )
}