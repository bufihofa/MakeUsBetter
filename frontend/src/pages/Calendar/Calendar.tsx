import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Button,
    Stack,
    Center,
    Loader,
    Paper
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
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
            <Container size="sm" pt={50}>
                <Stack align="center" gap="md">
                    <IconAlertCircle size={50} color="var(--mantine-color-gray-5)" />
                    <Text ta="center" c="dimmed">Bạn cần ghép cặp để xem lịch sử cảm xúc</Text>
                    <Button onClick={() => navigate('/home')}>Về trang chủ</Button>
                </Stack>
            </Container>
        );
    }

    if (loading && emotions.length === 0) {
        return (
            <Center h="100vh">
                <Stack align="center" gap="sm">
                    <Loader size="lg" color="primary" />
                    <Text c="dimmed">Đang tải dữ liệu...</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Container size="sm">
            <Stack gap="md">
                <Title order={3} ta="center" fw={800} style={{ letterSpacing: '-0.5px' }}>Lịch cảm xúc</Title>
                <Paper withBorder p="md" radius="md">
                    <EmotionCalendar
                        emotions={emotions}
                        currentMonth={currentMonth}
                        onMonthChange={setCurrentMonth}
                        partnerName={partnerName}
                    />
                </Paper>
            </Stack>
        </Container>
    );
}
