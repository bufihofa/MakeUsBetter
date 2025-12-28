import { useState, useCallback } from 'react';
import { EMOTIONS, EmotionType, EmotionInfo } from '../../types';
import './EmotionWheel.css';

interface EmotionWheelProps {
    onSelect: (emotion: EmotionInfo, intensity: number) => void;
    disabled?: boolean;
}

export default function EmotionWheel({ onSelect, disabled }: EmotionWheelProps) {
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
    const [intensity, setIntensity] = useState(50);
    const [showIntensity, setShowIntensity] = useState(false);

    const handleEmotionClick = useCallback((emotion: EmotionInfo) => {
        if (disabled) return;
        setSelectedEmotion(emotion.type);
        setShowIntensity(true);
    }, [disabled]);

    const handleConfirm = useCallback(() => {
        const emotion = EMOTIONS.find(e => e.type === selectedEmotion);
        if (emotion) {
            onSelect(emotion, intensity);
            setShowIntensity(false);
            setSelectedEmotion(null);
            setIntensity(50);
        }
    }, [selectedEmotion, intensity, onSelect]);

    const handleCancel = useCallback(() => {
        setShowIntensity(false);
        setSelectedEmotion(null);
        setIntensity(50);
    }, []);

    return (
        <div className="emotion-wheel-container">
            <div className={`emotion-wheel ${disabled ? 'disabled' : ''}`}>
                {EMOTIONS.map((emotion, index) => {
                    const angle = (index * 360) / EMOTIONS.length - 90;
                    const isSelected = selectedEmotion === emotion.type;

                    return (
                        <button
                            key={emotion.type}
                            className={`emotion-item ${isSelected ? 'selected' : ''}`}
                            style={{
                                '--angle': `${angle}deg`,
                                '--color': emotion.color,
                            } as React.CSSProperties}
                            onClick={() => handleEmotionClick(emotion)}
                            disabled={disabled}
                        >
                            <span className="emotion-emoji">{emotion.emoji}</span>
                            <span className="emotion-name">{emotion.nameVi}</span>
                        </button>
                    );
                })}
                <div className="wheel-center">
                    <span>💕</span>
                    <span className="center-text">Cảm xúc</span>
                </div>
            </div>

            {showIntensity && selectedEmotion && (
                <div className="intensity-modal">
                    <div className="intensity-content">
                        <div className="intensity-header">
                            <span className="intensity-emoji">
                                {EMOTIONS.find(e => e.type === selectedEmotion)?.emoji}
                            </span>
                            <h3>{EMOTIONS.find(e => e.type === selectedEmotion)?.nameVi}</h3>
                        </div>

                        <div className="intensity-slider-container">
                            <label>Cường độ: {intensity}%</label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={intensity}
                                onChange={(e) => setIntensity(Number(e.target.value))}
                                className="intensity-slider"
                                style={{
                                    '--intensity-color': EMOTIONS.find(e => e.type === selectedEmotion)?.color,
                                } as React.CSSProperties}
                            />
                            <div className="intensity-labels">
                                <span>Nhẹ</span>
                                <span>Mạnh</span>
                            </div>
                        </div>

                        <div className="intensity-actions">
                            <button className="btn-cancel" onClick={handleCancel}>
                                Hủy
                            </button>
                            <button className="btn-confirm" onClick={handleConfirm}>
                                Gửi cảm xúc
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
