import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-header-footer backdrop-blur-md">
            <nav className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto font-['Plus_Jakarta_Sans'] tracking-tight">

                {/* Logo */}
                <Link
                    to="/"
                    // className="text-2xl font-bold text-white tracking-tighter hover:opacity-80 transition"

                    className="text-2xl font-bold bg-gradient-to-r from-green-300 to-lime-200 bg-clip-text text-transparent tracking-tighter hover:opacity-80 transition"
                >
                    MiniGarden
                </Link>

                {/* Icons */}
                <div className="flex items-center space-x-6">
                    <Link to="/favorites" className="material-symbols-outlined text-white hover:text-red-500 transition-all active:scale-95 block">
                        favorite
                    </Link>

                    <button className="material-symbols-outlined text-white hover:text-green-100 transition-all active:scale-95">
                        shopping_cart
                    </button>

                    <button className="material-symbols-outlined text-white hover:text-green-100 transition-all active:scale-95">
                        account_circle
                    </button>
                </div>
            </nav>
        </header>
    );
}