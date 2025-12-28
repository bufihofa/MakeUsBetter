import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmotionWheel } from '../../components/EmotionWheel';
import { emotionApi, pairApi } from '../../services/api';
import storage from '../../services/storage';
import { EmotionInfo, getEmotionInfo, Emotion, EmotionType } from '../../types';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const [partnerName, setPartnerName] = useState(storage.getPartnerName() || '');
    const [partnerId, setPartnerId] = useState(storage.getPartnerId() || '');
    const [isPaired, setIsPaired] = useState(false);
    const [todayEmotions, setTodayEmotions] = useState<Emotion[]>([]);
    const [sending, setSending] = useState(false);
    const [lastSent, setLastSent] = useState<{ emoji: string; name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch partner info
    useEffect(() => {
        const fetchPartner = async () => {
            try {
                const response = await pairApi.getPartner();
                const data = response.data;

                if (data.isPaired && data.partnerId) {
                    setIsPaired(true);
                    setPartnerId(data.partnerId);
                    setPartnerName(data.partnerName || 'Người yêu');
                    storage.setPartnerId(data.partnerId);
                    storage.setPartnerName(data.partnerName || '');
                }
            } catch (error) {
                console.error('Failed to fetch partner:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPartner();
    }, []);

    // Fetch today's emotions from partner
    useEffect(() => {
        if (!partnerId) return;

        const fetchTodayEmotions = async () => {
            try {
                const response = await emotionApi.getToday(partnerId);
                setTodayEmotions(response.data);
            } catch (error) {
                console.error('Failed to fetch today emotions:', error);
            }
        };

        fetchTodayEmotions();

        // Listen for real-time emotion updates
        const handleEmotionReceived = (event: CustomEvent) => {
            fetchTodayEmotions();
        };

        window.addEventListener('emotionReceived', handleEmotionReceived as EventListener);
        return () => {
            window.removeEventListener('emotionReceived', handleEmotionReceived as EventListener);
        };
    }, [partnerId]);

    const handleEmotionSelect = useCallback(async (emotion: EmotionInfo, intensity: number) => {
        setSending(true);
        setLastSent(null);

        try {
            await emotionApi.create(emotion.type, intensity);
            setLastSent({ emoji: emotion.emoji, name: emotion.nameVi });

            // Clear success message after 3 seconds
            setTimeout(() => setLastSent(null), 3000);
        } catch (error) {
            console.error('Failed to send emotion:', error);
            alert('Không thể gửi cảm xúc. Vui lòng thử lại.');
        } finally {
            setSending(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="home loading-screen">
                <div className="loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="home">
            <header className="home-header">
                <div className="user-info">
                    <span className="greeting">Xin chào, {storage.getUserName() || 'Bạn'}!</span>
                    {isPaired ? (
                        <span className="partner-status connected">
                            💕 Kết nối với {partnerName}
                        </span>
                    ) : (
                        <span className="partner-status waiting">
                            ⏳ Đang chờ ghép cặp...
                        </span>
                    )}
                </div>
                <button className="menu-btn" onClick={() => navigate('/profile')}>
                    ⚙️
                </button>
            </header>

            <main className="home-main">
                <div className="emotion-section">
                    <h2>Bạn đang cảm thấy thế nào?</h2>
                    <p>Chọn cảm xúc để chia sẻ với {partnerName || 'người yêu'}</p>

                    <EmotionWheel
                        onSelect={handleEmotionSelect}
                        disabled={sending || !isPaired}
                    />

                    {!isPaired && (
                        <div className="pairing-hint">
                            <p>Bạn cần ghép cặp trước khi có thể chia sẻ cảm xúc</p>
                            <p className="pair-code">Mã của bạn: <strong>{storage.getPairCode()}</strong></p>
                        </div>
                    )}

                    {lastSent && (
                        <div className="success-toast">
                            <span>{lastSent.emoji}</span>
                            <span>Đã gửi "{lastSent.name}" thành công!</span>
                        </div>
                    )}
                </div>

                {isPaired && todayEmotions.length > 0 && (
                    <div className="partner-emotions">
                        <h3>Cảm xúc hôm nay của {partnerName}</h3>
                        <div className="emotion-timeline">
                            {todayEmotions.map((emotion, index) => {
                                const info = getEmotionInfo(emotion.type);
                                return (
                                    <div key={index} className="timeline-item">
                                        <span className="time">{emotion.time}</span>
                                        <span className="emoji">{info.emoji}</span>
                                        <span className="intensity" style={{ color: info.color }}>
                                            {emotion.intensity}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            <nav className="bottom-nav">
                <button className="nav-item active">
                    <span className="nav-icon">💕</span>
                    <span>Cảm xúc</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/calendar')}>
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
