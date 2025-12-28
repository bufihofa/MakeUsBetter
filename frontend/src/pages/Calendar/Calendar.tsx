import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmotionCalendar } from '../../components/EmotionCalendar';
import { emotionApi } from '../../services/api';
import storage from '../../services/storage';
import { EmotionDay } from '../../types';
import './Calendar.css';

export default function Calendar() {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [emotions, setEmotions] = useState<EmotionDay[]>([]);
    const [loading, setLoading] = useState(true);

    const partnerId = storage.getPartnerId();
    const partnerName = storage.getPartnerName() || 'Người yêu';

    useEffect(() => {
        if (!partnerId) {
            setLoading(false);
            return;
        }

        const fetchCalendarData = async () => {
            setLoading(true);
            try {
                const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
                const response = await emotionApi.getCalendar(partnerId, monthStr);
                setEmotions(response.data.emotions || []);
            } catch (error) {
                console.error('Failed to fetch calendar data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCalendarData();
    }, [partnerId, currentMonth]);

    if (!partnerId) {
        return (
            <div className="calendar-page">
                <header className="calendar-header">
                    <button className="back-btn" onClick={() => navigate('/home')}>
                        ← Quay lại
                    </button>
                    <h1>Lịch cảm xúc</h1>
                </header>
                <div className="no-partner">
                    <span>😕</span>
                    <p>Bạn cần ghép cặp để xem lịch sử cảm xúc</p>
                    <button onClick={() => navigate('/home')}>Về trang chủ</button>
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-page">
            <header className="calendar-header">
                <button className="back-btn" onClick={() => navigate('/home')}>
                    ←
                </button>
                <h1>Lịch cảm xúc</h1>
                <div className="header-spacer" />
            </header>

            {loading ? (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải...</p>
                </div>
            ) : (
                <EmotionCalendar
                    emotions={emotions}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    partnerName={partnerName}
                />
            )}

            <nav className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/home')}>
                    <span className="nav-icon">💕</span>
                    <span>Cảm xúc</span>
                </button>
                <button className="nav-item active">
                    <span className="nav-icon">📅</span>
                    <span>Lịch sử</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/profile')}>
                    <span className="nav-icon">👤</span>
                    <span>Cài đặt</span>
                </button>
            </nav>
        </div>
    );
}
