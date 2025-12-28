import { useState } from 'react';
import { getEmotionInfo, EmotionDay } from '../../types';
import './EmotionCalendar.css';

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
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    // Group emotions by date
    const emotionsByDate = emotions.reduce((acc, day) => {
        acc[day.date] = day;
        return acc;
    }, {} as Record<string, EmotionDay>);

    const handlePrevMonth = () => {
        onMonthChange(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        onMonthChange(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDay(dateStr);
        const emotionDay = emotionsByDate[dateStr];
        if (emotionDay && onDaySelect) {
            onDaySelect(emotionDay);
        }
    };

    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const renderDays = () => {
        const days = [];

        // Empty cells for days before first day of month
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const emotionDay = emotionsByDate[dateStr];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === selectedDay;

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${emotionDay ? 'has-emotion' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleDayClick(day)}
                >
                    <span className="day-number">{day}</span>
                    {emotionDay && (
                        <div className="day-emotions">
                            {emotionDay.emotions.slice(0, 3).map((e, i) => (
                                <span key={i} className="emotion-dot" title={getEmotionInfo(e.type).nameVi}>
                                    {getEmotionInfo(e.type).emoji}
                                </span>
                            ))}
                            {emotionDay.emotions.length > 3 && (
                                <span className="emotion-more">+{emotionDay.emotions.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const selectedEmotionDay = selectedDay ? emotionsByDate[selectedDay] : null;

    return (
        <div className="emotion-calendar">
            <div className="calendar-header">
                <button className="nav-btn" onClick={handlePrevMonth}>
                    ←
                </button>
                <h2>{monthNames[month]} {year}</h2>
                <button className="nav-btn" onClick={handleNextMonth}>
                    →
                </button>
            </div>

            <p className="calendar-subtitle">Cảm xúc của {partnerName}</p>

            <div className="calendar-weekdays">
                {dayNames.map(day => (
                    <div key={day} className="weekday">{day}</div>
                ))}
            </div>

            <div className="calendar-grid">
                {renderDays()}
            </div>

            {selectedEmotionDay && (
                <div className="day-detail">
                    <h3>Ngày {selectedDay}</h3>
                    <div className="emotion-list">
                        {selectedEmotionDay.emotions.map((emotion, index) => {
                            const info = getEmotionInfo(emotion.type);
                            return (
                                <div key={index} className="emotion-entry">
                                    <span className="entry-time">{emotion.time}</span>
                                    <span className="entry-emoji">{info.emoji}</span>
                                    <span className="entry-name">{info.nameVi}</span>
                                    <span
                                        className="entry-intensity"
                                        style={{ color: info.color }}
                                    >
                                        {emotion.intensity}%
                                    </span>
                                    {emotion.context && (
                                        <span className="entry-context">"{emotion.context}"</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
