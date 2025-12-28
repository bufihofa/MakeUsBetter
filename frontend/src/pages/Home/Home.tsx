import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Title,
    Text,
    Group,
    Stack,
    Timeline,
    ThemeIcon,
    Loader,
    Center,
    Paper,
    Avatar,
    ActionIcon,
} from '@mantine/core';
import { IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { EmotionWheel } from '../../components/EmotionWheel';
import { emotionApi, pairApi } from '../../services/api';
import storage from '../../services/storage';
import { EmotionInfo, getEmotionInfo, Emotion } from '../../types';

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [partnerName, setPartnerName] = useState(storage.getPartnerName() || '');
    const [partnerId, setPartnerId] = useState(() => {
        const id = storage.getPartnerId();
        return (id && id !== 'null') ? id : '';
    });
    const [partnerAvatarUrl, setPartnerAvatarUrl] = useState(storage.getPartnerAvatarUrl() || '');
    const [pairCode, setPairCode] = useState(storage.getPairCode() || '');
    const [isPaired, setIsPaired] = useState(false);
    const [todayEmotions, setTodayEmotions] = useState<Emotion[]>([]);
    const [sending, setSending] = useState(false);
    const [lastSent, setLastSent] = useState<{ emoji: string; name: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch partner info
    useEffect(() => {
        const fetchPartner = async () => {
            try {
                const response = await pairApi.getPartner();
                const data = response.data;

                if (!data.isPaired) {
                    navigate('/onboarding', { replace: true });
                    return;
                }

                if (data.isPaired && data.partnerId) {
                    setIsPaired(true);
                    setPartnerId(data.partnerId);
                    setPartnerName(data.partnerName || 'NULL');
                    storage.setPartnerId(data.partnerId);
                    storage.setPartnerName(data.partnerName || '');

                    if (data.partnerAvatarUrl) {
                        setPartnerAvatarUrl(data.partnerAvatarUrl);
                        storage.setPartnerAvatarUrl(data.partnerAvatarUrl);
                    }

                    if (data.pairCode) {
                        setPairCode(data.pairCode);
                        storage.setPairCode(data.pairCode);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch partner:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPartner();
    }, [navigate]);

    // Fetch today's emotions from partner
    useEffect(() => {
        if (!partnerId || partnerId === 'null') return;

        const fetchTodayEmotions = async () => {
            try {
                const response = await emotionApi.getToday(partnerId);
                setTodayEmotions(response.data);
            } catch (error) {
                console.error('Failed to fetch today emotions:', error);
            }
        };

        fetchTodayEmotions();

        const handleEmotionReceived = (event: CustomEvent) => {
            fetchTodayEmotions();
        };

        window.addEventListener('emotionReceived', handleEmotionReceived as EventListener);
        return () => {
            window.removeEventListener('emotionReceived', handleEmotionReceived as EventListener);
        };
    }, [partnerId]);

    const handleEmotionSelect = useCallback(async (emotion: EmotionInfo, intensity: number, textMessage?: string, voiceBlob?: Blob) => {
        setSending(true);
        setLastSent(null);

        try {
            if (voiceBlob) {
                // Use multipart form for voice upload
                await emotionApi.createWithVoice(emotion.type, intensity, textMessage, voiceBlob);
            } else {
                // Use regular JSON API
                await emotionApi.create(emotion.type, intensity, textMessage);
            }
            setLastSent({ emoji: emotion.emoji, name: emotion.nameVi });
            setTimeout(() => setLastSent(null), 3000);
        } catch (error) {
            console.error('Failed to send emotion:', error);
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể gửi cảm xúc. Vui lòng thử lại.',
                color: 'red',
            });
        } finally {
            setSending(false);
        }
    }, []);

    if (loading) {
        return (
            <Center h="100vh">
                <Stack align="center" gap="sm">
                    <Loader size="lg" color="primary" />
                    <Text c="dimmed">Đang tải xuống...</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Stack gap="xl">
            <Stack align="center" gap="xs" mt="lg">
                <Title order={3} ta="center" fw={800} style={{ letterSpacing: '-0.5px' }}>Bạn đang cảm thấy thế nào?</Title>
                <Text c="dimmed" size="sm" ta="center">Chạm vào bánh xe để gửi cảm xúc</Text>
            </Stack>

            <Center>
                <EmotionWheel
                    onSelect={handleEmotionSelect}
                    disabled={sending || !isPaired}
                />
            </Center>

            {lastSent && (
                <Paper withBorder p="md" radius="md" bg="var(--mantine-color-primary-0)" style={{ borderColor: 'var(--mantine-color-primary-3)' }}>
                    <Group justify="center">
                        <Text size="xl">{lastSent.emoji}</Text>
                        <Text c="primary.9" fw={500}>Đã gửi "{lastSent.name}" thành công!</Text>
                    </Group>
                </Paper>
            )}

            {isPaired && todayEmotions.length > 0 && (
                <Paper withBorder p="md" radius="md" mt="xl">
                    <Group gap="sm" mb="lg">
                        <Avatar
                            size="md"
                            radius="xl"
                            color="primary"
                            src={partnerAvatarUrl || undefined}
                        >
                            {partnerName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Title order={4}>Hôm nay {partnerName} thế nào?</Title>
                    </Group>
                    <Timeline active={todayEmotions.length - 1} bulletSize={24} lineWidth={2}>
                        {todayEmotions.map((emotion, index) => {
                            const info = getEmotionInfo(emotion.type);
                            const isPlayingThis = playingVoiceId === emotion.id;

                            const handlePlayVoice = () => {
                                if (!emotion.voiceUrl) return;

                                if (isPlayingThis && audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current = null;
                                    setPlayingVoiceId(null);
                                    return;
                                }

                                // Stop any currently playing audio
                                if (audioRef.current) {
                                    audioRef.current.pause();
                                }

                                const audio = new Audio(emotion.voiceUrl);
                                audioRef.current = audio;
                                audio.onended = () => setPlayingVoiceId(null);
                                audio.play();
                                setPlayingVoiceId(emotion.id);
                            };

                            return (
                                <Timeline.Item
                                    key={index}
                                    bullet={
                                        <ThemeIcon color={info.color.includes('#') ? undefined : info.color} style={info.color.includes('#') ? { backgroundColor: info.color } : {}} size={24} radius="xl">
                                            <Text size="xs">{info.emoji}</Text>
                                        </ThemeIcon>
                                    }
                                    title={info.nameVi}
                                >
                                    <Text c="dimmed" size="xs">{emotion.time}</Text>
                                    <Text size="sm" mt={4}>Cường độ: {emotion.intensity}%</Text>

                                    {/* Text Message */}
                                    {emotion.textMessage && (
                                        <Paper p="xs" mt="xs" radius="md" bg="var(--mantine-color-dark-6)">
                                            <Text size="sm" fs="italic">"{emotion.textMessage}"</Text>
                                        </Paper>
                                    )}

                                    {/* Voice Playback */}
                                    {emotion.voiceUrl && (
                                        <Group gap="xs" mt="xs">
                                            <ActionIcon
                                                size="sm"
                                                radius="xl"
                                                variant="light"
                                                color={isPlayingThis ? 'red' : 'primary'}
                                                onClick={handlePlayVoice}
                                            >
                                                {isPlayingThis ? <IconPlayerStop size={14} /> : <IconPlayerPlay size={14} />}
                                            </ActionIcon>
                                            <Text size="xs" c="dimmed">🎤 Tin nhắn thoại</Text>
                                        </Group>
                                    )}
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                </Paper>
            )}
        </Stack>
    );
}
