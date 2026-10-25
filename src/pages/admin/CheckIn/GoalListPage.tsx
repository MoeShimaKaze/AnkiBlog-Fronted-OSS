import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Button,
    Space,
    Tag,
    Progress,
    Empty,
    Spin,
    Select,
    message,
    Modal,
    Dropdown,
    Tooltip,
    ConfigProvider
} from 'antd';
import {
    PlusOutlined,
    FireOutlined,
    CheckCircleOutlined,
    PauseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    AppstoreOutlined,
    FolderOutlined,
    ClearOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Goal, GoalCategory, GoalStatus } from '@/types/checkIn';
import { GOAL_STATUS_CONFIG, GOAL_TYPE_CONFIG } from '@/types/checkIn';
import {
    getGoals,
    getGoalCategories,
    deleteGoal,
    pauseGoal,
    resumeGoal,
    archiveGoal
} from '@/services/checkInService';

// 玻璃态主题配置
const glassTheme = {
    token: {
        colorText: 'rgba(255, 255, 255, 0.9)',
        colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
        colorBgElevated: 'rgba(35, 35, 45, 0.85)',
        borderRadius: 8,
    },
    components: {
        Select: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            optionSelectedBg: 'rgba(255, 255, 255, 0.2)',
        },
    },
};

const GoalListPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [categories, setCategories] = useState<GoalCategory[]>([]);
    const [statusFilter, setStatusFilter] = useState<GoalStatus | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [goalsRes, categoriesRes] = await Promise.all([
                getGoals({ status: statusFilter, categoryId: categoryFilter }),
                getGoalCategories()
            ]);

            if (goalsRes.success) {
                setGoals(goalsRes.data || []);
            }
            if (categoriesRes.success) {
                setCategories(categoriesRes.data || []);
            }
        } catch (error) {
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, categoryFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (goal: Goal) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除目标「${goal.name}」吗？所有打卡记录和里程碑也将被删除。`,
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const res = await deleteGoal(goal.id);
                    if (res.success) {
                        message.success('删除成功');
                        fetchData();
                    }
                } catch (error) {
                    message.error('删除失败');
                }
            }
        });
    };

    const handlePause = async (goal: Goal) => {
        try {
            const res = await pauseGoal(goal.id);
            if (res.success) {
                message.success('已暂停');
                fetchData();
            }
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleResume = async (goal: Goal) => {
        try {
            const res = await resumeGoal(goal.id);
            if (res.success) {
                message.success('已恢复');
                fetchData();
            }
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleArchive = async (goal: Goal) => {
        try {
            const res = await archiveGoal(goal.id);
            if (res.success) {
                message.success('已归档');
                fetchData();
            }
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleClearFilters = () => {
        setStatusFilter(undefined);
        setCategoryFilter(undefined);
    };

    const hasActiveFilters = statusFilter !== undefined || categoryFilter !== undefined;

    const getDropdownItems = (goal: Goal) => {
        const items = [
            {
                key: 'edit',
                label: '编辑',
                icon: <EditOutlined />,
                onClick: () => navigate(`/admin/check-in/goals/${goal.id}/edit`)
            }
        ];

        if (goal.status === 'ACTIVE') {
            items.push({
                key: 'pause',
                label: '暂停',
                icon: <PauseCircleOutlined />,
                onClick: () => handlePause(goal)
            });
        } else if (goal.status === 'PAUSED') {
            items.push({
                key: 'resume',
                label: '恢复',
                icon: <CheckCircleOutlined />,
                onClick: () => handleResume(goal)
            });
        }

        if (goal.status !== 'ARCHIVED') {
            items.push({
                key: 'archive',
                label: '归档',
                icon: <FolderOutlined />,
                onClick: () => handleArchive(goal)
            });
        }

        items.push({
            key: 'delete',
            label: '删除',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(goal)
        } as any);

        return items;
    };

    const renderGoalCard = (goal: Goal) => {
        const statusConfig = GOAL_STATUS_CONFIG[goal.status];
        const isAccumulate = goal.goalType === 'ACCUMULATE';

        return (
            <Card
                key={goal.id}
                hoverable
                onClick={() => navigate(`/admin/check-in/goals/${goal.id}`)}
                className="glass-effect border-0 cursor-pointer transition-all hover:shadow-lg"
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 flex-1">
                        <span style={{ fontSize: 32, lineHeight: 1 }}>{goal.icon || '🎯'}</span>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold text-base m-0 mb-1">{goal.name}</h3>
                            <div className="flex flex-wrap gap-1 items-center">
                                <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                                {goal.categoryName && <Tag>{goal.categoryName}</Tag>}
                                <span className="text-xs text-white/60">
                                    {GOAL_TYPE_CONFIG[goal.goalType].label}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Dropdown
                        menu={{ items: getDropdownItems(goal) }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        />
                    </Dropdown>
                </div>

                {isAccumulate && goal.targetValue ? (
                    <div className="mb-3">
                        <Progress
                            percent={Math.min(goal.progressPercentage, 100)}
                            strokeColor={goal.color || '#1890ff'}
                            format={() => `${goal.totalValue}/${goal.targetValue}${goal.targetUnit || ''}`}
                        />
                    </div>
                ) : null}

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <div className="flex gap-4 flex-wrap">
                        <Tooltip title="连续天数">
                            <span className="flex items-center gap-1 text-sm text-white/70">
                                <FireOutlined style={{ color: '#ff4d4f' }} />
                                <span>{goal.currentStreak}天</span>
                            </span>
                        </Tooltip>
                        <span className="text-sm text-white/70">
                            总计 {goal.totalCheckInDays} 天
                        </span>
                        {goal.milestoneCount > 0 && (
                            <span className="text-sm text-white/70">
                                🏆 {goal.unlockedMilestoneCount}/{goal.milestoneCount}
                            </span>
                        )}
                    </div>
                    <div>
                        {goal.checkedInToday ? (
                            <Tag color="success" icon={<CheckCircleOutlined />}>
                                今日已打卡
                            </Tag>
                        ) : goal.status === 'ACTIVE' ? (
                            <Button
                                type="primary"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/check-in/goals/${goal.id}`);
                                }}
                            >
                                打卡
                            </Button>
                        ) : null}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            {/* 页面标题 */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-white text-2xl font-bold m-0">打卡目标</h1>
                <Space>
                    <Button
                        icon={<AppstoreOutlined />}
                        onClick={() => navigate('/admin/check-in/categories')}
                    >
                        管理分类
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/admin/check-in/goals/new')}
                    >
                        新建目标
                    </Button>
                </Space>
            </div>

            {/* 筛选栏 - 玻璃拟态风格 */}
            <ConfigProvider theme={glassTheme}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: 16,
                    marginBottom: 16,
                }}>
                    <div className="flex justify-between items-center flex-wrap gap-3">
                        <Space size="middle" wrap>
                            <Select
                                placeholder="状态筛选"
                                allowClear
                                style={{ width: 140 }}
                                value={statusFilter}
                                onChange={setStatusFilter}
                            >
                                {Object.entries(GOAL_STATUS_CONFIG).map(([key, config]) => (
                                    <Select.Option key={key} value={key}>
                                        <Tag color={config.color} style={{ marginRight: 4 }}>{config.label}</Tag>
                                    </Select.Option>
                                ))}
                            </Select>
                            <Select
                                placeholder="分类筛选"
                                allowClear
                                style={{ width: 160 }}
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                            >
                                {categories.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.icon || '📁'} {c.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Space>

                        <Space>
                            {hasActiveFilters && (
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={handleClearFilters}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                    }}
                                >
                                    清除筛选
                                </Button>
                            )}
                        </Space>
                    </div>
                </div>
            </ConfigProvider>

            {/* 目标卡片列表 */}
            <Spin spinning={loading}>
                {goals.length === 0 ? (
                    <div className="glass-effect border-0" style={{ borderRadius: 12, padding: 60 }}>
                        <Empty
                            description={<span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>暂无目标</span>}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/admin/check-in/goals/new')}
                            >
                                创建第一个目标
                            </Button>
                        </Empty>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: 16
                    }}>
                        {goals.map(renderGoalCard)}
                    </div>
                )}
            </Spin>
        </div>
    );
};

export default GoalListPage;
