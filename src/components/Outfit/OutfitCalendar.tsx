/**
 * 穿搭日历组件
 * 以日历形式展示每日穿搭
 */
import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Spin, Button, Tooltip, Image } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { CalendarData, OutfitLog } from '@/types/outfit';
import * as outfitService from '@/services/outfitService';
import { glassCardStyle } from '@/constants/styles';

interface OutfitCalendarProps {
    onDateSelect?: (date: Dayjs, outfits: OutfitLog[]) => void;
    onAddOutfit?: (date: Dayjs) => void;
}

const OutfitCalendar: React.FC<OutfitCalendarProps> = ({ onDateSelect, onAddOutfit }) => {
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCalendarData(currentDate.year(), currentDate.month() + 1);
    }, [currentDate.year(), currentDate.month()]);

    const loadCalendarData = async (year: number, month: number) => {
        setLoading(true);
        try {
            const res = await outfitService.getOutfitCalendar(year, month);
            if (res.success) {
                setCalendarData(res.data);
            }
        } catch (error) {
            console.error('加载日历数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(currentDate.subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        setCurrentDate(currentDate.add(1, 'month'));
    };

    const handleToday = () => {
        setCurrentDate(dayjs());
    };

    const dateCellRender = (value: Dayjs) => {
        // 检查日期是否属于当前加载的月份，避免跨月日期错误显示数据
        if (!calendarData ||
            value.year() !== calendarData.year ||
            value.month() + 1 !== calendarData.month) {
            return null;
        }

        const day = value.date();
        const outfits = calendarData.dailyOutfits?.[day] || [];

        if (outfits.length === 0) return null;

        return (
            <div style={{ padding: '2px' }}>
                {outfits.slice(0, 2).map((outfit) => (
                    <Tooltip
                        key={outfit.id}
                        title={
                            <div>
                                <div>{dayjs(outfit.outfitDate).format('HH:mm')}</div>
                                <div>{outfit.items.length} 件单品</div>
                                {outfit.note && <div>{outfit.note}</div>}
                            </div>
                        }
                    >
                        <div style={{
                            display: 'flex',
                            gap: '2px',
                            marginBottom: '2px',
                            justifyContent: 'center'
                        }}>
                            {outfit.items.slice(0, 3).map((item, idx) => (
                                <Image
                                    key={idx}
                                    src={item.productMainImage}
                                    alt={item.productName}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '2px',
                                        objectFit: 'cover'
                                    }}
                                    preview={false}
                                />
                            ))}
                        </div>
                    </Tooltip>
                ))}
                {outfits.length > 2 && (
                    <Badge
                        count={`+${outfits.length - 2}`}
                        style={{ fontSize: '10px' }}
                        size="small"
                    />
                )}
            </div>
        );
    };

    const onSelect = (value: Dayjs) => {
        // 检查日期是否属于当前加载的月份，避免跨月日期返回错误数据
        if (!calendarData ||
            value.year() !== calendarData.year ||
            value.month() + 1 !== calendarData.month) {
            onDateSelect?.(value, []);
            return;
        }

        const day = value.date();
        const outfits = calendarData.dailyOutfits?.[day] || [];
        onDateSelect?.(value, outfits);
    };

    const headerStyle: React.CSSProperties = {
        ...glassCardStyle,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '16px 16px 0 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    };

    const glassStyle: React.CSSProperties = {
        ...glassCardStyle,
        overflow: 'hidden'
    };

    return (
        <div style={glassStyle}>
            {/* 自定义头部 */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={handlePrevMonth}
                        style={{ color: 'white' }}
                    />
                    <span style={{
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        minWidth: '120px',
                        textAlign: 'center'
                    }}>
                        {currentDate.format('YYYY年MM月')}
                    </span>
                    <Button
                        type="text"
                        icon={<RightOutlined />}
                        onClick={handleNextMonth}
                        style={{ color: 'white' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="small" onClick={handleToday}>
                        今天
                    </Button>
                    {onAddOutfit && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => onAddOutfit(currentDate)}
                        >
                            记录穿搭
                        </Button>
                    )}
                </div>
            </div>

            {/* 统计信息 */}
            <div style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.2)',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px'
            }}>
                本月穿搭记录: <strong>{calendarData?.totalOutfitsInMonth || 0}</strong> 次
            </div>

            {/* 日历主体 */}
            <Spin spinning={loading}>
                <Calendar
                    value={currentDate}
                    onChange={setCurrentDate}
                    onSelect={onSelect}
                    cellRender={dateCellRender}
                    headerRender={() => null}
                    fullscreen={false}
                    style={{
                        background: 'transparent',
                        padding: '8px'
                    }}
                />
            </Spin>
        </div>
    );
};

export default OutfitCalendar;
