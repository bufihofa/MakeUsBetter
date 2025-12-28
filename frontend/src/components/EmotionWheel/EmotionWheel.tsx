import { useState, useCallback } from 'react';
import { EMOTIONS, EmotionType, EmotionInfo } from '../../types';
import { Modal, Stack, Text, Slider, Group, Button, Center, ThemeIcon } from '@mantine/core';
import './EmotionWheel.css';

interface EmotionWheelProps {
    onSelect: (emotion: EmotionInfo, intensity: number) => void;
    disabled?: boolean;
}

export default function EmotionWheel({ onSelect, disabled }: EmotionWheelProps) {
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
    const [intensity, setIntensity] = useState(50);
    const [opened, setOpened] = useState(false);

    const handleEmotionClick = useCallback((emotion: EmotionInfo) => {
        if (disabled) return;
        setSelectedEmotion(emotion.type);
        setOpened(true);
    }, [disabled]);

    const handleConfirm = useCallback(() => {
        const emotion = EMOTIONS.find(e => e.type === selectedEmotion);
        if (emotion) {
            onSelect(emotion, intensity);
            setOpened(false);
            setSelectedEmotion(null);
            setIntensity(50);
        }
    }, [selectedEmotion, intensity, onSelect]);

    const handleClose = useCallback(() => {
        setOpened(false);
        setSelectedEmotion(null);
        setIntensity(50);
    }, []);

    const selectedEmotionInfo = EMOTIONS.find(e => e.type === selectedEmotion);

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

            <Modal
                opened={opened}
                onClose={handleClose}
                centered
                withCloseButton={false}
                padding="xl"
                radius="lg"
            >
                {selectedEmotionInfo && (
                    <Stack align="center" gap="lg">
                        <Stack align="center" gap="xs">
                            <Text size="4rem" style={{ lineHeight: 1 }}>{selectedEmotionInfo.emoji}</Text>
                            <Text size="xl" fw={700}>{selectedEmotionInfo.nameVi}</Text>
                        </Stack>

                        <Stack w="100%" gap="xs">
                            <Text size="sm" fw={500} ta="center">Cường độ: {intensity}%</Text>
                            <Slider
                                value={intensity}
                                onChange={setIntensity}
                                min={1}
                                max={100}
                                color={selectedEmotionInfo.color.includes('#') ? undefined : selectedEmotionInfo.color}
                                style={{
                                    '--slider-color': selectedEmotionInfo.color.includes('#') ? selectedEmotionInfo.color : undefined
                                } as React.CSSProperties}
                                styles={(theme) => ({
                                    track: {
                                        backgroundColor: theme.colors.dark[4]
                                    },
                                    bar: {
                                        backgroundColor: selectedEmotionInfo.color.includes('#') ? selectedEmotionInfo.color : undefined
                                    },
                                    thumb: {
                                        borderColor: selectedEmotionInfo.color.includes('#') ? selectedEmotionInfo.color : undefined,
                                        backgroundColor: selectedEmotionInfo.color.includes('#') ? selectedEmotionInfo.color : undefined
                                    }
                                })}
                            />
                            <Group justify="space-between" px="xs">
                                <Text size="xs" c="dimmed">Nhẹ</Text>
                                <Text size="xs" c="dimmed">Mạnh</Text>
                            </Group>
                        </Stack>

                        <Group w="100%" grow>
                            <Button variant="default" onClick={handleClose}>Huỷ</Button>
                            <Button
                                color={selectedEmotionInfo.color.includes('#') ? undefined : selectedEmotionInfo.color}
                                style={selectedEmotionInfo.color.includes('#') ? { backgroundColor: selectedEmotionInfo.color, color: 'white' } : {}}
                                onClick={handleConfirm}
                            >
                                Gửi cảm xúc
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </div>
    );
}
