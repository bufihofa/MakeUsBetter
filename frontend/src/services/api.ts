import axios from 'axios';
import storage from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = storage.getToken();
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
            storage.clear();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;

// ============ Auth API ============
export const authApi = {
    register: (username: string, name: string, pin: string) =>
        api.post('/auth/register', { username, name, pin }),

    login: (username: string, pin: string) =>
        api.post('/auth/login', { username, pin }),
};

// ============ Pair API ============
export const pairApi = {
    create: () =>
        api.post('/pair/create'),

    join: (pairCode: string) =>
        api.post('/pair/join', { pairCode }),

    getPartner: () =>
        api.get('/pair/partner'),
};

// ============ Emotion API ============
export const emotionApi = {
    create: (emotionType: string, intensity?: number, textMessage?: string) =>
        api.post('/emotions', { emotionType, intensity, textMessage }),

    createWithVoice: (emotionType: string, intensity?: number, textMessage?: string, voiceBlob?: Blob) => {
        const formData = new FormData();
        formData.append('emotionType', emotionType);
        if (intensity) formData.append('intensity', intensity.toString());
        if (textMessage) formData.append('textMessage', textMessage);
        if (voiceBlob) formData.append('voice', voiceBlob, 'voice.webm');

        return api.post('/emotions/with-voice', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

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

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};
