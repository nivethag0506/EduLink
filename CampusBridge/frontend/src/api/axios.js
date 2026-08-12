import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('campusBridgeUser') || 'null');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('campusBridgeUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
