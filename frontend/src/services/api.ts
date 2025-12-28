import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;

// ============ Pair API ============
export const pairApi = {
    create: (name: string) =>
        api.post('/pair/create', { name }),

    join: (pairCode: string, name: string) =>
        api.post('/pair/join', { pairCode, name }),

    getPartner: () =>
        api.get('/pair/partner'),
};

// ============ Emotion API ============
export const emotionApi = {
    create: (emotionType: string, intensity?: number, context?: string) =>
        api.post('/emotions', { emotionType, intensity, context }),

    getCalendar: (partnerId: string, month: string) =>
        api.get('/emotions/calendar', { params: { partnerId, month } }),

    getToday: (partnerId: string) =>
        api.get('/emotions/today', { params: { partnerId } }),
};

// ============ User API ============
export const userApi = {
    updateFcmToken: (fcmToken: string) =>
        api.put('/user/fcm-token', { fcmToken }),

    getProfile: () =>
        api.get('/user/profile'),
};
