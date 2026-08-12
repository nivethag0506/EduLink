import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('campusBridgeUser');
        return u ? JSON.parse(u) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('campusBridgeUser', JSON.stringify(data));
            setUser(data);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Do NOT log the user in immediately since they need verification
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('campusBridgeUser');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
