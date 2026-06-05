import React, { useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TerrariumRequests from "../../components/admin/TerrariumRequests";
import TerrariumInventory from "../../components/admin/TerrariumInventory";

export default function TerrariumManagement() {
    const [activeTab, setActiveTab] = useState<'requests' | 'components'>('requests');
    const [addTrigger, setAddTrigger] = useState(0); // Để kích hoạt modal Thêm Nguyên Liệu
    
    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="p-8 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Terrarium</h2>
                        {activeTab === 'components' && (
                            <button onClick={() => setAddTrigger(prev => prev + 1)} className="px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-[#2f5146] transition">
                                Thêm Nguyên Liệu
                            </button>
                        )}
                    </div>

                    {/* TABS */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                        <button onClick={() => setActiveTab('requests')} className={`pb-3 px-4 font-bold text-lg border-b-2 transition-colors ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Yêu Cầu Thiết Kế
                        </button>
                        <button onClick={() => setActiveTab('components')} className={`pb-3 px-4 font-bold text-lg border-b-2 transition-colors ${activeTab === 'components' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Kho Nguyên Liệu
                        </button>
                    </div>

                    {/* NỘI DUNG TAB */}
                    {activeTab === 'requests' ? (
                        <TerrariumRequests />
                    ) : (
                        <TerrariumInventory addTrigger={addTrigger} />
                    )}
                </main>
            </div>
        </div>
    );
}