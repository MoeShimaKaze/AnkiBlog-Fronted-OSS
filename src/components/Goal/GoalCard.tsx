import React, { useState, useEffect } from 'react';
import { Card, Progress, Button, message, Tooltip, Badge, Modal, Form, InputNumber, Input, DatePicker, Space, ConfigProvider } from 'antd';
import {
    FireOutlined,
    TrophyOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { Goal, CalendarData, CheckInRequest } from '@/types/checkIn';
import { MOOD_OPTIONS } from '@/types/checkIn';
import { getPublicCalendarData, publicCheckIn } from '@/services/checkInService';
import { useAuth } from '@/hooks/auth/useAuth';
import GoalCalendar from './GoalCalendar';
import { interactiveGlassCardStyle, primaryTextStyle } from '@/constants/styles';

// 玻璃态主题配置
const glassTheme = {
    token: {
        colorText: 'rgba(255, 255, 255, 0.9)',
        colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
        colorBgElevated: 'rgba(35, 35, 45, 0.95)',
        borderRadius: 8,
    },
    components: {
        Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            activeBorderColor: '#1890ff',
        },
        InputNumber: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
        },
        DatePicker: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
        },
        Form: {
            labelColor: 'rgba(255, 255, 255, 0.85)',
        },
        Modal: {
            contentBg: 'rgba(35, 35, 45, 0.95)',
            headerBg: 'rgba(35, 35, 45, 0.95)',
            titleColor: 'rgba(255, 255, 255, 0.9)',
        },
    },
};

interface GoalCardProps {
    goal: Goal;
    onCheckInSuccess?: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onCheckInSuccess }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
    const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(false);
    const [form] = Form.useForm();
    const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const isAccumulate = goal.goalType === 'ACCUMULATE';
    const quickValues = [0.5, 1, 1.5, 2, 3, 4];

    useEffect(() => {
        loadCalendarData();
    }, [goal.id]);

    useEffect(() => {
        if (checkInDialogOpen) {
            form.setFieldsValue({
                date: dayjs(),
                value: goal.stepValue || 1,
                note: ''
            });
            setSelectedMood(undefined);
        }
    }, [checkInDialogOpen, form, goal.stepValue]);

    const loadCalendarData = async () => {
        try {
            const res = await getPublicCalendarData(goal.id, currentYear, currentMonth);
            if (res.success) {
                setCalendarData(res.data);
            }
        } catch (error) {
            console.error('Failed to load calendar data:', error);
        }
    };

    const handleCheckIn = async () => {
        try {
            const values = await form.validateFields();
            setCheckInLoading(true);

            const request: CheckInRequest = {
                date: (values.date as Dayjs).format('YYYY-MM-DD'),
                value: isAccumulate ? values.value : 1,
                note: values.note,
                mood: selectedMood
            };

            const res = await publicCheckIn(goal.id, request);
            if (res.success) {
                message.success(res.data.message || '打卡成功！');
                setCheckInDialogOpen(false);
                await loadCalendarData();
                onCheckInSuccess?.();
            }
        } catch (error: any) {
            message.error(error.message || '打卡失败');
        } finally {
            setCheckInLoading(false);
        }
    };

    const handleQuickValue = (value: number) => {
        form.setFieldsValue({ value });
    };

    const cardStyle: React.CSSProperties = {
        ...interactiveGlassCardStyle,
    };

    const progressColor = goal.color || '#4ade80';
    const progressPercent = goal.goalType === 'ACCUMULATE'
        ? Math.min(goal.progressPercentage, 100)
        : (goal.totalCheckInDays / 30) * 100; // Simplified progress for daily goals

    return (
        <>
            <Card
                style={cardStyle}
                bodyStyle={{ padding: 20 }}
                hoverable
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 16
                }}>
                    <div style={{
                        fontSize: 32,
                        marginRight: 12,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}>
                        {goal.icon || '🎯'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: 18,
                            fontWeight: 600,
                            ...primaryTextStyle,
                            marginBottom: 4
                        }}>
                            {goal.name}
                        </div>
                        {goal.description && (
                            <div style={{
                                fontSize: 12,
                                color: 'rgba(255, 255, 255, 0.6)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {goal.description}
                            </div>
                        )}
                    </div>
                    {goal.checkedInToday && (
                        <Badge
                            count={<CheckCircleOutlined style={{ color: '#4ade80' }} />}
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 16 }}>
                    <Progress
                        percent={progressPercent}
                        strokeColor={{
                            '0%': progressColor,
                            '100%': progressColor
                        }}
                        trailColor="rgba(255, 255, 255, 0.1)"
                        showInfo={false}
                        size="small"
                    />
                    {goal.goalType === 'ACCUMULATE' && goal.targetValue && (
                        <div style={{
                            fontSize: 12,
                            color: 'rgba(255, 255, 255, 0.6)',
                            marginTop: 4,
                            textAlign: 'right'
                        }}>
                            {goal.totalValue} / {goal.targetValue} {goal.targetUnit || ''}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginBottom: 16,
                    padding: '12px 0',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 8
                }}>
                    <Tooltip title="连续打卡天数">
                        <div style={{ textAlign: 'center' }}>
                            <FireOutlined style={{
                                fontSize: 16,
                                color: '#f59e0b',
                                marginBottom: 4
                            }} />
                            <div style={{
                                fontSize: 20,
                                fontWeight: 700,
                                ...primaryTextStyle,
                            }}>
                                {goal.currentStreak}
                            </div>
                            <div style={{
                                fontSize: 10,
                                color: 'rgba(255, 255, 255, 0.5)'
                            }}>
                                连续天数
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip title="累计打卡天数">
                        <div style={{ textAlign: 'center' }}>
                            <TrophyOutlined style={{
                                fontSize: 16,
                                color: '#3b82f6',
                                marginBottom: 4
                            }} />
                            <div style={{
                                fontSize: 20,
                                fontWeight: 700,
                                ...primaryTextStyle,
                            }}>
                                {goal.totalCheckInDays}
                            </div>
                            <div style={{
                                fontSize: 10,
                                color: 'rgba(255, 255, 255, 0.5)'
                            }}>
                                累计天数
                            </div>
                        </div>
                    </Tooltip>
                </div>

                {/* Calendar */}
                {calendarData && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: 16
                    }}>
                        <GoalCalendar
                            year={calendarData.year}
                            month={calendarData.month}
                            days={calendarData.days}
                            color={goal.color || '#4ade80'}
                            compact={true}
                        />
                    </div>
                )}

                {/* Milestones */}
                {goal.milestoneCount > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                        gap: 4
                    }}>
                        {Array.from({ length: Math.min(goal.milestoneCount, 5) }).map((_, i) => (
                            <span
                                key={i}
                                style={{
                                    fontSize: 16,
                                    opacity: i < goal.unlockedMilestoneCount ? 1 : 0.3
                                }}
                            >
                                ⭐
                            </span>
                        ))}
                        {goal.milestoneCount > 5 && (
                            <span style={{
                                fontSize: 12,
                                color: 'rgba(255, 255, 255, 0.5)'
                            }}>
                                +{goal.milestoneCount - 5}
                            </span>
                        )}
                    </div>
                )}

                {/* Check-in Button (Admin Only) */}
                {isAdmin && !goal.checkedInToday && goal.shouldCheckInToday && (
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={() => setCheckInDialogOpen(true)}
                        block
                        style={{
                            background: `linear-gradient(135deg, ${progressColor}, ${progressColor}dd)`,
                            border: 'none',
                            height: 40,
                            fontWeight: 600,
                            boxShadow: `0 4px 12px ${progressColor}66`
                        }}
                    >
                        立即打卡
                    </Button>
                )}

                {goal.checkedInToday && (
                    <div style={{
                        textAlign: 'center',
                        padding: '10px 0',
                        color: '#4ade80',
                        fontSize: 14,
                        fontWeight: 500
                    }}>
                        <CheckCircleOutlined style={{ marginRight: 6 }} />
                        今日已打卡
                    </div>
                )}
            </Card>

            {/* Check-in Dialog */}
            <ConfigProvider theme={glassTheme}>
                <Modal
                    title={
                        <Space>
                            <span>{goal.icon || '🎯'}</span>
                            <span>{goal.name}</span>
                        </Space>
                    }
                    open={checkInDialogOpen}
                    onCancel={() => setCheckInDialogOpen(false)}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => setCheckInDialogOpen(false)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'rgba(255, 255, 255, 0.8)',
                            }}
                        >
                            取消
                        </Button>,
                        <Button key="submit" type="primary" loading={checkInLoading} onClick={handleCheckIn}>
                            确认打卡
                        </Button>
                    ]}
                    destroyOnClose
                    styles={{
                        content: {
                            background: 'rgba(35, 35, 45, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        },
                        header: {
                            background: 'transparent',
                        },
                    }}
                >
                    <Form form={form} layout="vertical" className="mt-4">
                        <Form.Item
                            name="date"
                            label="打卡日期"
                            rules={[{ required: true, message: '请选择日期' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                disabledDate={(current) => current && current > dayjs().endOf('day')}
                            />
                        </Form.Item>

                        {isAccumulate && (
                            <>
                                <Form.Item
                                    name="value"
                                    label={`本次${goal.targetUnit || '数值'}`}
                                    rules={[
                                        { required: true, message: '请输入数值' },
                                        { type: 'number', min: 0.5, message: '数值必须大于0' }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0.5}
                                        step={goal.stepValue || 0.5}
                                        precision={1}
                                        addonAfter={goal.targetUnit || ''}
                                    />
                                </Form.Item>

                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-white/60 text-sm">快捷:</span>
                                    <Space wrap>
                                        {quickValues.map((v) => (
                                            <Button
                                                key={v}
                                                size="small"
                                                onClick={() => handleQuickValue(v)}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    color: 'rgba(255, 255, 255, 0.8)',
                                                }}
                                            >
                                                {v}
                                            </Button>
                                        ))}
                                    </Space>
                                </div>
                            </>
                        )}

                        <Form.Item name="note" label="备注">
                            <Input.TextArea
                                rows={2}
                                placeholder="记录一下今天的心得..."
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>

                        <Form.Item label="心情">
                            <div className="flex gap-2 flex-wrap">
                                {MOOD_OPTIONS.map((mood) => (
                                    <span
                                        key={mood.emoji}
                                        className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg cursor-pointer transition-all ${
                                            selectedMood === mood.emoji
                                                ? 'bg-blue-500 scale-110'
                                                : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                        onClick={() => setSelectedMood(
                                            selectedMood === mood.emoji ? undefined : mood.emoji
                                        )}
                                        title={mood.label}
                                    >
                                        {mood.emoji}
                                    </span>
                                ))}
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </ConfigProvider>
        </>
    );
};

export default GoalCard;
