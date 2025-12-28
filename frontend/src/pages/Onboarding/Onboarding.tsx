import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pairApi } from '../../services/api';
import storage from '../../services/storage';
import './Onboarding.css';

type Step = 'welcome' | 'create' | 'join' | 'waiting' | 'success';

export default function Onboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('welcome');
    const [name, setName] = useState('');
    const [pairCode, setPairCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreatePair = async () => {
        if (!name.trim()) {
            setError('Vui lòng nhập tên của bạn');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await pairApi.create(name.trim());
            const data = response.data;

            storage.setToken(data.token);
            storage.setUserId(data.userId);
            storage.setPairCode(data.pairCode);
            storage.setUserName(name.trim());

            setGeneratedCode(data.pairCode);
            setStep('waiting');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinPair = async () => {
        if (!name.trim()) {
            setError('Vui lòng nhập tên của bạn');
            return;
        }
        if (!pairCode.trim() || pairCode.length !== 6) {
            setError('Mã ghép phải có 6 ký tự');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await pairApi.join(pairCode.trim().toUpperCase(), name.trim());
            const data = response.data;

            storage.setToken(data.token);
            storage.setUserId(data.userId);
            storage.setPartnerId(data.partnerId);
            storage.setUserName(name.trim());
            storage.setPartnerName(data.partnerName);

            setPartnerName(data.partnerName);
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mã ghép không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        navigate('/home');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        // Show toast or feedback
    };

    return (
        <div className="onboarding">
            <div className="onboarding-container">
                {/* Welcome Step */}
                {step === 'welcome' && (
                    <div className="step-content animate-in">
                        <div className="logo">💑</div>
                        <h1>MakeUsBetter</h1>
                        <p className="tagline">Chia sẻ cảm xúc, thấu hiểu nhau hơn</p>

                        <div className="action-buttons">
                            <button className="btn-primary" onClick={() => setStep('create')}>
                                Tạo kết nối mới
                            </button>
                            <button className="btn-secondary" onClick={() => setStep('join')}>
                                Nhập mã ghép cặp
                            </button>
                        </div>
                    </div>
                )}

                {/* Create Step */}
                {step === 'create' && (
                    <div className="step-content animate-in">
                        <button className="back-btn" onClick={() => setStep('welcome')}>
                            ← Quay lại
                        </button>

                        <div className="icon">💕</div>
                        <h2>Tạo kết nối mới</h2>
                        <p>Nhập tên của bạn để bắt đầu</p>

                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Tên của bạn"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={50}
                            />
                        </div>

                        {error && <p className="error">{error}</p>}

                        <button
                            className="btn-primary"
                            onClick={handleCreatePair}
                            disabled={loading}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo mã ghép cặp'}
                        </button>
                    </div>
                )}

                {/* Join Step */}
                {step === 'join' && (
                    <div className="step-content animate-in">
                        <button className="back-btn" onClick={() => setStep('welcome')}>
                            ← Quay lại
                        </button>

                        <div className="icon">🔗</div>
                        <h2>Nhập mã ghép cặp</h2>
                        <p>Nhập mã 6 ký tự từ người yêu của bạn</p>

                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Tên của bạn"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={50}
                            />
                        </div>

                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Mã ghép cặp (6 ký tự)"
                                value={pairCode}
                                onChange={(e) => setPairCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                className="code-input"
                            />
                        </div>

                        {error && <p className="error">{error}</p>}

                        <button
                            className="btn-primary"
                            onClick={handleJoinPair}
                            disabled={loading}
                        >
                            {loading ? 'Đang kết nối...' : 'Ghép cặp'}
                        </button>
                    </div>
                )}

                {/* Waiting Step */}
                {step === 'waiting' && (
                    <div className="step-content animate-in">
                        <div className="icon pulse">⏳</div>
                        <h2>Mã ghép cặp của bạn</h2>
                        <p>Chia sẻ mã này với người yêu của bạn</p>

                        <div className="code-display" onClick={copyToClipboard}>
                            {generatedCode.split('').map((char, i) => (
                                <span key={i} className="code-char">{char}</span>
                            ))}
                        </div>
                        <p className="hint">Nhấn để sao chép</p>

                        <div className="waiting-info">
                            <p>Đang chờ người yêu của bạn nhập mã...</p>
                            <div className="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>

                        <button className="btn-secondary" onClick={handleContinue}>
                            Tiếp tục vào ứng dụng
                        </button>
                    </div>
                )}

                {/* Success Step */}
                {step === 'success' && (
                    <div className="step-content animate-in">
                        <div className="icon celebrate">🎉</div>
                        <h2>Kết nối thành công!</h2>
                        <p>Bạn đã ghép cặp với <strong>{partnerName}</strong></p>

                        <div className="success-hearts">
                            <span>💕</span>
                        </div>

                        <button className="btn-primary" onClick={handleContinue}>
                            Bắt đầu chia sẻ cảm xúc
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
