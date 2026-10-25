import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Button,
    Space,
    Tag,
    Progress,
    Spin,
    message,
    Typography,
    List,
    Empty,
    Calendar,
    Badge
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    FireOutlined,
    TrophyOutlined,
    CheckCircleOutlined,
    LockOutlined,
    CalendarOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    LinkOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import type { GoalDetail, CalendarData } from '@/types/checkIn';
import { GOAL_STATUS_CONFIG, GOAL_TYPE_CONFIG } from '@/types/checkIn';
import { getGoalDetail, getCalendarData } from '@/services/checkInService';
import CheckInDialog from '@/components/CheckIn/CheckInDialog';

const { Title, Text, Paragraph } = Typography;

const GoalDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState<GoalDetail | null>(null);
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

    const fetchGoalDetail = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await getGoalDetail(id);
            if (res.success) {
                setGoal(res.data);
            }
        } catch (error) {
            message.error('加载目标详情失败');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchCalendarData = useCallback(async () => {
        if (!id) return;
        try {
            const res = await getCalendarData(id, currentMonth.year(), currentMonth.month() + 1);
            if (res.success) {
                setCalendarData(res.data);
            }
        } catch (error) {
            console.error('加载日历数据失败', error);
        }
    }, [id, currentMonth]);

    useEffect(() => {
        fetchGoalDetail();
    }, [fetchGoalDetail]);

    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    const handleCheckInClick = (date?: string) => {
        setSelectedDate(date);
        setCheckInDialogOpen(true);
    };

    const handleCheckInSuccess = () => {
        setCheckInDialogOpen(false);
        setSelectedDate(undefined);
        fetchGoalDetail();
        fetchCalendarData();
    };

    const dateCellRender = (value: Dayjs) => {
        if (!calendarData) return null;

        const dateStr = value.format('YYYY-MM-DD');
        const dayData = calendarData.days.find(d => d.date === dateStr);

        if (dayData?.checkedIn) {
            return (
                <div className="flex flex-col items-center gap-0.5">
                    <Badge status="success" />
                    {dayData.value && (
                        <span className="text-xs text-green-500">{dayData.value}</span>
                    )}
                </div>
            );
        }

        if (value.isBefore(dayjs().add(1, 'day'), 'day') && goal?.status === 'ACTIVE') {
            return (
                <div
                    className="flex justify-center items-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCheckInClick(dateStr);
                    }}
                >
                    <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 hover:bg-blue-500 hover:text-white">
                        +
                    </span>
                </div>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    if (!goal) {
        return (
            <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
                <Empty description="目标不存在" />
            </div>
        );
    }

    const statusConfig = GOAL_STATUS_CONFIG[goal.status];
    const isAccumulate = goal.goalType === 'ACCUMULATE';

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <div className="flex justify-between mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin/check-in')}
                >
                    返回
                </Button>
                <Button
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/admin/check-in/goals/${id}/edit`)}
                >
                    编辑
                </Button>
            </div>

            <Card className="mb-4">
                <div className="flex gap-4 mb-4">
                    <span style={{ fontSize: 48, lineHeight: 1 }}>{goal.icon || '🎯'}</span>
                    <div className="flex-1">
                        <Title level={3} className="mb-2">{goal.name}</Title>
                        <Space>
                            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                            {goal.categoryName && <Tag>{goal.categoryName}</Tag>}
                            <Text type="secondary">{GOAL_TYPE_CONFIG[goal.goalType].label}</Text>
                        </Space>
                    </div>
                </div>

                {goal.description && (
                    <Paragraph type="secondary" className="mb-4">
                        {goal.description}
                    </Paragraph>
                )}

                {isAccumulate && goal.targetValue ? (
                    <div className="flex justify-center py-6">
                        <Progress
                            type="circle"
                            percent={Math.min(goal.progressPercentage, 100)}
                            strokeColor={goal.color || '#1890ff'}
                            size={120}
                            format={() => (
                                <div className="text-center">
                                    <span className="block text-2xl font-semibold text-blue-500">{goal.totalValue}</span>
                                    <span className="text-xs text-gray-400">/ {goal.targetValue}{goal.targetUnit || ''}</span>
                                </div>
                            )}
                        />
                    </div>
                ) : null}

                <div className="grid grid-cols-3 gap-4 my-6 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                        <FireOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                        <div className="flex flex-col">
                            <span className="text-xl font-semibold text-white">{goal.currentStreak}</span>
                            <span className="text-xs text-white/60">连续天数</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <CalendarOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <div className="flex flex-col">
                            <span className="text-xl font-semibold text-white">{goal.totalCheckInDays}</span>
                            <span className="text-xs text-white/60">总打卡天数</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <TrophyOutlined style={{ fontSize: 24, color: '#faad14' }} />
                        <div className="flex flex-col">
                            <span className="text-xl font-semibold text-white">{goal.longestStreak}</span>
                            <span className="text-xs text-white/60">最长连续</span>
                        </div>
                    </div>
                </div>

                {goal.status === 'ACTIVE' && (
                    <div className="flex justify-center pt-4">
                        {goal.checkedInToday ? (
                            <div className="flex items-center gap-2">
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                                <Text>今日已打卡</Text>
                                {goal.todayCheckIn && (
                                    <Button
                                        type="link"
                                        onClick={() => handleCheckInClick(dayjs().format('YYYY-MM-DD'))}
                                    >
                                        修改
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => handleCheckInClick()}
                            >
                                打卡
                            </Button>
                        )}
                    </div>
                )}
            </Card>

            <Card
                title={
                    <Space>
                        <CalendarOutlined />
                        打卡日历
                    </Space>
                }
                className="mb-4"
            >
                <Calendar
                    fullscreen={false}
                    value={currentMonth}
                    onChange={(date) => setCurrentMonth(date)}
                    cellRender={(current, info) => {
                        if (info.type === 'date') {
                            return dateCellRender(current);
                        }
                        return info.originNode;
                    }}
                />
            </Card>

            {goal.milestones && goal.milestones.length > 0 && (
                <Card
                    title={
                        <Space>
                            <TrophyOutlined />
                            里程碑
                        </Space>
                    }
                    className="mb-4"
                >
                    <List
                        dataSource={goal.milestones}
                        renderItem={(milestone) => (
                            <List.Item>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex-shrink-0">
                                            {milestone.isUnlocked ? (
                                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                                            ) : (
                                                <LockOutlined style={{ color: '#8c8c8c', fontSize: 24 }} />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <Text strong className={milestone.isUnlocked ? 'text-green-500' : ''}>
                                                {milestone.icon} {milestone.name}
                                            </Text>
                                            <Text type="secondary" className="text-xs">
                                                {milestone.conditionDescription}
                                            </Text>
                                        </div>
                                        <div className="flex-shrink-0 text-xs">
                                            {milestone.isUnlocked ? (
                                                <Text type="success">
                                                    {dayjs(milestone.unlockedAt).format('YYYY-MM-DD')} 解锁
                                                </Text>
                                            ) : milestone.remainingValue !== undefined && milestone.remainingValue > 0 ? (
                                                <Text type="secondary">
                                                    还需 {milestone.remainingValue}
                                                </Text>
                                            ) : null}
                                        </div>
                                    </div>
                                    {/* 二期功能：显示关联内容 */}
                                    {milestone.isUnlocked && (milestone.generatedArticle || milestone.linkedArticle || milestone.linkedProduct) && (
                                        <div className="ml-10 pt-3 border-t border-white/10">
                                            {/* 关联商品 - 卡片式展示 */}
                                            {milestone.linkedProduct && (
                                                <div
                                                    className="mb-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.08)',
                                                        border: '1px solid rgba(255, 255, 255, 0.15)'
                                                    }}
                                                    onClick={() => navigate(`/products/${milestone.linkedProduct!.slug}`)}
                                                >
                                                    <div className="flex gap-3">
                                                        {milestone.linkedProduct.coverImage && (
                                                            <img
                                                                src={milestone.linkedProduct.coverImage}
                                                                alt={milestone.linkedProduct.title}
                                                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <ShoppingOutlined style={{ color: '#fa8c16' }} />
                                                                <span className="text-xs text-white/50">解锁奖励商品</span>
                                                            </div>
                                                            <Text strong className="text-white block truncate">
                                                                {milestone.linkedProduct.title}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* 关联文章 */}
                                            <div className="flex flex-wrap gap-2">
                                                {milestone.generatedArticle && (
                                                    <Tag
                                                        icon={<FileTextOutlined />}
                                                        color="blue"
                                                        className="cursor-pointer"
                                                        onClick={() => navigate(`/articles/${milestone.generatedArticle!.slug}`)}
                                                    >
                                                        查看记录文章
                                                    </Tag>
                                                )}
                                                {milestone.linkedArticle && (
                                                    <Tag
                                                        icon={<LinkOutlined />}
                                                        color="cyan"
                                                        className="cursor-pointer"
                                                        onClick={() => navigate(`/articles/${milestone.linkedArticle!.slug}`)}
                                                    >
                                                        {milestone.linkedArticle.title}
                                                    </Tag>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* 未解锁时显示自动创建文章提示 */}
                                    {!milestone.isUnlocked && milestone.autoCreateArticle && (
                                        <div className="ml-10">
                                            <Text type="secondary" className="text-xs">
                                                <FileTextOutlined style={{ marginRight: 4 }} />
                                                解锁时将自动创建文章记录
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {goal.linkedTodos && goal.linkedTodos.length > 0 && (
                <Card title="关联待办" className="mb-4">
                    <List
                        size="small"
                        dataSource={goal.linkedTodos}
                        renderItem={(todo) => (
                            <List.Item>
                                <Space>
                                    {todo.isCompleted ? (
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    ) : (
                                        <span className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full inline-block" />
                                    )}
                                    <Text delete={todo.isCompleted}>{todo.title}</Text>
                                </Space>
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {goal.recentCheckIns && goal.recentCheckIns.length > 0 && (
                <Card title="最近打卡" className="mb-4">
                    <List
                        size="small"
                        dataSource={goal.recentCheckIns}
                        renderItem={(record) => (
                            <List.Item>
                                <div className="flex items-center gap-3 w-full">
                                    <div className="flex flex-col min-w-[50px]">
                                        <Text strong>{dayjs(record.checkInDate).format('MM-DD')}</Text>
                                        <Text type="secondary" className="text-xs">
                                            {record.isToday ? '今天' : dayjs(record.checkInDate).format('ddd')}
                                        </Text>
                                    </div>
                                    {isAccumulate && record.value !== undefined && (
                                        <Tag color="blue">{record.value}{goal.targetUnit || ''}</Tag>
                                    )}
                                    {record.mood && <span>{record.mood}</span>}
                                    {record.note && (
                                        <Text type="secondary" ellipsis className="flex-1 max-w-[200px]">
                                            {record.note}
                                        </Text>
                                    )}
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            <CheckInDialog
                open={checkInDialogOpen}
                goal={goal}
                selectedDate={selectedDate}
                onCancel={() => {
                    setCheckInDialogOpen(false);
                    setSelectedDate(undefined);
                }}
                onSuccess={handleCheckInSuccess}
            />
        </div>
    );
};

export default GoalDetailPage;
