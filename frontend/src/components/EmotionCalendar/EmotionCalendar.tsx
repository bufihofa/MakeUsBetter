import { useState } from 'react';
import { Calendar, DatePickerProps } from '@mantine/dates';
import { Indicator, Popover, Text, Stack, Group, ThemeIcon, Paper, Avatar, Tooltip } from '@mantine/core';
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

    // Group emotions by date string YYYY-MM-DD
    const emotionsByDate = emotions.reduce((acc, day) => {
        acc[day.date] = day;
        return acc;
    }, {} as Record<string, EmotionDay>);

    const handleSelect = (date: Date) => {
        setSelectedDate(date);
        const dateStr = dayjs(date).format('YYYY-MM-DD');
        const emotionDay = emotionsByDate[dateStr];
        if (emotionDay && onDaySelect) {
            onDaySelect(emotionDay);
        }
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
            <Paper withBorder p="md" radius="md">
                <Text ta="center" mb="sm" fw={500}>Cảm xúc của {partnerName}</Text>
                <Group justify="center">
                    <Calendar
                        date={currentMonth}
                        onDateChange={onMonthChange}
                        renderDay={renderDay}
                        onClickDay={handleSelect}
                        locale="vi"
                        static
                    />
                </Group>
            </Paper>

            {selectedDate && (
                <Paper withBorder p="md" radius="md">
                    <Text fw={700} mb="md">Ngày {dayjs(selectedDate).format('DD/MM/YYYY')}</Text>

                    {!selectedEmotionDay ? (
                        <Text c="dimmed" fs="italic">Không có dữ liệu cảm xúc.</Text>
                    ) : (
                        <Stack gap="sm">
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
