import { useState, useCallback, useRef } from 'react';
import { EMOTIONS, EmotionType, EmotionInfo } from '../../types';
import { Modal, Stack, Text, Slider, Group, Button, Center, Textarea, ActionIcon } from '@mantine/core';
import { IconMicrophone, IconPlayerStop, IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import './EmotionWheel.css';

interface EmotionWheelProps {
    onSelect: (emotion: EmotionInfo, intensity: number, textMessage?: string, voiceBlob?: Blob) => void;
    disabled?: boolean;
}

export default function EmotionWheel({ onSelect, disabled }: EmotionWheelProps) {
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
    const [intensity, setIntensity] = useState(50);
    const [textMessage, setTextMessage] = useState('');
    const [opened, setOpened] = useState(false);

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleEmotionClick = useCallback((emotion: EmotionInfo) => {
        if (disabled) return;
        setSelectedEmotion(emotion.type);
        setOpened(true);
    }, [disabled]);

    const handleConfirm = useCallback(() => {
        const emotion = EMOTIONS.find(e => e.type === selectedEmotion);
        if (emotion) {
            onSelect(emotion, intensity, textMessage || undefined, voiceBlob || undefined);
            handleClose();
        }
    }, [selectedEmotion, intensity, textMessage, voiceBlob, onSelect]);

    const handleClose = useCallback(() => {
        setOpened(false);
        setSelectedEmotion(null);
        setIntensity(50);
        setTextMessage('');
        setVoiceBlob(null);
        setIsRecording(false);
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }, []);

    // Voice recording functions
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setVoiceBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Auto stop after 30 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    stopRecording();
                }
            }, 30000);
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, []);

    const playVoice = useCallback(() => {
        if (voiceBlob) {
            const url = URL.createObjectURL(voiceBlob);
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => setIsPlaying(false);
            audio.play();
            setIsPlaying(true);
        }
    }, [voiceBlob]);

    const deleteVoice = useCallback(() => {
        setVoiceBlob(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
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
                size="md"
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
                                styles={(theme) => ({
                                    track: { backgroundColor: theme.colors.dark[4] },
                                    bar: { backgroundColor: selectedEmotionInfo.color.includes('#') ? selectedEmotionInfo.color : undefined },
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

                        {/* Text Message Input */}
                        <Textarea
                            w="100%"
                            placeholder="Nhập lời nhắn cho người ấy... (tuỳ chọn)"
                            value={textMessage}
                            onChange={(e) => setTextMessage(e.currentTarget.value)}
                            maxLength={500}
                            minRows={2}
                            maxRows={4}
                            autosize
                        />

                        {/* Voice Recording Section */}
                        <Stack w="100%" gap="xs">
                            <Text size="sm" fw={500} ta="center">🎤 Tin nhắn thoại (tuỳ chọn)</Text>

                            {!voiceBlob ? (
                                <Center>
                                    <ActionIcon
                                        size="xl"
                                        radius="xl"
                                        variant={isRecording ? 'filled' : 'light'}
                                        color={isRecording ? 'red' : 'primary'}
                                        onClick={isRecording ? stopRecording : startRecording}
                                    >
                                        {isRecording ? <IconPlayerStop size={24} /> : <IconMicrophone size={24} />}
                                    </ActionIcon>
                                </Center>
                            ) : (
                                <Group justify="center" gap="sm">
                                    <ActionIcon
                                        size="lg"
                                        radius="xl"
                                        variant="light"
                                        color="primary"
                                        onClick={playVoice}
                                        disabled={isPlaying}
                                    >
                                        <IconPlayerPlay size={20} />
                                    </ActionIcon>
                                    <ActionIcon
                                        size="lg"
                                        radius="xl"
                                        variant="light"
                                        color="red"
                                        onClick={deleteVoice}
                                    >
                                        <IconTrash size={20} />
                                    </ActionIcon>
                                    <Text size="xs" c="dimmed">Đã ghi âm</Text>
                                </Group>
                            )}

                            {isRecording && (
                                <Text size="xs" c="red" ta="center">🔴 Đang ghi... (tối đa 30 giây)</Text>
                            )}
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

