/**
 * 通知渠道配置表格组件
 */
import React, { useState, useEffect } from 'react';
import { Card, Table, Switch, Space, Tag, message, Spin, Tooltip, Typography } from 'antd';
import { MailOutlined, DingdingOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
    NotificationChannelConfig,
    NotificationType,
    NOTIFICATION_TYPE_CONFIG,
    getNotificationCategories,
} from '@/types/notification';
import notificationService from '@/services/notificationService';

const { Text } = Typography;

interface NotificationChannelTableProps {
    dingtalkEnabled: boolean;
}

const NotificationChannelTable: React.FC<NotificationChannelTableProps> = ({ dingtalkEnabled }) => {
    const [channels, setChannels] = useState<NotificationChannelConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            const res = await notificationService.getAllChannelConfigs();
            if (res.success) {
                setChannels(res.data);
            }
        } catch (error) {
            message.error('加载渠道配置失败');
        } finally {
            setLoading(false);
        }
    };

    const handleChannelToggle = async (
        type: NotificationType,
        channel: 'email' | 'dingtalk',
        enabled: boolean
    ) => {
        const configKey = `${type}-${channel}`;
        setUpdating(configKey);

        try {
            const currentConfig = channels.find(c => c.notificationType === type);
            const res = await notificationService.updateChannelConfig(type, {
                notificationType: type,
                emailEnabled: channel === 'email' ? enabled : currentConfig?.emailEnabled,
                dingtalkEnabled: channel === 'dingtalk' ? enabled : currentConfig?.dingtalkEnabled,
            });

            if (res.success) {
                setChannels(prev =>
                    prev.map(c => c.notificationType === type ? res.data : c)
                );
                message.success('渠道配置已更新');
            }
        } catch (error) {
            message.error('更新失败');
        } finally {
            setUpdating(null);
        }
    };

    // 按分类分组
    const categories = getNotificationCategories();

    const columns = [
        {
            title: '通知类型',
            dataIndex: 'notificationType',
            key: 'type',
            render: (type: NotificationType) => {
                const config = NOTIFICATION_TYPE_CONFIG[type];
                return (
                    <Space>
                        <span className="text-lg">{config?.icon}</span>
                        <span className="text-white">{config?.label || type}</span>
                    </Space>
                );
            },
        },
        {
            title: (
                <Space>
                    <MailOutlined className="text-blue-400" />
                    <span className="text-white">邮件</span>
                </Space>
            ),
            dataIndex: 'emailEnabled',
            key: 'email',
            width: 100,
            align: 'center' as const,
            render: (enabled: boolean, record: NotificationChannelConfig) => (
                <Switch
                    checked={enabled}
                    onChange={(checked) => handleChannelToggle(record.notificationType, 'email', checked)}
                    loading={updating === `${record.notificationType}-email`}
                    size="small"
                />
            ),
        },
        {
            title: (
                <Space>
                    <DingdingOutlined className="text-blue-400" />
                    <span className="text-white">钉钉</span>
                    {!dingtalkEnabled && (
                        <Tooltip title="钉钉服务未启用">
                            <InfoCircleOutlined className="text-yellow-500" />
                        </Tooltip>
                    )}
                </Space>
            ),
            dataIndex: 'dingtalkEnabled',
            key: 'dingtalk',
            width: 100,
            align: 'center' as const,
            render: (enabled: boolean, record: NotificationChannelConfig) => (
                <Tooltip title={!dingtalkEnabled ? '请先启用钉钉服务' : undefined}>
                    <Switch
                        checked={enabled}
                        onChange={(checked) => handleChannelToggle(record.notificationType, 'dingtalk', checked)}
                        loading={updating === `${record.notificationType}-dingtalk`}
                        disabled={!dingtalkEnabled}
                        size="small"
                    />
                </Tooltip>
            ),
        },
    ];

    if (loading) {
        return (
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                <div className="flex justify-center items-center py-8">
                    <Spin tip="加载中..." />
                </div>
            </Card>
        );
    }

    return (
        <Card
            title={
                <Space>
                    <SettingOutlined className="text-purple-500" />
                    <span className="text-white">通知渠道配置</span>
                </Space>
            }
            extra={
                <Text className="text-white/60 text-sm">
                    共 {channels.length} 种通知类型
                </Text>
            }
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
        >
            <div className="text-white/60 text-sm mb-4">
                为每种通知类型独立配置推送渠道，开启对应开关即可启用该渠道的推送
            </div>

            {categories.map(category => {
                const categoryChannels = channels.filter(
                    c => NOTIFICATION_TYPE_CONFIG[c.notificationType]?.category === category
                );

                if (categoryChannels.length === 0) return null;

                const config = Object.values(NOTIFICATION_TYPE_CONFIG).find(c => c.category === category);

                return (
                    <div key={category} className="mb-6">
                        <Tag
                            color={config?.color || 'blue'}
                            className="mb-3 px-3 py-1"
                        >
                            {category}
                        </Tag>
                        <Table
                            dataSource={categoryChannels}
                            columns={columns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            className="notification-channel-table"
                            rowClassName={() => 'bg-white/5 hover:bg-white/10'}
                        />
                    </div>
                );
            })}

            <style>{`
                .notification-channel-table .ant-table {
                    background: transparent;
                }
                .notification-channel-table .ant-table-thead > tr > th {
                    background: rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .notification-channel-table .ant-table-tbody > tr > td {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .notification-channel-table .ant-table-tbody > tr:hover > td {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </Card>
    );
};

export default NotificationChannelTable;
