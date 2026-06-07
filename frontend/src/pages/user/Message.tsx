import React, { useState, useEffect } from 'react';
import Header from "../../components/user/Header";
import { useAuth } from "../../context/AuthContext";
import Swal from 'sweetalert2';
import axios from 'axios';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatHeader from '../../components/chat/ChatHeader';
import useChatWebSocket from '../../hooks/useChatWebSocket';
import MessageList from '../../components/chat/MessageList';
import MessageInputArea from '../../components/chat/MessageInputArea';

export default function Message() {
    const { user, isLoggedIn, isLoading } = useAuth();

    const {
        conversations, messages, setMessages,
        activeConversationId, setActiveConversationId, isTyping
    } = useChatWebSocket(user, isLoggedIn);

    const [inputText, setInputText] = useState('');
    const [searchMessageTerm, setSearchMessageTerm] = useState('');
    const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);
    const [moreMenuOpenId, setMoreMenuOpenId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [replyingMessageId, setReplyingMessageId] = useState<number | null>(null);
 
    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để sử dụng tính năng nhắn tin!',
                confirmButtonText: 'Đăng nhập ngay',
                showCancelButton: true,
                cancelButtonText: 'Ở lại xem',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    cancelButton: 'bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    popup: 'bg-surface rounded-xl shadow-2xl border border-outline-variant',
                    title: 'text-primary font-bold text-2xl',
                    htmlContainer: 'text-on-surface-variant font-medium'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                }
            });
        }
    }, [isLoggedIn, isLoading]);

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
        await axios.post(`http://localhost:8080/api/messages/conversation/${activeConversationId}/typing`, { isTyping: isTypingStatus }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
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

    const handleSendOrder = async () => {
        if (!activeConversationId) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get("http://localhost:8080/api/orders/my-orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const myOrders = res.data;
            
            if (myOrders.length === 0) {
                Swal.fire({
                    title: 'Không có đơn hàng',
                    text: 'Bạn chưa có đơn hàng nào để gửi.',
                    icon: 'info',
                    confirmButtonText: 'Đóng',
                    customClass: { confirmButton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#2f5146]' },
                    buttonsStyling: false
                });
                return;
            }

            const inputOptions: Record<string, string> = {};
            myOrders.forEach((o: any) => {
                const statusStr = o.status === 'PENDING' ? 'Chờ xác nhận' : o.status === 'CONFIRMED' ? 'Đã xác nhận' : o.status === 'SHIPPING' ? 'Đang giao' : o.status === 'DELIVERED' ? 'Đã giao' : 'Đã hủy';
                inputOptions[o.id] = `${o.orderCode} - ${o.totalPrice.toLocaleString('vi-VN')}đ (${statusStr})`;
            });

            const { value: orderId } = await Swal.fire({
                title: 'Chọn đơn hàng để gửi',
                input: 'select',
                inputOptions: inputOptions,
                inputPlaceholder: '-- Chọn đơn hàng của bạn --',
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
            console.error("Lỗi lấy danh sách hoặc gửi đơn hàng", error);
        }
    };

    if (isLoading) {
        return <div className="bg-[#F8F9F5] h-screen flex flex-col font-body overflow-hidden"><Header /></div>;
    }

    return (
        <div className="bg-[#F8F9F5] h-screen flex flex-col font-body overflow-hidden">
            <Header />
            <main className="flex-1 pt-[85px] pb-6 px-4 sm:px-6 lg:px-8 flex justify-center overflow-hidden">
                <div className="w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-100 flex overflow-hidden h-full">
                    <ChatSidebar 
                        conversations={conversations} 
                        activeConversationId={activeConversationId} 
                        onSelectConversation={setActiveConversationId} 
                        isAdmin={false} 
                    />

                    <div className="flex-1 flex flex-col h-full bg-white relative">
                        <ChatHeader 
                            searchMessageTerm={searchMessageTerm} 
                            setSearchMessageTerm={setSearchMessageTerm} 
                            isAdmin={false} 
                        />

                        <MessageList 
                            messages={messages} searchMessageTerm={searchMessageTerm} isTyping={isTyping}
                            actionMenuOpenId={actionMenuOpenId} setActionMenuOpenId={setActionMenuOpenId}
                            moreMenuOpenId={moreMenuOpenId} setMoreMenuOpenId={setMoreMenuOpenId}
                            onReact={handleReact} onReply={(id) => setReplyingMessageId(id)}
                            onEdit={(id, text) => { setEditingMessageId(id); setInputText(text); setReplyingMessageId(null); setMoreMenuOpenId(null); }}
                            onDelete={handleDelete} onRevoke={handleRevoke}
                        />

                        <MessageInputArea 
                            isLoggedIn={isLoggedIn} inputText={inputText} setInputText={setInputText}
                            replyingMessageId={replyingMessageId} editingMessageId={editingMessageId}
                            messages={messages}
                            onCancelReply={() => setReplyingMessageId(null)} onCancelEdit={() => { setEditingMessageId(null); setInputText(''); }}
                            onSendMessage={handleSendMessage} onSendSticker={handleSendSticker} onSendImage={handleSendImage}
                            onSendOrder={handleSendOrder}
                            sendTypingStatus={sendTypingStatus}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}