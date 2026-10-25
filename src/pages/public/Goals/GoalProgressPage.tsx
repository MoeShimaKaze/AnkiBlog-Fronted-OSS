import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Empty, Statistic, ConfigProvider } from 'antd';
import {
    FireOutlined,
    TrophyOutlined,
    CalendarOutlined,
    StarOutlined,
    AimOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import Navbar from '@/components/Common/Navbar';
import GoalCard from '@/components/Goal/GoalCard';
import type { Goal, PublicGoalSummary } from '@/types/checkIn';
import { getPublicGoals, getPublicGoalSummary } from '@/services/checkInService';
import { glassCardStyle, primaryTextStyle } from '@/constants/styles';

// 暗色玻璃拟态主题配置
const darkGlassTheme = {
    token: {
        colorText: 'rgba(255, 255, 255, 0.9)',
        colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
        colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
        colorTextDescription: 'rgba(255, 255, 255, 0.6)',
        colorBgContainer: 'rgba(35, 35, 35, 0.65)',
        colorBgElevated: 'rgba(35, 35, 45, 0.95)',
        colorBorder: 'rgba(255, 255, 255, 0.2)',
        colorBorderSecondary: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    components: {
        Card: {
            colorBgContainer: 'transparent',
            colorBorderSecondary: 'transparent',
        },
        Statistic: {
            colorTextDescription: 'rgba(255, 255, 255, 0.6)',
        },
        Empty: {
            colorText: 'rgba(255, 255, 255, 0.45)',
            colorTextDescription: 'rgba(255, 255, 255, 0.45)',
        },
        Spin: {
            colorPrimary: '#667eea',
        },
    },
};

const GoalProgressPage: React.FC = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [summary, setSummary] = useState<PublicGoalSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [goalsRes, summaryRes] = await Promise.all([
                getPublicGoals('ACTIVE'),
                getPublicGoalSummary()
            ]);

            if (goalsRes.success) {
                setGoals(goalsRes.data);
            }
            if (summaryRes.success) {
                setSummary(summaryRes.data);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: '活跃目标',
            value: summary?.activeGoalCount || 0,
            icon: <AimOutlined style={{ fontSize: 24, color: '#3b82f6' }} />,
            color: '#3b82f6'
        },
        {
            title: '总打卡天数',
            value: summary?.totalCheckInDays || 0,
            suffix: '天',
            icon: <CalendarOutlined style={{ fontSize: 24, color: '#4ade80' }} />,
            color: '#4ade80'
        },
        {
            title: '最长连续',
            value: summary?.maxLongestStreak || 0,
            suffix: '天',
            icon: <FireOutlined style={{ fontSize: 24, color: '#f59e0b' }} />,
            color: '#f59e0b'
        },
        {
            title: '本月打卡',
            value: summary?.thisMonthCheckIns || 0,
            suffix: '次',
            icon: <TrophyOutlined style={{ fontSize: 24, color: '#ec4899' }} />,
            color: '#ec4899'
        }
    ];

    return (
        <ConfigProvider theme={darkGlassTheme}>
            <div style={{
                minHeight: '100vh',
                backgroundImage: `url('/background_placeholder.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}>
                {/* Overlay */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(102, 126, 234, 0.4)',
                    backdropFilter: 'blur(1px)',
                    zIndex: 0
                }} />

                {/* Navbar */}
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <Navbar />
                </div>

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    maxWidth: 1200,
                    margin: '0 auto',
                    padding: '40px 24px'
                }}>
                    {/* Page Title */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: 40
                    }}>
                        <h1 style={{
                            ...primaryTextStyle,
                            fontSize: 36,
                            fontWeight: 700,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            marginBottom: 12
                        }}>
                            <AimOutlined style={{ marginRight: 12 }} />
                            打卡进度
                        </h1>
                        <p style={{
                            fontSize: 16,
                            color: 'rgba(255, 255, 255, 0.7)',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                        }}>
                            记录每一天的努力，见证成长的轨迹
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                        {statCards.map((stat, index) => (
                            <Col xs={12} sm={6} key={index}>
                                <Card
                                    style={{
                                        ...glassCardStyle,
                                        borderRadius: 16,
                                        textAlign: 'center'
                                    }}
                                    styles={{ body: { padding: '20px 16px' } }}
                                >
                                    <div style={{ marginBottom: 12 }}>
                                        {stat.icon}
                                    </div>
                                    <Statistic
                                        value={stat.value}
                                        suffix={stat.suffix}
                                        valueStyle={{
                                            color: stat.color,
                                            fontSize: 28,
                                            fontWeight: 700
                                        }}
                                    />
                                    <div style={{
                                        fontSize: 12,
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        marginTop: 4
                                    }}>
                                        {stat.title}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Milestones Summary */}
                    {summary && summary.totalMilestoneCount > 0 && (
                        <Card
                            style={{
                                ...glassCardStyle,
                                borderRadius: 16,
                                marginBottom: 32
                            }}
                            styles={{ body: { padding: '20px 24px' } }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 16,
                                flexWrap: 'wrap'
                            }}>
                                <StarOutlined style={{
                                    fontSize: 24,
                                    color: '#fbbf24'
                                }} />
                                <span style={{
                                    fontSize: 16,
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}>
                                    里程碑进度
                                </span>
                                <span style={{
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: '#fbbf24'
                                }}>
                                    {summary.unlockedMilestoneCount}
                                </span>
                                <span style={{
                                    fontSize: 14,
                                    color: 'rgba(255, 255, 255, 0.5)'
                                }}>
                                    / {summary.totalMilestoneCount}
                                </span>
                                <div style={{
                                    display: 'flex',
                                    gap: 4,
                                    marginLeft: 8
                                }}>
                                    {Array.from({ length: Math.min(summary.totalMilestoneCount, 10) }).map((_, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                fontSize: 16,
                                                opacity: i < summary.unlockedMilestoneCount ? 1 : 0.3
                                            }}
                                        >
                                            ⭐
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Goals Grid */}
                    {loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 0'
                        }}>
                            <Spin
                                indicator={<LoadingOutlined style={{ fontSize: 40, color: '#667eea' }} spin />}
                            />
                            <div style={{
                                marginTop: 16,
                                color: 'rgba(255, 255, 255, 0.6)'
                            }}>
                                加载中...
                            </div>
                        </div>
                    ) : goals.length === 0 ? (
                        <Card style={glassCardStyle}>
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                        暂无公开的打卡目标
                                    </span>
                                }
                                style={{ padding: '40px 0' }}
                            />
                        </Card>
                    ) : (
                        <Row gutter={[24, 24]}>
                            {goals.map(goal => (
                                <Col xs={24} sm={12} lg={8} key={goal.id}>
                                    <GoalCard
                                        goal={goal}
                                        onCheckInSuccess={loadData}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
};

export default GoalProgressPage;
