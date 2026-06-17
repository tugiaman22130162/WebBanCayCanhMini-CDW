import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho người dùng
export interface User {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
    role: string;
    phoneNumber?: string;
    address?: string;
}

// Định nghĩa kiểu dữ liệu cho AuthContext
interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: (redirectPath?: string) => void;
    updateUser: (user: User) => void;
}

// Tạo AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
    }
    return context;
};

// AuthProvider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!token);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Effect để kiểm tra token và fetch thông tin người dùng
    useEffect(() => {
        const validateTokenAndFetchUser = async () => {
            if (token) {
                try {
                    // Fetch thông tin user từ backend để xác thực token
                    const response = await axios.get('http://localhost:8080/api/users/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data);
                    setIsLoggedIn(true);
                } catch (error) {
                    console.error('Token không hợp lệ hoặc đã hết hạn:', error);
                    // Token không hợp lệ, xóa token và đăng xuất
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } else {
                setIsLoggedIn(false);
            }
            setIsLoading(false); // Kết thúc trạng thái loading
        };

        validateTokenAndFetchUser();
    }, [token]);

    // Hàm xử lý đăng nhập
    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        setIsLoggedIn(true);
        setIsLoading(false);
    };

    // Hàm xử lý đăng xuất
    const logout = (redirectPath: string = '/') => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
        window.location.href = redirectPath;
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoggedIn, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};