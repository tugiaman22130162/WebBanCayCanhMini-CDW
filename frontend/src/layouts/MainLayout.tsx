import { ReactNode } from "react"
import Header from "../components/user/Header"
import Footer from "../components/user/Footer"

type Props = {
    children: ReactNode
}

export default function MainLayout({ children }: Props) {
    return (
        <div className="bg-background text-[#1f1b17] min-h-screen">
            <Header />
            <main className="pt-16">{children}</main>
            <Footer />
        </div>
    )
}