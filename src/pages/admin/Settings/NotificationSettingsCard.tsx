/**
 * 通知设置总入口组件
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import {
    MailOutlined,
    DingdingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SendOutlined,
} from '@ant-design/icons';
import DingtalkConfigCard from './DingtalkConfigCard';
import NotificationChannelTable from './NotificationChannelTable';
import { NotificationStats } from '@/types/notification';
import notificationService from '@/services/notificationService';

const NotificationSettingsCard: React.FC = () => {
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [dingtalkEnabled, setDingtalkEnabled] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await notificationService.getNotificationStats();
            if (res.success) {
                setStats(res.data);
                setDingtalkEnabled(res.data.dingtalkServiceEnabled);
            }
        } catch (error) {
            console.error('获取统计信息失败', error);
        }
    };

    const handleDingtalkConfigChange = (enabled: boolean) => {
        setDingtalkEnabled(enabled);
        fetchStats(); // 刷新统计
    };

    return (
        <Row gutter={[24, 24]} justify="center">
            <Col xs={24} lg={20} xl={18}>
                {/* 统计卡片 */}
                {stats && (
                    <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6">
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title={<span className="text-white/70">今日发送</span>}
                                    value={stats.todayCount}
                                    prefix={<SendOutlined className="text-blue-400" />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title={<span className="text-white/70">邮件渠道</span>}
                                    value={stats.emailEnabledTypes}
                                    suffix={`/ ${stats.emailEnabledTypes + stats.dingtalkEnabledTypes || 23}`}
                                    prefix={<MailOutlined className="text-green-400" />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title={<span className="text-white/70">钉钉渠道</span>}
                                    value={stats.dingtalkEnabledTypes}
                                    suffix="种类型"
                                    prefix={<DingdingOutlined className="text-blue-400" />}
                                    valueStyle={{ color: dingtalkEnabled ? '#fff' : '#ffffff60' }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title={<span className="text-white/70">成功率</span>}
                                    value={stats.totalCount > 0
                                        ? Math.round((stats.successCount / stats.totalCount) * 100)
                                        : 100}
                                    suffix="%"
                                    prefix={
                                        stats.successCount >= stats.failedCount
                                            ? <CheckCircleOutlined className="text-green-400" />
                                            : <CloseCircleOutlined className="text-red-400" />
                                    }
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                )}

                {/* 钉钉配置 */}
                <DingtalkConfigCard onConfigChange={handleDingtalkConfigChange} />

                {/* 渠道配置表格 */}
                <NotificationChannelTable dingtalkEnabled={dingtalkEnabled} />
            </Col>
        </Row>
    );
};

export default NotificationSettingsCard;
