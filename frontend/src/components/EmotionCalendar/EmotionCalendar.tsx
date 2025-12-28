import { useState } from 'react';
import { Calendar, DatePickerProps } from '@mantine/dates';
import { Indicator, Popover, Text, Stack, Group, ThemeIcon, Paper, Avatar, Tooltip, Box } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';
import { getEmotionInfo, EmotionDay } from '../../types';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// Set locale to Vietnamese
dayjs.locale('vi');

interface EmotionCalendarProps {
    emotions: EmotionDay[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDaySelect?: (day: EmotionDay) => void;
    partnerName: string;
}

export default function EmotionCalendar({
    emotions,
    currentMonth,
    onMonthChange,
    onDaySelect,
    partnerName,
}: EmotionCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const hearts = [
        { size: 24, top: '5%', left: '5%', rotate: 15, color: '#fc9999ff' },
        { size: 16, top: '10%', right: '10%', rotate: -20, color: '#fa5252' },
        { size: 30, bottom: '15%', left: '8%', rotate: 45, color: '#ef9ab8ff' },
        { size: 20, bottom: '5%', right: '5%', rotate: -10, color: '#ff8787' },
        { size: 12, top: '50%', left: '2%', rotate: 30, color: '#ffa8a8' },
        { size: 28, top: '85%', right: '15%', rotate: 25, color: '#e9a3a3ff' },
        { size: 28, top: '25%', left: '85%', rotate: -15, color: '#ff6b6b' },
        { size: 14, top: '40%', right: '2%', rotate: 10, color: '#e77676ff' },
        { size: 22, bottom: '30%', left: '3%', rotate: -25, color: '#ed95b4ff' },
        { size: 10, top: '15%', left: '40%', rotate: 60, color: '#ff8787' },
        { size: 26, bottom: '10%', right: '35%', rotate: -5, color: '#ffa8a8' },
        { size: 28, top: '60%', left: '90%', rotate: 40, color: '#f59d9dff' },
        
    ];

    // Group emotions by date string YYYY-MM-DD
    const emotionsByDate = emotions.reduce((acc, day) => {
        acc[day.date] = day;
        return acc;
    }, {} as Record<string, EmotionDay>);

    const handleSelect = (dateStr: string) => {
        const date = new Date(dateStr);
        setSelectedDate(date);
        const formattedDateStr = dayjs(date).format('YYYY-MM-DD');
        const emotionDay = emotionsByDate[formattedDateStr];
        if (emotionDay && onDaySelect) {
            onDaySelect(emotionDay);
        }
    };

    const handleMonthChange = (dateStr: string) => {
        onMonthChange(new Date(dateStr));
    };

    const renderDay: DatePickerProps['renderDay'] = (date) => {
        const dateStr = dayjs(date).format('YYYY-MM-DD');
        const emotionDay = emotionsByDate[dateStr];
        const isToday = dayjs(date).isSame(dayjs(), 'day');

        return (
            <Indicator
                size={6}
                color="pink"
                offset={-2}
                disabled={!emotionDay}
                processing={isToday && !!emotionDay}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div>{dayjs(date).date()}</div>
                    {emotionDay && (
                        <div style={{ fontSize: '0.6rem', marginTop: -4 }}>
                            {getEmotionInfo(emotionDay.emotions[0].type).emoji}
                        </div>
                    )}
                </div>
            </Indicator>
        );
    };

    const selectedEmotionDay = selectedDate ? emotionsByDate[dayjs(selectedDate).format('YYYY-MM-DD')] : null;

    return (
        <Stack>
            <Paper
                withBorder
                p="xs"
                radius="md"
                pos="relative"
                style={{ overflow: 'hidden', borderColor: 'var(--mantine-color-pink-3)' }}
                bg="var(--mantine-color-pink-0)"
            >
                {hearts.map((heart, index) => (
                    <Box
                        key={index}
                        pos="absolute"
                        top={heart.top}
                        left={heart.left}
                        right={heart.right}
                        bottom={heart.bottom}
                        style={{
                            transform: `rotate(${heart.rotate}deg)`,
                            opacity: 0.6,
                            zIndex: 0
                        }}
                    >
                        <IconHeart
                            size={heart.size}
                            color={heart.color}
                            fill={heart.color}
                        />
                    </Box>
                ))}

                <Group justify="center" pos="relative" style={{ zIndex: 1 }}>
                    <Calendar
                        date={currentMonth}
                        onDateChange={handleMonthChange}
                        renderDay={renderDay}
                        getDayProps={(date) => ({
                            onClick: () => handleSelect(date),
                        })}
                        locale="vi"
                        static
                        styles={{
                            calendarHeader: { color: 'var(--mantine-color-red-9)' },
                            day: { borderRadius: '50%' }
                        }}
                    />
                </Group>
            </Paper>

            {selectedDate && (
                <Paper withBorder p="xs" radius="md">
                    <Text fw={500} mb="xs">Ngày {dayjs(selectedDate).format('DD/MM/YYYY')}</Text>

                    {!selectedEmotionDay ? (
                        <Text size="xs" c="dimmed" fs="italic">Không có dữ liệu cảm xúc.</Text>
                    ) : (
                        <Stack gap="xs">
                            {selectedEmotionDay.emotions.map((emotion, index) => {
                                const info = getEmotionInfo(emotion.type);
                                return (
                                    <Group key={index} justify="space-between">
                                        <Group gap="xs">
                                            <ThemeIcon variant="light" color={info.color.includes('#') ? undefined : info.color} style={info.color.includes('#') ? { color: info.color, backgroundColor: `${info.color}20` } : {}}>
                                                <Text size="sm">{info.emoji}</Text>
                                            </ThemeIcon>
                                            <Stack gap={0}>
                                                <Text size="sm" fw={500}>{info.nameVi}</Text>
                                                <Text size="xs" c="dimmed">{emotion.time}</Text>
                                            </Stack>
                                        </Group>
                                        <Text fw={500} size="sm" style={{ color: info.color }}>
                                            {emotion.intensity}%
                                        </Text>
                                    </Group>
                                );
                            })}
                        </Stack>
                    )}
                </Paper>
            )}
        </Stack>
    );
}
