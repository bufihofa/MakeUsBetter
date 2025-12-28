import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppShell,
    Container,
    Title,
    Text,
    Button,
    Group,
    Stack,
    Avatar,
    Badge,
    Timeline,
    ThemeIcon,
    Loader,
    Center,
    Paper,
    ActionIcon,
    SimpleGrid
} from '@mantine/core';
import {
    IconHeart,
    IconCalendar,
    IconUser,
    IconSettings,
    IconMoodSmile,
    IconClock
} from '@tabler/icons-react';
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
    const [pairCode, setPairCode] = useState(storage.getPairCode() || '');
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

                if (!data.isPaired) {
                    navigate('/onboarding', { replace: true });
                    return;
                }

                if (data.isPaired && data.partnerId) {
                    setIsPaired(true);
                    setPartnerId(data.partnerId);
                    setPartnerName(data.partnerName || 'Người thương');
                    storage.setPartnerId(data.partnerId);
                    storage.setPartnerName(data.partnerName || '');

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

    const handleEmotionSelect = useCallback(async (emotion: EmotionInfo, intensity: number) => {
        setSending(true);
        setLastSent(null);

        try {
            await emotionApi.create(emotion.type, intensity);
            setLastSent({ emoji: emotion.emoji, name: emotion.nameVi });
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
            <Center h="100vh">
                <Stack align="center" gap="sm">
                    <Loader size="lg" color="pink" />
                    <Text c="dimmed">Đang tải xuống...</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <AppShell
            header={{ height: 60 }}
            footer={{ height: 70 }}
            padding="md"
        >
            <AppShell.Header>
                <Container size="md" h="100%" px="md">
                    <Group h="100%" justify="space-between">
                        <Group>
                            <Avatar color="pink" radius="xl">
                                {(storage.getUserName() || 'B').charAt(0).toUpperCase()}
                            </Avatar>
                            <Stack gap={0}>
                                <Text size="sm" fw={700}>{storage.getUserName() || 'Bạn'}</Text>
                                {isPaired ? (
                                    <Group gap={4}>
                                        <Text size="xs" c="pink" fw={500}>❤️ {partnerName}</Text>
                                    </Group>
                                ) : (
                                    <Text size="xs" c="dimmed">Đang chờ ghép cặp...</Text>
                                )}
                            </Stack>
                        </Group>
                        <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/profile')}>
                            <IconSettings size={20} />
                        </ActionIcon>
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Main pb={80}> {/* Padding bottom for footer */}
                <Container size="sm">
                    <Stack gap="xl">
                        <Stack align="center" gap="xs">
                            <Title order={3} ta="center">Bạn đang cảm thấy thế nào?</Title>
                            <Text c="dimmed" size="sm" ta="center">Chạm vào bánh xe để gửi cảm xúc</Text>
                        </Stack>

                        <Center>
                            <EmotionWheel
                                onSelect={handleEmotionSelect}
                                disabled={sending || !isPaired}
                            />
                        </Center>

                        {lastSent && (
                            <Paper withBorder p="md" radius="md" bg="var(--mantine-color-pink-0)" style={{ borderColor: 'var(--mantine-color-pink-3)' }}>
                                <Group justify="center">
                                    <Text size="xl">{lastSent.emoji}</Text>
                                    <Text c="pink.9" fw={500}>Đã gửi "{lastSent.name}" thành công!</Text>
                                </Group>
                            </Paper>
                        )}

                        {isPaired && todayEmotions.length > 0 && (
                            <Paper withBorder p="md" radius="md" mt="xl">
                                <Title order={4} mb="lg">Hôm nay {partnerName} thế nào?</Title>
                                <Timeline active={todayEmotions.length - 1} bulletSize={24} lineWidth={2}>
                                    {todayEmotions.map((emotion, index) => {
                                        const info = getEmotionInfo(emotion.type);
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
                                            </Timeline.Item>
                                        );
                                    })}
                                </Timeline>
                            </Paper>
                        )}
                    </Stack>
                </Container>
            </AppShell.Main>

            <AppShell.Footer p="md" style={{ zIndex: 200, display: 'flex' }}> {/* Ensure footer is on top */}
                <Container size="md" w="100%" h="100%">
                    <SimpleGrid cols={3} h="100%">
                        <Button
                            variant="subtle"
                            h="100%"
                            color="pink"
                            onClick={() => { }} // Already home
                            className="nav-btn-active"
                        >
                            <Stack gap={0} align="center">
                                <IconMoodSmile size={24} />
                                <Text size="xs">Cảm xúc</Text>
                            </Stack>
                        </Button>
                        <Button
                            variant="subtle"
                            h="100%"
                            color="gray"
                            onClick={() => navigate('/calendar')}
                        >
                            <Stack gap={0} align="center">
                                <IconCalendar size={24} />
                                <Text size="xs">Lịch sử</Text>
                            </Stack>
                        </Button>
                        <Button
                            variant="subtle"
                            h="100%"
                            color="gray"
                            onClick={() => navigate('/profile')}
                        >
                            <Stack gap={0} align="center">
                                <IconUser size={24} />
                                <Text size="xs">Cài đặt</Text>
                            </Stack>
                        </Button>
                    </SimpleGrid>
                </Container>
            </AppShell.Footer>
        </AppShell>
    );
}
