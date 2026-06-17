import React, { useState, useEffect } from 'react';
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import Swal from 'sweetalert2';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatHeader from '../../components/chat/ChatHeader';
import useAdminChatWebSocket from '../../hooks/useAdminChatWebSocket';
import MessageList from '../../components/chat/MessageList';
import MessageInputArea from '../../components/chat/MessageInputArea';

export default function AdminMessage() {
    const { user } = useAuth();
    const {
        conversations, setConversations, messages, setMessages,
        activeConversationId, setActiveConversationId, isTyping, handleSelectConversation
    } = useAdminChatWebSocket(user);

    const [inputText, setInputText] = useState('');
    const [searchMessageTerm, setSearchMessageTerm] = useState('');
    const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);
    const [moreMenuOpenId, setMoreMenuOpenId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [replyingMessageId, setReplyingMessageId] = useState<number | null>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get("http://localhost:8080/api/users", { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setAllUsers(res.data))
                .catch(err => console.error("Lỗi lấy danh sách user:", err));
        }
    }, []);

    const handleReact = async (id: number, emoji?: string) => {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, reaction: emoji } : msg));
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/messages/${id}/react`,
                { reaction: emoji || null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Lỗi khi thả cảm xúc:", error);
        }
    };

    const handleRevoke = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/messages/${id}/revoke`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Lỗi thu hồi tin nhắn", error);
        }
    };

    const handleDelete = (id: number) => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    };

    const sendTypingStatus = async (isTypingStatus: boolean) => {
        if (!activeConversationId) return;
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:8080/api/messages/conversation/${activeConversationId}/typing`, { isTyping: isTypingStatus }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => { });
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !activeConversationId) return;

        const token = localStorage.getItem('token');
        const textToSend = inputText;

        if (editingMessageId) {
            try {
                await axios.put(`http://localhost:8080/api/messages/${editingMessageId}`,
                    { content: textToSend },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEditingMessageId(null);
                setInputText('');
            } catch (error) {
                console.error("Lỗi sửa tin nhắn", error);
            }
            return;
        }

        setInputText('');
        const replyTo = replyingMessageId;
        setReplyingMessageId(null);
        setActionMenuOpenId(null);

        try {
            await axios.post('http://localhost:8080/api/messages', {
                conversationId: activeConversationId,
                content: textToSend,
                replyToMessageId: replyTo || null
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error("Lỗi gửi tin nhắn", error);
        }
    };

    const handleSendSticker = async (stickerUrl: string) => {
        if (!activeConversationId) return;
        const token = localStorage.getItem('token');
        const replyTo = replyingMessageId;
        setReplyingMessageId(null);
        setActionMenuOpenId(null);

        try {
            await axios.post('http://localhost:8080/api/messages', {
                conversationId: activeConversationId,
                content: stickerUrl,
                type: 'STICKER',
                replyToMessageId: replyTo || null
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error("Lỗi gửi sticker", error);
        }
    };

    const handleSendImage = async (file: File) => {
        if (!activeConversationId) return;
        const token = localStorage.getItem('token');
        const replyTo = replyingMessageId;
        setReplyingMessageId(null);
        setActionMenuOpenId(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', activeConversationId.toString());
        if (replyTo) formData.append('replyToMessageId', replyTo.toString());

        try {
            await axios.post('http://localhost:8080/api/messages/send-image', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
        } catch (error) {
            console.error("Lỗi gửi ảnh", error);
        }
    };

    const handleSendLocation = async (lat: number, lng: number) => {
        if (!activeConversationId) return;
        const token = localStorage.getItem('token');
        const replyTo = replyingMessageId;
        setReplyingMessageId(null);
        setActionMenuOpenId(null);

        try {
            await axios.post('http://localhost:8080/api/messages', {
                conversationId: activeConversationId,
                content: `${lat},${lng}`,
                type: 'LOCATION',
                replyToMessageId: replyTo || null
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error("Lỗi gửi vị trí", error);
        }
    };

    const handleSendOrder = async () => {
        if (!activeConversationId) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get("http://localhost:8080/api/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allOrders = res.data;

            if (allOrders.length === 0) {
                Swal.fire({
                    title: 'Không có đơn hàng',
                    text: 'Hệ thống chưa có đơn hàng nào.',
                    icon: 'info',
                    confirmButtonText: 'Đóng',
                    customClass: { confirmButton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#2f5146]' },
                    buttonsStyling: false
                });
                return;
            }

            const inputOptions: Record<string, string> = {};
            allOrders.slice(0, 50).forEach((o: any) => {
                const statusStr = o.status === 'PENDING' ? 'Chờ xác nhận' : o.status === 'CONFIRMED' ? 'Đã xác nhận' : o.status === 'SHIPPING' ? 'Đang giao' : o.status === 'DELIVERED' ? 'Đã giao' : 'Đã hủy';
                inputOptions[o.id] = `${o.orderCode} - Khách: ${o.receiverName} (${statusStr})`;
            });

            const { value: orderId } = await Swal.fire({
                title: 'Chọn đơn hàng để gửi',
                input: 'select',
                inputOptions: inputOptions,
                inputPlaceholder: '-- Chọn đơn (50 đơn gần nhất) --',
                showCancelButton: true,
                confirmButtonText: 'Gửi',
                cancelButtonText: 'Hủy',
                customClass: {
                    confirmButton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-bold mx-2 hover:bg-[#2f5146]',
                    cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-2 hover:bg-gray-300',
                    input: 'px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm'
                },
                buttonsStyling: false,
                inputValidator: (value) => {
                    return new Promise((resolve) => {
                        if (value) {
                            resolve(null);
                        } else {
                            resolve('Vui lòng chọn một đơn hàng!');
                        }
                    });
                }
            });

            if (orderId) {
                const formData = new FormData();
                formData.append('conversationId', activeConversationId.toString());
                formData.append('referenceId', orderId);
                await axios.post('http://localhost:8080/api/messages/send-order', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Lỗi gửi đơn hàng", error);
        }
    };

    const handleDeleteConversation = async () => {
        if (!activeConversationId) return;
        const result = await Swal.fire({
            title: 'Xóa đoạn chat?',
            text: "Hành động này sẽ xóa toàn bộ tin nhắn. Bạn có chắc chắn không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 hover:bg-red-600',
                cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-2 hover:bg-gray-300'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8080/api/conversations/${activeConversationId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (setConversations) setConversations((prev: any[]) => prev.filter(c => c.id !== activeConversationId));

                if (setActiveConversationId) {
                    setActiveConversationId(null);
                } else {
                    handleSelectConversation(null as any);
                }
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể xóa đoạn chat này. Vui lòng thử lại sau!', 'error');
            }
        }
    };

    const handleDeleteSuccess = (id: number) => {
        if (setConversations) setConversations((prev: any[]) => prev.filter(c => c.id !== id));
        if (activeConversationId === id) {
            if (setActiveConversationId) setActiveConversationId(null);
            else handleSelectConversation(null as any);
        }
    };

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    let activeName = activeConversation?.name || (activeConversation as any)?.customerName;
    let activeAvatar = activeConversation?.avatar || (activeConversation as any)?.customerAvatar;
    if (!activeName && activeConversation && allUsers.length > 0) {
        const customer = allUsers.find(u => u.id === (activeConversation as any).customerId || u.id === (activeConversation as any).customer_id);
        if (customer) {
            activeName = customer.fullName;
            activeAvatar = customer.avatar;
        }
    }

    return (
        <div className="flex bg-[#F8F9F5] min-h-screen font-body">
            <AdminSidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <AdminHeader />
                <main className="flex-1 p-6 overflow-hidden flex justify-center">
                    <div className="w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-100 flex overflow-hidden h-full">
                        <ChatSidebar
                            conversations={conversations}
                            activeConversationId={activeConversationId}
                            onSelectConversation={handleSelectConversation}
                            isAdmin={true}
                            activeMessages={messages}
                            onDeleteSuccess={handleDeleteSuccess}
                            onConversationCreated={(newConv) => {
                                if (setConversations) {
                                    setConversations((prev: any[]) => {
                                        if (prev.find(c => c.id === newConv.id)) return prev;
                                        return [newConv, ...prev];
                                    });
                                }
                            }}
                        />

                        <div className="flex-1 flex flex-col h-full bg-white relative">

                            {activeConversationId ? (
                                <>

                                    <ChatHeader
                                        
                                        avatar={activeAvatar}
                                        name={activeName}
                                        isOnline={(activeConversation as any)?.isOnline}
                                        searchMessageTerm={searchMessageTerm}
                                        setSearchMessageTerm={setSearchMessageTerm}
                                        isAdmin={true}
                                        onDeleteChat={handleDeleteConversation}
                                    />

                                    <MessageList
                                        messages={messages} searchMessageTerm={searchMessageTerm} isTyping={isTyping}
                                        actionMenuOpenId={actionMenuOpenId} setActionMenuOpenId={setActionMenuOpenId}
                                        moreMenuOpenId={moreMenuOpenId} setMoreMenuOpenId={setMoreMenuOpenId}
                                        onReact={handleReact} onReply={(id) => setReplyingMessageId(id)}
                                        onEdit={(id, text) => { setEditingMessageId(id); setInputText(text); setReplyingMessageId(null); setMoreMenuOpenId(null); }}
                                        onDelete={handleDelete} onRevoke={handleRevoke}
                                        isAdmin={true} activeConversationAvatar={activeAvatar} activeConversationName={activeName}
                                    />

                                    <MessageInputArea
                                        isAdmin={true} activeConversationName={activeName}
                                        uploadId="admin-chat-image-upload" placeholder="Nhập phản hồi..."
                                        inputText={inputText} setInputText={setInputText}
                                        replyingMessageId={replyingMessageId} editingMessageId={editingMessageId}
                                        messages={messages}
                                        onCancelReply={() => setReplyingMessageId(null)} onCancelEdit={() => { setEditingMessageId(null); setInputText(''); }}
                                        onSendMessage={handleSendMessage} onSendSticker={handleSendSticker} onSendImage={handleSendImage}
                                        onSendOrder={handleSendOrder} onSendLocation={handleSendLocation}
                                        sendTypingStatus={sendTypingStatus}
                                    />
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">Chọn một khách hàng để bắt đầu trò chuyện</div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}