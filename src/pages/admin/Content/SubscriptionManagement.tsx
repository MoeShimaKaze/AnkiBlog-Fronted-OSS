import React, { useState, useCallback } from 'react';
import {
    Table, Button, Input, Space, Tag, Modal, Tooltip, Card,
    Pagination, Select, Form, Dropdown, Statistic, Row, Col, Badge
} from 'antd';
import {
    BellOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
    MailOutlined, FilterOutlined,
    UserOutlined, SettingOutlined, SendOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useAdminSubscriptions, useSubscriptionStats, useNotificationSender } from '@/hooks/api/useSubscription';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import {
    type Subscription,
    SubscriptionType,
    SubscriptionStatus,
    SUBSCRIPTION_TYPE_CONFIG,
    getAdminSubscriptionTypes,
    getUserSubscriptionTypes,
    getSubscriptionStatusText,
    getSubscriptionStatusColor,
    type SubscriptionCreateRequest,
    type SubscriptionUpdateRequest,
    type NotificationRequest
} from '@/types/subscription';
import VerificationModal from '@/components/Common/VerificationModal';

const { Option } = Select;
const { TextArea } = Input;

// 操作类型枚举
enum ActionType {
    DELETE = 'delete',
    BATCH_ACTIVATE = 'batch_activate',
    BATCH_PAUSE = 'batch_pause',
    BATCH_UNSUBSCRIBE = 'batch_unsubscribe'
}

const AdminSubscriptionManagement: React.FC = () => {
    usePageTitle('订阅管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    });

    const {
        subscriptions,
        loading,
        total,
        currentPage,
        pageSize,
        filters,
        createSubscription,
        updateSubscription,
        deleteSubscription,
        batchUpdateStatus,
        searchSubscriptions,
        filterByStatus,
        filterByType,
        clearFilters,
        setCurrentPage,
        setPageSize
    } = useAdminSubscriptions();

    const { stats } = useSubscriptionStats();
    const { sending, sendNotification } = useNotificationSender();

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [notifyModalVisible, setNotifyModalVisible] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);

    // 确认操作模态框状态
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<{
        type: ActionType;
        subscription?: Subscription;
        selectedKeys?: React.Key[];
        targetStatus?: SubscriptionStatus;
    } | null>(null);

    const [createForm] = Form.useForm<SubscriptionCreateRequest>();
    const [editForm] = Form.useForm<SubscriptionUpdateRequest>();
    const [notifyForm] = Form.useForm<NotificationRequest>();

    const handleCreate = useCallback(async () => {
        try {
            const values = await createForm.validateFields();
            await createSubscription(values);
            setCreateModalVisible(false);
            createForm.resetFields();
        } catch (error) {
            console.error('创建订阅失败:', error);
        }
    }, [createForm, createSubscription]);

    const handleEdit = useCallback(async () => {
        try {
            const values = await editForm.validateFields();
            if (currentSubscription) {
                await updateSubscription(currentSubscription.id, values);
                setEditModalVisible(false);
                setCurrentSubscription(null);
                editForm.resetFields();
            }
        } catch (error) {
            console.error('更新订阅失败:', error);
        }
    }, [editForm, currentSubscription, updateSubscription]);

    // 显示确认操作模态框
    const showConfirmModal = (type: ActionType, subscription?: Subscription, targetStatus?: SubscriptionStatus) => {
        setCurrentAction({
            type,
            subscription,
            selectedKeys: selectedRowKeys,
            targetStatus
        });
        setConfirmModalVisible(true);
    };

    // 执行确认操作
    const handleConfirmAction = async () => {
        if (!currentAction) return;

        const { type, subscription, selectedKeys, targetStatus } = currentAction;
        setConfirmLoading(true);

        try {
            switch (type) {
                case ActionType.DELETE:
                    if (subscription) {
                        await deleteSubscription(subscription.id);
                    }
                    break;
                case ActionType.BATCH_ACTIVATE:
                case ActionType.BATCH_PAUSE:
                case ActionType.BATCH_UNSUBSCRIBE:
                    if (selectedKeys && targetStatus) {
                        await batchUpdateStatus(selectedKeys as string[], targetStatus);
                        setSelectedRowKeys([]);
                    }
                    break;
            }
            setConfirmModalVisible(false);
            setCurrentAction(null);
        } catch (error) {
            console.error('操作失败:', error);
        } finally {
            setConfirmLoading(false);
        }
    };

    // 取消确认操作
    const handleCancelConfirm = () => {
        setConfirmModalVisible(false);
        setCurrentAction(null);
    };

    const handleDelete = useCallback((subscription: Subscription) => {
        showConfirmModal(ActionType.DELETE, subscription);
    }, []);

    const handleBatchAction = useCallback((action: string) => {
        if (selectedRowKeys.length === 0) {
            Modal.warning({ content: '请选择要操作的订阅' });
            return;
        }

        let actionType: ActionType;
        let status: SubscriptionStatus;

        switch (action) {
            case 'activate':
                actionType = ActionType.BATCH_ACTIVATE;
                status = SubscriptionStatus.ACTIVE;
                break;
            case 'pause':
                actionType = ActionType.BATCH_PAUSE;
                status = SubscriptionStatus.PAUSED;
                break;
            case 'unsubscribe':
                actionType = ActionType.BATCH_UNSUBSCRIBE;
                status = SubscriptionStatus.UNSUBSCRIBED;
                break;
            default:
                return;
        }

        showConfirmModal(actionType, undefined, status);
    }, [selectedRowKeys]);

    const handleSendNotification = useCallback(async () => {
        try {
            const values = await notifyForm.validateFields();
            await sendNotification(values);
            setNotifyModalVisible(false);
            notifyForm.resetFields();
        } catch (error) {
            console.error('发送通知失败:', error);
        }
    }, [notifyForm, sendNotification]);

    // 获取确认模态框内容
    const getConfirmModalContent = () => {
        if (!currentAction) return null;

        const { type, subscription, selectedKeys } = currentAction;

        switch (type) {
            case ActionType.DELETE:
                return {
                    title: '确认删除订阅',
                    content: subscription && (
                        <div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>邮箱：</strong>{subscription.email}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>订阅类型：</strong>{SUBSCRIPTION_TYPE_CONFIG[subscription.subscriptionType].description}
                            </p>
                            {subscription.subscriberName && (
                                <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 16px 0' }}>
                                    <strong>订阅者：</strong>{subscription.subscriberName}
                                </p>
                            )}
                            <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>
                                ⚠️ 此操作不可撤销
                            </p>
                        </div>
                    ),
                    okText: '确认删除',
                    danger: true
                };
            case ActionType.BATCH_ACTIVATE:
                return {
                    title: '批量激活订阅',
                    content: (
                        <div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 16px 0' }}>
                                即将激活 <strong>{selectedKeys?.length}</strong> 个订阅
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontSize: '14px' }}>
                                💡 激活后用户将能收到相应类型的通知
                            </p>
                        </div>
                    ),
                    okText: '确认激活',
                    danger: false
                };
            case ActionType.BATCH_PAUSE:
                return {
                    title: '批量暂停订阅',
                    content: (
                        <div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 16px 0' }}>
                                即将暂停 <strong>{selectedKeys?.length}</strong> 个订阅
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontSize: '14px' }}>
                                ⏸️ 暂停后用户将临时停止接收通知
                            </p>
                        </div>
                    ),
                    okText: '确认暂停',
                    danger: false
                };
            case ActionType.BATCH_UNSUBSCRIBE:
                return {
                    title: '批量取消订阅',
                    content: (
                        <div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 16px 0' }}>
                                即将取消 <strong>{selectedKeys?.length}</strong> 个订阅
                            </p>
                            <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>
                                🚫 取消后用户将不再接收任何通知
                            </p>
                        </div>
                    ),
                    okText: '确认取消',
                    danger: true
                };
            default:
                return null;
        }
    };

    const batchActionItems: MenuProps['items'] = [
        {
            key: 'activate',
            label: '批量激活',
            icon: <BellOutlined />,
            onClick: () => handleBatchAction('activate'),
        },
        {
            key: 'pause',
            label: '批量暂停',
            icon: <SettingOutlined />,
            onClick: () => handleBatchAction('pause'),
        },
        {
            key: 'unsubscribe',
            label: '批量取消',
            icon: <DeleteOutlined />,
            onClick: () => handleBatchAction('unsubscribe'),
        },
    ];

    const columns: ColumnsType<Subscription> = [
        {
            title: '订阅者',
            dataIndex: 'email',
            key: 'email',
            render: (email: string, record: Subscription) => (
                <Space direction="vertical" size={0}>
                    <div className="font-medium text-white">{email}</div>
                    {record.subscriberName && (
                        <div className="text-xs text-white/60">
                            {record.subscriberName}
                        </div>
                    )}
                </Space>
            ),
        },
        {
            title: '订阅类型',
            dataIndex: 'subscriptionType',
            key: 'subscriptionType',
            width: 200,
            render: (type: SubscriptionType) => {
                const config = SUBSCRIPTION_TYPE_CONFIG[type];
                return (
                    <Space>
                        <span>{config.icon}</span>
                        <span style={{ color: config.color }}>{config.description}</span>
                    </Space>
                );
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            align: 'center',
            render: (status: SubscriptionStatus) => (
                <Tag color={getSubscriptionStatusColor(status)}>
                    {getSubscriptionStatusText(status)}
                </Tag>
            ),
        },
        {
            title: '通知次数',
            dataIndex: 'notificationCount',
            key: 'notificationCount',
            width: 100,
            align: 'center',
            render: (count: number) => (
                <Badge count={count} color="blue" />
            ),
        },
        {
            title: '订阅时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            align: 'center',
            render: (time: string) => (
                <span>{new Date(time).toLocaleDateString('zh-CN')}</span>
            ),
        },
        {
            title: '最后通知',
            dataIndex: 'lastNotificationAt',
            key: 'lastNotificationAt',
            width: 150,
            align: 'center',
            render: (time: string | null) => (
                <span>{time ? new Date(time).toLocaleDateString('zh-CN') : '从未通知'}</span>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record: Subscription) => (
                <Space>
                    <Tooltip title="编辑订阅">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            className="hover:bg-blue-500/20 hover:text-blue-400"
                            onClick={() => {
                                setCurrentSubscription(record);
                                editForm.setFieldsValue(record);
                                setEditModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="删除订阅">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            size="small"
                            className="hover:bg-red-500/20"
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const EmptyState = () => (
        <div className="text-center py-20 px-5 bg-white/5 rounded-xl border border-white/10">
            <BellOutlined className="text-5xl text-white/60 mb-6" />
            <h3 className="text-white text-xl font-bold mb-3">暂无订阅记录</h3>
            <p className="text-white/70 text-base leading-relaxed">
                还没有用户订阅通知，鼓励用户订阅以获取最新动态。
            </p>
        </div>
    );

    const confirmModalConfig = getConfirmModalContent();

    // 通用模态框样式
    const modalStyles = {
        mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
        },
        content: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        },
        header: {
            backgroundColor: 'transparent',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        body: {
            backgroundColor: 'transparent',
        },
        footer: {
            backgroundColor: 'transparent',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        },
    };

    return (
        <div className="p-6 min-h-screen">
            {/* 统计卡片 */}
            {stats && (
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                            <Statistic
                                title={<span className="text-white/80">总订阅数</span>}
                                value={stats.totalSubscriptions}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<BellOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                            <Statistic
                                title={<span className="text-white/80">活跃订阅</span>}
                                value={stats.activeSubscriptions}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                            <Statistic
                                title={<span className="text-white/80">待验证</span>}
                                value={stats.pendingSubscriptions}
                                valueStyle={{ color: '#faad14' }}
                                prefix={<MailOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                            <Statistic
                                title={<span className="text-white/80">近期新增</span>}
                                value={stats.recentSubscriptions}
                                valueStyle={{ color: '#722ed1' }}
                                prefix={<PlusOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* 操作栏 */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-white text-3xl font-bold m-0">订阅管理</h1>
                <Space>
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => setNotifyModalVisible(true)}
                        loading={sending}
                        className="bg-gradient-to-r from-green-500 to-blue-600 border-none rounded-lg hover:from-green-600 hover:to-blue-700"
                    >
                        发送通知
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalVisible(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 border-none rounded-lg hover:from-blue-600 hover:to-purple-700"
                    >
                        新增订阅
                    </Button>
                </Space>
            </div>

            {/* 筛选栏 */}
            <Card className="mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                <Space size="middle" wrap>
                    <Input.Search
                        placeholder="搜索邮箱或姓名..."
                        onSearch={searchSubscriptions}
                        style={{ width: 250 }}
                        enterButton
                        allowClear
                        className="custom-search"
                    />
                    <Select
                        placeholder="筛选状态"
                        style={{ width: 150 }}
                        allowClear
                        onChange={filterByStatus}
                        value={filters.status}
                        className="custom-select"
                        dropdownClassName="custom-dropdown"
                    >
                        {Object.values(SubscriptionStatus).map(status => (
                            <Option key={status} value={status}>
                                {getSubscriptionStatusText(status)}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="筛选类型"
                        style={{ width: 200 }}
                        allowClear
                        onChange={filterByType}
                        value={filters.type}
                        className="custom-select"
                        dropdownClassName="custom-dropdown"
                    >
                        {[...getAdminSubscriptionTypes(), ...getUserSubscriptionTypes()].map(type => (
                            <Option key={type} value={type}>
                                {SUBSCRIPTION_TYPE_CONFIG[type].description}
                            </Option>
                        ))}
                    </Select>
                    <Button
                        onClick={clearFilters}
                        icon={<FilterOutlined />}
                        className="border-white/30 text-white hover:bg-white/10"
                    >
                        清除筛选
                    </Button>
                    {selectedRowKeys.length > 0 && (
                        <Dropdown menu={{ items: batchActionItems }}>
                            <Button
                                icon={<SettingOutlined />}
                                className="border-white/30 text-white hover:bg-white/10"
                            >
                                批量操作 ({selectedRowKeys.length})
                            </Button>
                        </Dropdown>
                    )}
                </Space>
            </Card>

            {/* 订阅表格 */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl">
                {subscriptions.length > 0 || loading ? (
                    <>
                        <Table
                            columns={columns}
                            dataSource={subscriptions}
                            loading={loading}
                            rowKey="id"
                            pagination={false}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: setSelectedRowKeys,
                            }}
                            className="bg-transparent custom-table"
                        />
                        {total > 0 && (
                            <div className="pt-6 text-center">
                                <Pagination
                                    current={currentPage}
                                    total={total}
                                    pageSize={pageSize}
                                    showSizeChanger
                                    onChange={setCurrentPage}
                                    onShowSizeChange={(_, size) => setPageSize(size)}
                                    showTotal={(total, range) => (
                                        <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                            第 {range[0]}-{range[1]} 条，共 {total} 条
                                        </span>
                                    )}
                                    className="custom-pagination"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState />
                )}
            </Card>

            {/* 创建订阅弹窗 */}
            <Modal
                title={<span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>创建订阅</span>}
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setCreateModalVisible(false)}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleCreate}
                        loading={loading}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
                    >
                        创建
                    </Button>
                ]}
                styles={modalStyles}
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>邮箱地址</span>}
                        name="email"
                        rules={[
                            { required: true, message: '请输入邮箱地址' },
                            { type: 'email', message: '邮箱格式不正确' }
                        ]}
                    >
                        <Input
                            placeholder="请输入邮箱地址"
                            className="custom-input"
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>订阅类型</span>}
                        name="subscriptionType"
                        rules={[{ required: true, message: '请选择订阅类型' }]}
                    >
                        <Select
                            placeholder="请选择订阅类型"
                            className="custom-select"
                            dropdownClassName="custom-dropdown"
                        >
                            {getAdminSubscriptionTypes().map(type => (
                                <Option key={type} value={type}>
                                    <Space>
                                        <span>{SUBSCRIPTION_TYPE_CONFIG[type].icon}</span>
                                        <span>{SUBSCRIPTION_TYPE_CONFIG[type].description}</span>
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>订阅者姓名</span>}
                        name="subscriberName"
                    >
                        <Input
                            placeholder="请输入姓名（可选）"
                            className="custom-input"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 编辑订阅弹窗 */}
            <Modal
                title={<span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>编辑订阅</span>}
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setCurrentSubscription(null);
                    editForm.resetFields();
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setEditModalVisible(false)}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleEdit}
                        loading={loading}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
                    >
                        保存
                    </Button>
                ]}
                styles={modalStyles}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>状态</span>}
                        name="status"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select className="custom-select" dropdownClassName="custom-dropdown">
                            {Object.values(SubscriptionStatus).map(status => (
                                <Option key={status} value={status}>
                                    {getSubscriptionStatusText(status)}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>订阅者姓名</span>}
                        name="subscriberName"
                    >
                        <Input
                            placeholder="请输入姓名"
                            className="custom-input"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 发送通知弹窗 */}
            <Modal
                title={<span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>发送自定义通知</span>}
                open={notifyModalVisible}
                width={600}
                onCancel={() => {
                    setNotifyModalVisible(false);
                    notifyForm.resetFields();
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setNotifyModalVisible(false)}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleSendNotification}
                        loading={sending}
                        className="bg-gradient-to-r from-green-500 to-blue-600 border-none"
                    >
                        发送
                    </Button>
                ]}
                styles={modalStyles}
            >
                <Form form={notifyForm} layout="vertical">
                    <Form.Item
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>通知类型</span>}
                        name="notificationType"
                        rules={[{ required: true, message: '请选择通知类型' }]}
                    >
                        <Select
                            placeholder="请选择通知类型"
                            className="custom-select"
                            dropdownClassName="custom-dropdown"
                        >
                            {[...getAdminSubscriptionTypes(), ...getUserSubscriptionTypes()].map(type => (
                                <Option key={type} value={type}>
                                    <Space>
                                        <span>{SUBSCRIPTION_TYPE_CONFIG[type].icon}</span>
                                        <span>{SUBSCRIPTION_TYPE_CONFIG[type].description}</span>
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>通知标题</span>}
                        name="title"
                        rules={[{ required: true, message: '请输入通知标题' }]}
                    >
                        <Input
                            placeholder="请输入通知标题"
                            className="custom-input"
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>通知内容</span>}
                        name="content"
                        rules={[{ required: true, message: '请输入通知内容' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="请输入通知内容"
                            className="custom-textarea"
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>相关链接</span>}
                        name="targetUrl"
                    >
                        <Input
                            placeholder="相关链接（可选）"
                            className="custom-input"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 确认操作模态框 */}
            {confirmModalConfig && (
                <VerificationModal
                    visible={confirmModalVisible}
                    onCancel={handleCancelConfirm}
                    onSubmit={handleConfirmAction}
                    isSubmitting={confirmLoading}
                    title={confirmModalConfig.title}
                    requireVerification={false}
                    okText={confirmModalConfig.okText}
                    cancelText="取消"
                    danger={confirmModalConfig.danger}
                    content={confirmModalConfig.content}
                />
            )}

            {/* 自定义样式 */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    /* 表格样式 */
                    .custom-table .ant-table {
                        background: transparent !important;
                    }
                    .custom-table .ant-table-thead > tr > th {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                    }
                    .custom-table .ant-table-tbody > tr > td {
                        background: transparent !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                    }
                    .custom-table .ant-table-tbody > tr:hover > td {
                        background: rgba(255, 255, 255, 0.1) !important;
                    }

                    /* 分页样式 */
                    .custom-pagination .ant-pagination-item {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    }
                    .custom-pagination .ant-pagination-item a {
                        color: rgba(255, 255, 255, 0.9) !important;
                    }
                    .custom-pagination .ant-pagination-item-active {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                        border: none !important;
                    }
                    .custom-pagination .ant-pagination-item-active a {
                        color: white !important;
                    }
                    .custom-pagination .ant-pagination-prev,
                    .custom-pagination .ant-pagination-next {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    }
                    .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
                    .custom-pagination .ant-pagination-next .ant-pagination-item-link {
                        color: rgba(255, 255, 255, 0.9) !important;
                        background: transparent !important;
                        border: none !important;
                    }
                    .custom-pagination .ant-select-single .ant-select-selector {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                        border-radius: 6px !important;
                    }
                    .custom-pagination .ant-select-arrow {
                        color: rgba(255, 255, 255, 0.7) !important;
                    }
                    .custom-pagination .ant-select-dropdown {
                        background: rgba(30, 30, 30, 0.95) !important;
                        backdrop-filter: blur(20px) !important;
                        border: 1px solid rgba(255, 255, 255, 0.2) !important;
                        border-radius: 8px !important;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
                    }
                    .custom-pagination .ant-select-item {
                        color: rgba(255, 255, 255, 0.9) !important;
                        background: transparent !important;
                    }
                    .custom-pagination .ant-select-item:hover {
                        background: rgba(255, 255, 255, 0.1) !important;
                    }
                    .custom-pagination .ant-select-item-option-selected {
                        background: rgba(59, 130, 246, 0.3) !important;
                        color: white !important;
                    }

                    /* 输入框样式 */
                    .custom-input {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                        border-radius: 8px !important;
                    }
                    .custom-input::placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                    }
                    .custom-input:focus {
                        background: rgba(255, 255, 255, 0.15) !important;
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                    }

                    /* 文本框样式 */
                    .custom-textarea {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                        border-radius: 8px !important;
                    }
                    .custom-textarea::placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                    }
                    .custom-textarea:focus {
                        background: rgba(255, 255, 255, 0.15) !important;
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                    }

                    /* 搜索框样式 */
                    .custom-search .ant-input {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                    }
                    .custom-search .ant-input::placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                    }
                    .custom-search .ant-input-search-button {
                        background: rgba(59, 130, 246, 0.8) !important;
                        border: none !important;
                    }

                    /* 选择器样式 */
                    .custom-select .ant-select-selector {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                        border-radius: 6px !important;
                    }
                    .custom-select .ant-select-selection-placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                    }
                    .custom-select .ant-select-arrow {
                        color: rgba(255, 255, 255, 0.7) !important;
                    }

                    /* 下拉框样式 */
                    .custom-dropdown {
                        background: rgba(30, 30, 30, 0.95) !important;
                        backdrop-filter: blur(20px) !important;
                        border: 1px solid rgba(255, 255, 255, 0.2) !important;
                        border-radius: 8px !important;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
                    }
                    .custom-dropdown .ant-select-item {
                        color: rgba(255, 255, 255, 0.9) !important;
                        background: transparent !important;
                    }
                    .custom-dropdown .ant-select-item:hover {
                        background: rgba(255, 255, 255, 0.1) !important;
                    }
                    .custom-dropdown .ant-select-item-option-selected {
                        background: rgba(59, 130, 246, 0.3) !important;
                        color: white !important;
                    }
                `
            }} />
        </div>
    );
};

export default AdminSubscriptionManagement;