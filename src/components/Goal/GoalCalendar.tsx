import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import type { CalendarDay } from '@/types/checkIn';

interface GoalCalendarProps {
    year: number;
    month: number;
    days: CalendarDay[];
    color?: string;
    compact?: boolean;
}

const GoalCalendar: React.FC<GoalCalendarProps> = ({
    year,
    month,
    days,
    color = '#4ade80',
    compact = false
}) => {
    const calendarData = useMemo(() => {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

        // Convert to Monday start (0 = Monday, 6 = Sunday)
        const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

        const dayMap = new Map<string, CalendarDay>();
        days.forEach(day => {
            const dateStr = typeof day.date === 'string' ? day.date : day.date;
            dayMap.set(dateStr, day);
        });

        const weeks: (CalendarDay | null)[][] = [];
        let currentWeek: (CalendarDay | null)[] = [];

        // Add empty cells for days before the first day of month
        for (let i = 0; i < adjustedStartDay; i++) {
            currentWeek.push(null);
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const calendarDay = dayMap.get(dateStr) || {
                date: dateStr,
                checkedIn: false
            };
            currentWeek.push(calendarDay);

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Add empty cells for remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        return weeks;
    }, [year, month, days]);

    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
    const cellSize = compact ? 16 : 24;
    const gap = compact ? 2 : 4;

    return (
        <div style={{
            display: 'inline-block',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: compact ? 8 : 12,
            padding: compact ? 8 : 12
        }}>
            {/* Header */}
            {!compact && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 8,
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.6)'
                }}>
                    {year}年{month}月
                </div>
            )}

            {/* Week days header */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(7, ${cellSize}px)`,
                gap: gap,
                marginBottom: gap
            }}>
                {weekDays.map(day => (
                    <div
                        key={day}
                        style={{
                            width: cellSize,
                            height: compact ? 12 : 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: compact ? 8 : 10,
                            color: 'rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            {calendarData.map((week, weekIndex) => (
                <div
                    key={weekIndex}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(7, ${cellSize}px)`,
                        gap: gap
                    }}
                >
                    {week.map((day, dayIndex) => {
                        if (!day) {
                            return (
                                <div
                                    key={dayIndex}
                                    style={{
                                        width: cellSize,
                                        height: cellSize,
                                        borderRadius: compact ? 3 : 4
                                    }}
                                />
                            );
                        }

                        const isToday = day.date === new Date().toISOString().split('T')[0];
                        const cell = (
                            <div
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    borderRadius: compact ? 3 : 4,
                                    background: day.checkedIn
                                        ? color
                                        : 'rgba(255, 255, 255, 0.1)',
                                    border: isToday
                                        ? `2px solid ${color}`
                                        : 'none',
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: compact ? 8 : 10,
                                    color: day.checkedIn
                                        ? 'rgba(0, 0, 0, 0.8)'
                                        : 'rgba(255, 255, 255, 0.3)',
                                    cursor: day.checkedIn ? 'pointer' : 'default',
                                    transition: 'transform 0.2s ease'
                                }}
                            >
                                {day.mood || ''}
                            </div>
                        );

                        if (day.checkedIn && !compact) {
                            return (
                                <Tooltip
                                    key={dayIndex}
                                    title={
                                        <div>
                                            <div>{day.date}</div>
                                            {day.value && <div>数值: {day.value}</div>}
                                            {day.mood && <div>心情: {day.mood}</div>}
                                        </div>
                                    }
                                    overlayStyle={{ maxWidth: 200 }}
                                >
                                    {cell}
                                </Tooltip>
                            );
                        }

                        return <div key={dayIndex}>{cell}</div>;
                    })}
                </div>
            ))}
        </div>
    );
};

export default GoalCalendar;
