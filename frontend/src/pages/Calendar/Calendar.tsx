import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppShell,
    Container,
    Title,
    Text,
    Button,
    Group,
    Stack,
    Avatar,
    ActionIcon,
    SimpleGrid,
    Center,
    Loader,
    Paper
} from '@mantine/core';
import {
    IconCalendar,
    IconUser,
    IconSettings,
    IconMoodSmile,
    IconArrowLeft,
    IconAlertCircle
} from '@tabler/icons-react';
import { EmotionCalendar } from '../../components/EmotionCalendar';
import { emotionApi } from '../../services/api';
import storage from '../../services/storage';
import { EmotionDay } from '../../types';

export default function Calendar() {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [emotions, setEmotions] = useState<EmotionDay[]>([]);
    const [loading, setLoading] = useState(true);

    const partnerId = storage.getPartnerId();
    const partnerName = storage.getPartnerName() || 'Người yêu';
    const isPaired = !!partnerId && partnerId !== 'null';

    useEffect(() => {
        if (!isPaired) {
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
    }, [partnerId, currentMonth, isPaired]);

    if (!isPaired) {
        return (
            <AppShell header={{ height: 60 }} padding="md">
                <AppShell.Header>
                    <Container size="md" h="100%" px="md">
                        <Group h="100%" justify="space-between">
                            <Group>
                                <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/home')}>
                                    <IconArrowLeft size={20} />
                                </ActionIcon>
                                <Title order={4}>Lịch cảm xúc</Title>
                            </Group>
                        </Group>
                    </Container>
                </AppShell.Header>
                <AppShell.Main>
                    <Container size="sm" pt={50}>
                        <Stack align="center" gap="md">
                            <IconAlertCircle size={50} color="var(--mantine-color-gray-5)" />
                            <Text ta="center" c="dimmed">Bạn cần ghép cặp để xem lịch sử cảm xúc</Text>
                            <Button onClick={() => navigate('/home')}>Về trang chủ</Button>
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        );
    }

    if (loading && emotions.length === 0) {
        return (
            <Center h="100vh">
                <Stack align="center" gap="sm">
                    <Loader size="lg" color="pink" />
                    <Text c="dimmed">Đang tải dữ liệu...</Text>
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
                            <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/home')}>
                                <IconArrowLeft size={20} />
                            </ActionIcon>
                            <Title order={4}>Lịch cảm xúc</Title>
                        </Group>
                        <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/profile')}>
                            <IconSettings size={20} />
                        </ActionIcon>
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Main pb={80}>
                <Container size="sm">
                    <EmotionCalendar
                        emotions={emotions}
                        currentMonth={currentMonth}
                        onMonthChange={setCurrentMonth}
                        partnerName={partnerName}
                    />
                </Container>
            </AppShell.Main>

            <AppShell.Footer p="md" style={{ zIndex: 200, display: 'flex' }}>
                <Container size="md" w="100%" h="100%">
                    <SimpleGrid cols={3} h="100%">
                        <Button
                            variant="subtle"
                            h="100%"
                            color="gray"
                            onClick={() => navigate('/home')}
                        >
                            <Stack gap={0} align="center">
                                <IconMoodSmile size={24} />
                                <Text size="xs">Cảm xúc</Text>
                            </Stack>
                        </Button>
                        <Button
                            variant="subtle"
                            h="100%"
                            color="pink"
                            onClick={() => { }} // Already active
                            className="nav-btn-active"
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
