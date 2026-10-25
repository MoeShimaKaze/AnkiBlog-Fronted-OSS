// UserSubscriptionManagement.tsx - 增强版本，添加重发验证码功能
import React, { useState, useCallback } from 'react';
import {
    Card,
    Switch,
    Button,
    List,
    Tag,
    Space,
    Typography,
    Alert,
    Modal,
    Form,
    Input,
    Select,
    Tooltip,
    Empty,
    Divider,
} from 'antd';
import {
    BellOutlined,
    MailOutlined,
    SettingOutlined,
    PlusOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    SafetyOutlined,
    RedoOutlined
} from '@ant-design/icons';

// 导入类型定义
import {
    SubscriptionType,
    SubscriptionStatus,
    SubscriptionCreateRequest,
    SUBSCRIPTION_TYPE_CONFIG,
    getUserSubscriptionTypes,
    getSubscriptionStatusText,
    getSubscriptionStatusColor,
    type Subscription
} from '@/types/subscription';

// 导入Hooks
import { useUserSubscriptions } from '@/hooks/api/useSubscription';
import { useAuth } from '@/hooks/auth/useAuth';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface UserSubscriptionManagementProps {
    className?: string;
}

const UserSubscriptionManagement: React.FC<UserSubscriptionManagementProps> = ({
                                                                                   className
                                                                               }) => {
    const { user } = useAuth();
    const {
        subscriptions,
        loading,
        error,
        subscribe,
        verifyByCode,
        unsubscribe,
        // 新增：重发验证码相关
        resendVerificationCode,
        resendLoading,
        canResend,
        countdown,
        resetResendState
    } = useUserSubscriptions();

    const [subscribeModalVisible, setSubscribeModalVisible] = useState(false);
    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [currentVerification, setCurrentVerification] = useState<Subscription | null>(null);
    const [unsubscribing, setUnsubscribing] = useState<string | null>(null);

    const [subscribeForm] = Form.useForm<SubscriptionCreateRequest>();
    const [verifyForm] = Form.useForm<{ verificationCode: string }>();

    // 获取用户可订阅的类型
    const availableTypes = getUserSubscriptionTypes();

    // 获取当前用户的订阅状态
    const getSubscriptionStatus = useCallback((type: SubscriptionType): Subscription | undefined => {
        return subscriptions.find(sub => sub.subscriptionType === type);
    }, [subscriptions]);

    // 检查是否可以订阅某个类型
    const canSubscribeType = useCallback((type: SubscriptionType): boolean => {
        const existing = getSubscriptionStatus(type);
        return !existing || existing.status === SubscriptionStatus.UNSUBSCRIBED;
    }, [getSubscriptionStatus]);

    // 处理快速切换订阅
    const handleQuickToggle = useCallback(async (type: SubscriptionType, enabled: boolean) => {
        if (!user) return;

        if (enabled) {
            try {
                await subscribe({
                    email: user.email,
                    subscriptionType: type,
                    subscriberName: user.displayName
                });
            } catch (error) {
                console.error('订阅失败:', error);
            }
        } else {
            const subscription = getSubscriptionStatus(type);
            if (subscription?.unsubscribeToken) {
                await handleUnsubscribe(subscription.unsubscribeToken);
            }
        }
    }, [user, subscribe, getSubscriptionStatus]);

    // 处理取消订阅
    const handleUnsubscribe = useCallback(async (unsubscribeToken: string) => {
        if (!unsubscribeToken) return;

        setUnsubscribing(unsubscribeToken);
        try {
            await unsubscribe(unsubscribeToken);
        } catch (error) {
            console.error('取消订阅失败:', error);
        } finally {
            setUnsubscribing(null);
        }
    }, [unsubscribe]);

    // 处理新订阅
    const handleSubscribe = useCallback(async () => {
        try {
            const values = await subscribeForm.validateFields();
            await subscribe(values);
            setSubscribeModalVisible(false);
            subscribeForm.resetFields();
        } catch (error) {
            console.error('订阅失败:', error);
        }
    }, [subscribe, subscribeForm]);

    // 处理验证订阅
    const handleVerifySubscription = useCallback(async () => {
        if (!currentVerification) return;

        try {
            const values = await verifyForm.validateFields();
            // 修复：添加 subscriptionType 参数
            await verifyByCode(
                currentVerification.email,
                values.verificationCode,
                currentVerification.subscriptionType
            );
            setVerifyModalVisible(false);
            setCurrentVerification(null);
            verifyForm.resetFields();
            resetResendState(); // 重置重发状态
        } catch (error) {
            console.error('验证失败:', error);
            // 验证失败不关闭弹窗，让用户可以重试或重发验证码
        }
    }, [verifyByCode, verifyForm, currentVerification, resetResendState]);

    // 显示验证弹窗
    const showVerifyModal = useCallback((subscription: Subscription) => {
        setCurrentVerification(subscription);
        setVerifyModalVisible(true);
        resetResendState(); // 重置重发状态
    }, [resetResendState]);

    // 处理重发验证码
    const handleResendCode = useCallback(async () => {
        if (!currentVerification) return;

        try {
            await resendVerificationCode(currentVerification.email);
        } catch (error) {
            console.error('重发验证码失败:', error);
        }
    }, [currentVerification, resendVerificationCode]);

    // 获取状态图标
    const getStatusIcon = useCallback((status: SubscriptionStatus) => {
        switch (status) {
            case SubscriptionStatus.ACTIVE:
                return <CheckCircleOutlined className="text-green-500" />;
            case SubscriptionStatus.PENDING:
                return <ClockCircleOutlined className="text-yellow-500" />;
            case SubscriptionStatus.PAUSED:
                return <ExclamationCircleOutlined className="text-blue-500" />;
            default:
                return <DeleteOutlined className="text-red-500" />;
        }
    }, []);

    // 处理验证弹窗关闭
    const handleVerifyModalCancel = useCallback(() => {
        setVerifyModalVisible(false);
        setCurrentVerification(null);
        verifyForm.resetFields();
        resetResendState(); // 重置重发状态
    }, [verifyForm, resetResendState]);

    return (
        <div className={`py-6 ${className || ''}`}>
            <div className="flex justify-between items-center mb-6">
                <Space>
                    <BellOutlined className="text-2xl text-blue-500" />
                    <Title level={3} className="text-white m-0">
                        订阅管理
                    </Title>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setSubscribeModalVisible(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-none rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                    新增订阅
                </Button>
            </div>

            {error && (
                <Alert
                    message="加载失败"
                    description={error}
                    type="error"
                    showIcon
                    className="mb-6 bg-red-500/20 border-red-500/30 text-white"
                />
            )}

            {/* 快速订阅开关 */}
            <Card
                title={
                    <Space>
                        <SettingOutlined className="text-green-500" />
                        <span className="text-white">快速设置</span>
                    </Space>
                }
                className="mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
                bodyStyle={{ padding: '24px' }}
            >
                <div className="grid gap-4">
                    {availableTypes.map(type => {
                        const config = SUBSCRIPTION_TYPE_CONFIG[type];
                        const subscription = getSubscriptionStatus(type);
                        const isActive = subscription?.status === SubscriptionStatus.ACTIVE;
                        const isPending = subscription?.status === SubscriptionStatus.PENDING;

                        return (
                            <div key={type} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <Space>
                                    <span className="text-lg">{config.icon}</span>
                                    <div>
                                        <Text className="text-white font-medium">
                                            {config.description}
                                        </Text>
                                        {subscription && (
                                            <div className="mt-1">
                                                <Tag color={getSubscriptionStatusColor(subscription.status)}>
                                                    {getSubscriptionStatusText(subscription.status)}
                                                </Tag>
                                                {isPending && (
                                                    <Button
                                                        size="small"
                                                        type="link"
                                                        icon={<SafetyOutlined />}
                                                        onClick={() => showVerifyModal(subscription)}
                                                        className="text-yellow-400 hover:text-yellow-300 p-0 ml-2"
                                                    >
                                                        验证邮箱
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Space>
                                <Switch
                                    checked={isActive}
                                    loading={isPending}
                                    disabled={loading || isPending}
                                    onChange={(checked) => handleQuickToggle(type, checked)}
                                    className="bg-gray-400"
                                />
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* 订阅列表 */}
            <Card
                title={
                    <Space>
                        <MailOutlined className="text-blue-500" />
                        <span className="text-white">我的订阅</span>
                    </Space>
                }
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
                bodyStyle={{ padding: '24px' }}
            >
                {subscriptions.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <Text className="text-white/60">
                                暂无订阅
                            </Text>
                        }
                    />
                ) : (
                    <List
                        dataSource={subscriptions}
                        loading={loading}
                        renderItem={(subscription) => {
                            const config = SUBSCRIPTION_TYPE_CONFIG[subscription.subscriptionType];
                            const isPending = subscription.status === SubscriptionStatus.PENDING;

                            return (
                                <List.Item
                                    className="p-4 bg-white/5 rounded-lg mb-2 border border-white/10"
                                    actions={[
                                        isPending && (
                                            <Tooltip title="验证邮箱" key="verify">
                                                <Button
                                                    type="primary"
                                                    icon={<SafetyOutlined />}
                                                    size="small"
                                                    onClick={() => showVerifyModal(subscription)}
                                                    className="bg-yellow-500 hover:bg-yellow-600 border-none"
                                                >
                                                    验证
                                                </Button>
                                            </Tooltip>
                                        ),
                                        subscription.status === SubscriptionStatus.ACTIVE && subscription.unsubscribeToken && (
                                            <Tooltip title="取消订阅" key="unsubscribe">
                                                <Button
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                    danger
                                                    size="small"
                                                    loading={unsubscribing === subscription.unsubscribeToken}
                                                    onClick={() => handleUnsubscribe(subscription.unsubscribeToken!)}
                                                    className="hover:bg-red-500/20"
                                                />
                                            </Tooltip>
                                        )
                                    ].filter(Boolean)}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                                style={{ backgroundColor: `${config.color}20` }}
                                            >
                                                {config.icon}
                                            </div>
                                        }
                                        title={
                                            <Space>
                                                <Text className="text-white font-medium">
                                                    {config.description}
                                                </Text>
                                                {getStatusIcon(subscription.status)}
                                                <Tag color={getSubscriptionStatusColor(subscription.status)}>
                                                    {getSubscriptionStatusText(subscription.status)}
                                                </Tag>
                                            </Space>
                                        }
                                        description={
                                            <div className="text-white/70 text-sm space-y-1">
                                                <div>邮箱：{subscription.email}</div>
                                                <div>订阅时间：{new Date(subscription.createdAt).toLocaleDateString('zh-CN')}</div>
                                                {subscription.lastNotificationAt && (
                                                    <div>
                                                        最后通知：{new Date(subscription.lastNotificationAt).toLocaleDateString('zh-CN')}
                                                        （共 {subscription.notificationCount} 次）
                                                    </div>
                                                )}
                                                {isPending && (
                                                    <div className="text-yellow-400">
                                                        ⚠️ 请查收验证邮件并完成验证
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                )}
            </Card>

            {/* 订阅说明 */}
            <Card className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                <Title level={5} className="text-white mb-4">
                    📋 订阅说明
                </Title>
                <div className="text-white/80 space-y-2">
                    <Paragraph className="text-inherit mb-2">
                        • 订阅后将通过邮件接收相关通知
                    </Paragraph>
                    <Paragraph className="text-inherit mb-2">
                        • 新订阅需要验证邮箱后才会生效
                    </Paragraph>
                    <Paragraph className="text-inherit mb-2">
                        • 可以随时取消任何订阅
                    </Paragraph>
                    <Paragraph className="text-inherit mb-0">
                        • 邮件中包含取消订阅的快捷链接
                    </Paragraph>
                </div>
            </Card>

            {/* 新增订阅弹窗 */}
            <Modal
                title={
                    <Space className="text-white">
                        <PlusOutlined />
                        <span>新增订阅</span>
                    </Space>
                }
                open={subscribeModalVisible}
                onCancel={() => {
                    setSubscribeModalVisible(false);
                    subscribeForm.resetFields();
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setSubscribeModalVisible(false);
                            subscribeForm.resetFields();
                        }}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handleSubscribe}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:from-blue-600 hover:to-purple-700"
                    >
                        确认订阅
                    </Button>
                ]}
                destroyOnClose
                className="dark-modal"
                styles={{
                    mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                    content: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px'
                    },
                    header: {
                        backgroundColor: 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white'
                    }
                }}
            >
                <div className="bg-white/5 p-4 rounded-lg">
                    <Form form={subscribeForm} layout="vertical">
                        <Form.Item
                            label={<span className="text-white">邮箱地址</span>}
                            name="email"
                            initialValue={user?.email}
                            rules={[
                                { required: true, message: '请输入邮箱地址' },
                                { type: 'email', message: '邮箱格式不正确' }
                            ]}
                        >
                            <Input
                                placeholder="请输入邮箱地址"
                                prefix={<MailOutlined />}
                                className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                                styles={{
                                    input: { backgroundColor: 'transparent', color: 'white' }
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-white">订阅类型</span>}
                            name="subscriptionType"
                            rules={[{ required: true, message: '请选择订阅类型' }]}
                        >
                            <Select
                                placeholder="请选择订阅类型"
                                className="bg-white/10 border-white/30 text-white"
                                dropdownStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                {availableTypes.filter(type => canSubscribeType(type)).map(type => {
                                    const config = SUBSCRIPTION_TYPE_CONFIG[type];
                                    return (
                                        <Option key={type} value={type}>
                                            <Space>
                                                <span>{config.icon}</span>
                                                <span className="text-white">{config.description}</span>
                                            </Space>
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-white">订阅者姓名</span>}
                            name="subscriberName"
                            initialValue={user?.displayName}
                        >
                            <Input
                                placeholder="请输入姓名（可选）"
                                className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                                styles={{
                                    input: { backgroundColor: 'transparent', color: 'white' }
                                }}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>

            {/* 验证订阅弹窗 - 增强版本 */}
            <Modal
                title={
                    <Space className="text-white">
                        <SafetyOutlined />
                        <span>验证邮箱</span>
                    </Space>
                }
                open={verifyModalVisible}
                onCancel={handleVerifyModalCancel}
                footer={[
                    <Button
                        key="cancel"
                        onClick={handleVerifyModalCancel}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handleVerifySubscription}
                        className="bg-gradient-to-r from-green-500 to-blue-600 border-none hover:from-green-600 hover:to-blue-700"
                    >
                        验证并激活
                    </Button>
                ]}
                destroyOnClose
                className="dark-modal"
                styles={{
                    mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                    content: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px'
                    },
                    header: {
                        backgroundColor: 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white'
                    }
                }}
            >
                <div className="bg-white/5 p-4 rounded-lg">
                    {currentVerification && (
                        <Alert
                            message="验证邮件已发送"
                            description={
                                <span className="text-white/80">
                                    我们已向 {currentVerification.email} 发送了验证邮件，请查收并输入验证码。
                                </span>
                            }
                            type="info"
                            showIcon
                            className="mb-4 bg-blue-500/20 border-blue-500/30 text-white"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'white' }}
                        />
                    )}

                    <Form form={verifyForm} layout="vertical">
                        <Form.Item
                            label={<span className="text-white">验证码</span>}
                            name="verificationCode"
                            rules={[
                                { required: true, message: '请输入验证码' },
                                { len: 6, message: '验证码为6位数字' },
                                { pattern: /^\d{6}$/, message: '验证码必须是6位数字' }
                            ]}
                        >
                            <Input
                                placeholder="请输入邮件中的6位验证码"
                                prefix={<SafetyOutlined />}
                                maxLength={6}
                                className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                                styles={{
                                    input: { backgroundColor: 'transparent', color: 'white' }
                                }}
                            />
                        </Form.Item>

                        {/* 重新获取验证码区域 */}
                        <div className="mb-4">
                            <Divider className="border-white/20" />
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">没有收到验证码？</span>
                                <Button
                                    type="link"
                                    icon={<RedoOutlined />}
                                    disabled={!canResend || countdown > 0}
                                    loading={resendLoading}
                                    onClick={handleResendCode}
                                    className={`p-0 h-auto ${canResend && countdown === 0
                                        ? 'text-blue-400 hover:text-blue-300'
                                        : 'text-white/40 cursor-not-allowed'
                                    }`}
                                >
                                    {countdown > 0
                                        ? `重新发送 (${countdown}s)`
                                        : canResend
                                            ? '重新发送验证码'
                                            : '重新发送验证码'
                                    }
                                </Button>
                            </div>
                        </div>
                    </Form>

                    <div className="text-white/60 text-sm space-y-1">
                        <p>• 验证码有效期为15分钟</p>
                        <p>• 如未收到邮件，请检查垃圾邮件箱</p>
                        <p>• 验证失败后可重新获取验证码</p>
                        <p>• 重新发送验证码有120秒冷却时间</p>
                        <p>• 验证成功后订阅将立即生效</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserSubscriptionManagement;