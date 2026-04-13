import MainLayout from "../layouts/MainLayout"
import Hero from "../components/Hero"
import Categories from "../components/Categories"
import Blog from "../components/Blog"
import NewArrivals from "../components/NewsArrival"
import SellerProducts from "../components/SellerProducts"
import ChatbotWidget from "../components/ChatbotWidget"

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