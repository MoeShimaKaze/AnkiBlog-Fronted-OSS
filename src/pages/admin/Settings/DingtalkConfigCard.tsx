/**
 * 钉钉配置卡片组件
 */
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Switch, Button, Space, Alert, Spin, InputNumber, message, Tag } from 'antd';
import { DingdingOutlined, LinkOutlined, LockOutlined, PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { DingtalkConfig, DingtalkConfigRequest } from '@/types/notification';
import notificationService from '@/services/notificationService';

interface DingtalkConfigCardProps {
    onConfigChange?: (enabled: boolean) => void;
}

const DingtalkConfigCard: React.FC<DingtalkConfigCardProps> = ({ onConfigChange }) => {
    const [form] = Form.useForm();
    const [config, setConfig] = useState<DingtalkConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);

    // 加载配置
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await notificationService.getDingtalkConfig();
            if (res.success && res.data) {
                setConfig(res.data);
                form.setFieldsValue({
                    webhookUrl: res.data.webhookUrl?.includes('***') ? '' : res.data.webhookUrl,
                    robotName: res.data.robotName,
                    enabled: res.data.enabled,
                    rateLimitPerMinute: res.data.rateLimitPerMinute,
                });
            }
        } catch (error) {
            message.error('加载钉钉配置失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values: DingtalkConfigRequest) => {
        setSaving(true);
        try {
            // 如果webhook地址为空且已有配置，则不更新webhook
            const updateData: DingtalkConfigRequest = {
                ...values,
            };
            if (!values.webhookUrl && config?.webhookUrl) {
                delete updateData.webhookUrl;
            }
            // 如果secret为空字符串，传空让后端清除
            if (values.secret === '') {
                updateData.secret = '';
            }

            const res = await notificationService.updateDingtalkConfig(updateData);
            if (res.success) {
                setConfig(res.data);
                message.success('配置保存成功');
                onConfigChange?.(res.data.enabled);
            }
        } catch (error) {
            message.error('保存失败');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            const res = await notificationService.testDingtalkConnection();
            if (res.success && res.data) {
                message.success('连接测试成功！');
                await fetchConfig(); // 刷新配置以获取最新测试结果
            } else {
                message.error(res.message || '连接测试失败');
                await fetchConfig();
            }
        } catch (error: any) {
            message.error(error?.message || '测试请求失败');
            await fetchConfig();
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6">
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
                    <DingdingOutlined className="text-blue-500" />
                    <span className="text-white">钉钉机器人配置</span>
                    {config?.enabled && <Tag color="green">已启用</Tag>}
                </Space>
            }
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6"
        >
            {/* 上次测试结果提示 */}
            {config?.lastTestAt && (
                <Alert
                    message={config.lastTestResult ? "上次测试成功" : "上次测试失败"}
                    description={
                        <Space direction="vertical" size={0}>
                            <span>测试时间: {new Date(config.lastTestAt).toLocaleString()}</span>
                            {config.lastErrorMessage && <span>错误信息: {config.lastErrorMessage}</span>}
                        </Space>
                    }
                    type={config.lastTestResult ? "success" : "error"}
                    showIcon
                    icon={config.lastTestResult ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className="mb-4"
                />
            )}

            <Form form={form} layout="vertical" onFinish={handleSave}>
                {/* 启用开关 */}
                <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-lg">
                    <div>
                        <span className="text-white font-medium text-lg">启用钉钉推送</span>
                        <div className="text-white/60 text-sm mt-1">开启后将根据渠道配置发送钉钉消息</div>
                    </div>
                    <Form.Item name="enabled" valuePropName="checked" style={{ margin: 0 }}>
                        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                    </Form.Item>
                </div>

                {/* Webhook 地址 */}
                <Form.Item
                    name="webhookUrl"
                    label={<span className="text-white">Webhook 地址</span>}
                    rules={[{ required: !config?.webhookUrl, message: '请输入Webhook地址' }]}
                    help={
                        <span className="text-white/60">
                            {config?.webhookUrl ? '已配置，留空则保持原配置' : '请在钉钉群设置中获取机器人Webhook地址'}
                        </span>
                    }
                >
                    <Input
                        prefix={<LinkOutlined className="text-white/40" />}
                        placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx"
                        className="bg-white/10 border-white/30 text-white placeholder-white/40"
                    />
                </Form.Item>

                {/* 加签密钥 */}
                <Form.Item
                    name="secret"
                    label={<span className="text-white">加签密钥 (可选)</span>}
                    help={
                        <span className="text-white/60">
                            {config?.hasSecret ? '已配置加签，留空则保持原配置，输入空格则清除' : '如果机器人开启了加签验证，请填写SEC开头的密钥'}
                        </span>
                    }
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-white/40" />}
                        placeholder={config?.hasSecret ? '已配置加签密钥' : 'SEC开头的密钥'}
                        className="bg-white/10 border-white/30 text-white"
                    />
                </Form.Item>

                {/* 机器人名称 */}
                <Form.Item
                    name="robotName"
                    label={<span className="text-white">机器人名称</span>}
                    initialValue="消息助手"
                >
                    <Input
                        placeholder="显示在消息中的机器人名称"
                        className="bg-white/10 border-white/30 text-white placeholder-white/40"
                        maxLength={50}
                    />
                </Form.Item>

                {/* 每分钟发送限制 */}
                <Form.Item
                    name="rateLimitPerMinute"
                    label={<span className="text-white">每分钟发送限制</span>}
                    initialValue={20}
                    help={<span className="text-white/60">钉钉官方限制每分钟最多发送20条消息</span>}
                >
                    <InputNumber
                        min={1}
                        max={100}
                        className="w-full bg-white/10 border-white/30"
                    />
                </Form.Item>

                {/* 操作按钮 */}
                <Space className="w-full justify-end mt-4">
                    <Button
                        icon={<PlayCircleOutlined />}
                        onClick={handleTest}
                        loading={testing}
                        disabled={!config?.webhookUrl}
                    >
                        测试连接
                    </Button>
                    <Button type="primary" htmlType="submit" loading={saving}>
                        保存配置
                    </Button>
                </Space>
            </Form>
        </Card>
    );
};

export default DingtalkConfigCard;
