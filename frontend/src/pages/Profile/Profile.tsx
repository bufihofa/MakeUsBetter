import { useNavigate } from 'react-router-dom';
import storage from '../../services/storage';
import './Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const userName = storage.getUserName() || 'Bạn';
    const partnerName = storage.getPartnerName();
    const pairCode = storage.getPairCode();

    const handleLogout = () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            storage.clear();
            navigate('/');
        }
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <button className="back-btn" onClick={() => navigate('/home')}>
                    ←
                </button>
                <h1>Cài đặt</h1>
                <div className="header-spacer" />
            </header>

            <main className="profile-main">
                <div className="profile-card">
                    <div className="avatar">
                        <span>👤</span>
                    </div>
                    <h2>{userName}</h2>
                    {partnerName && (
                        <p className="partner-info">💕 Kết nối với {partnerName}</p>
                    )}
                </div>

                <div className="settings-section">
                    <h3>Thông tin kết nối</h3>

                    <div className="settings-item">
                        <span className="label">Mã ghép cặp</span>
                        <span className="value">{pairCode || 'Chưa có'}</span>
                    </div>

                    <div className="settings-item">
                        <span className="label">Người yêu</span>
                        <span className="value">{partnerName || 'Chưa ghép cặp'}</span>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Ứng dụng</h3>

                    <div className="settings-item">
                        <span className="label">Phiên bản</span>
                        <span className="value">1.0.0</span>
                    </div>

                    <div className="settings-item">
                        <span className="label">Thông báo</span>
                        <span className="value status-enabled">Đã bật</span>
                    </div>
                </div>

                <div className="danger-zone">
                    <button className="logout-btn" onClick={handleLogout}>
                        Đăng xuất
                    </button>
                </div>
            </main>

            <nav className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/home')}>
                    <span className="nav-icon">💕</span>
                    <span>Cảm xúc</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/calendar')}>
                    <span className="nav-icon">📅</span>
                    <span>Lịch sử</span>
                </button>
                <button className="nav-item active">
                    <span className="nav-icon">👤</span>
                    <span>Cài đặt</span>
                </button>
            </nav>
        </div>
    );
}
