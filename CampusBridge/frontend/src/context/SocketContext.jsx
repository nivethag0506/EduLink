import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (user?.token) {
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const s = io(backendUrl, {
                auth: { token: user.token },
            });

            s.on('connect', () => {
                console.log('Socket connected');
            });

            s.on('onlineUsers', (users) => {
                setOnlineUsers(users);
            });

            setSocket(s);

            return () => {
                s.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
