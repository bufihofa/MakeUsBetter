export interface User {
    id: string;
    name: string;
    isCreator: boolean;
    isPaired: boolean;
    createdAt: string;
}

export interface Partner {
    partnerId: string | null;
    partnerName: string | null;
    isPaired: boolean;
    pairedAt: string;
}

export interface CreatePairResponse {
    pairCode: string;
    userId: string;
    token: string;
}

export interface JoinPairResponse {
    userId: string;
    partnerId: string;
    partnerName: string;
    token: string;
}

export type EmotionType =
    | 'joy'
    | 'trust'
    | 'fear'
    | 'surprise'
    | 'sadness'
    | 'disgust'
    | 'anger'
    | 'anticipation';

export interface Emotion {
    id: string;
    type: EmotionType;
    intensity: number;
    textMessage?: string;
    voiceUrl?: string;
    time: string;
    createdAt: string;
}

export interface EmotionDay {
    date: string;
    emotions: {
        type: EmotionType;
        time: string;
        intensity: number;
        textMessage?: string;
        voiceUrl?: string;
    }[];
}

export interface CalendarResponse {
    emotions: EmotionDay[];
}

export interface EmotionInfo {
    type: EmotionType;
    name: string;
    nameVi: string;
    emoji: string;
    color: string;
}

export const EMOTIONS: EmotionInfo[] = [
    { type: 'joy', name: 'Joy', nameVi: 'Vui vẻ', emoji: '😊', color: '#FFD700' },
    { type: 'trust', name: 'Trust', nameVi: 'Tin tưởng', emoji: '🤝', color: '#98FB98' },
    { type: 'fear', name: 'Fear', nameVi: 'Sợ hãi', emoji: '😨', color: '#32CD32' },
    { type: 'surprise', name: 'Surprise', nameVi: 'Ngạc nhiên', emoji: '😲', color: '#00BFFF' },
    { type: 'sadness', name: 'Sadness', nameVi: 'Buồn bã', emoji: '😢', color: '#4169E1' },
    { type: 'disgust', name: 'Disgust', nameVi: 'Khó chịu', emoji: '🤢', color: '#9370DB' },
    { type: 'anger', name: 'Anger', nameVi: 'Tức giận', emoji: '😠', color: '#FF4500' },
    { type: 'anticipation', name: 'Anticipation', nameVi: 'Mong đợi', emoji: '🤩', color: '#FFA500' },
];

export function getEmotionInfo(type: EmotionType): EmotionInfo {
    return EMOTIONS.find(e => e.type === type) || EMOTIONS[0];
}
