/**
 * 化妆日历组件
 * 以日历形式展示每日化妆记录
 */
import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Spin, Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { MakeupCalendarData, MakeupLog } from '@/types/makeup';
import * as makeupService from '@/services/makeupService';
import { glassCardStyle } from '@/constants/styles';

interface MakeupCalendarProps {
    onDateSelect?: (date: Dayjs, makeups: MakeupLog[]) => void;
    onAddMakeup?: (date: Dayjs) => void;
}

const MakeupCalendar: React.FC<MakeupCalendarProps> = ({ onDateSelect, onAddMakeup }) => {
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const [calendarData, setCalendarData] = useState<MakeupCalendarData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCalendarData(currentDate.year(), currentDate.month() + 1);
    }, [currentDate.year(), currentDate.month()]);

    const loadCalendarData = async (year: number, month: number) => {
        setLoading(true);
        try {
            const res = await makeupService.getMakeupCalendar(year, month);
            if (res.success) {
                setCalendarData(res.data || []);
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

    const getDayData = (day: number): MakeupCalendarData | undefined => {
        return calendarData.find(d => dayjs(d.date).date() === day);
    };

    // 从日历数据中提取妆面名称
    const getLookNames = (data: MakeupCalendarData): string[] => {
        return data.makeups
            .map(m => m.lookName)
            .filter((name): name is string => !!name);
    };

    const dateCellRender = (value: Dayjs) => {
        // 检查日期是否属于当前月份
        if (value.month() !== currentDate.month()) {
            return null;
        }

        const day = value.date();
        const dayData = getDayData(day);

        if (!dayData || dayData.count === 0) return null;

        const lookNames = getLookNames(dayData);

        return (
            <div style={{ padding: '2px' }}>
                <Tooltip
                    title={
                        <div>
                            <div>{dayData.count} 次化妆</div>
                            {lookNames.slice(0, 3).map((name: string, idx: number) => (
                                <div key={idx} style={{ fontSize: '12px' }}>{name}</div>
                            ))}
                            {lookNames.length > 3 && (
                                <div style={{ fontSize: '12px' }}>...</div>
                            )}
                        </div>
                    }
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <Badge
                            count={dayData.count}
                            style={{
                                backgroundColor: '#eb2f96',
                                fontSize: '10px'
                            }}
                            size="small"
                        />
                        {lookNames.length > 0 && (
                            <div style={{
                                fontSize: '10px',
                                color: 'rgba(255, 255, 255, 0.7)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '60px'
                            }}>
                                {lookNames[0]}
                            </div>
                        )}
                    </div>
                </Tooltip>
            </div>
        );
    };

    const onSelect = (value: Dayjs) => {
        // 暂时返回空数组，详情可在父组件中处理
        onDateSelect?.(value, []);
    };

    // 计算本月总化妆次数
    const totalMakeupsInMonth = calendarData.reduce((sum, d) => sum + d.count, 0);

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
                    {onAddMakeup && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => onAddMakeup(currentDate)}
                            style={{
                                background: 'linear-gradient(135deg, #eb2f96 0%, #722ed1 100%)',
                                border: 'none'
                            }}
                        >
                            记录化妆
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
                本月化妆记录: <strong>{totalMakeupsInMonth}</strong> 次
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

            {/* 自定义日历样式 */}
            <style>{`
                .ant-picker-calendar {
                    background: transparent !important;
                }
                .ant-picker-calendar-date {
                    border-top: none !important;
                }
                .ant-picker-calendar-date-value {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .ant-picker-calendar-date-today .ant-picker-calendar-date-value {
                    color: #eb2f96 !important;
                }
                .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-calendar-date {
                    background: rgba(235, 47, 150, 0.2) !important;
                }
                .ant-picker-cell:not(.ant-picker-cell-in-view) .ant-picker-calendar-date-value {
                    color: rgba(255, 255, 255, 0.3) !important;
                }
                .ant-picker-content th {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
            `}</style>
        </div>
    );
};

export default MakeupCalendar;
