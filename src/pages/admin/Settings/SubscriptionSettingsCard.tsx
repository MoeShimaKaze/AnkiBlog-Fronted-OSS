// SubscriptionSettingsCard.tsx - 移除未使用的profile参数
import React from 'react';
import { Card, Form, Switch, InputNumber, Divider, Space, Row, Col, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import {
    SUBSCRIPTION_TYPE_CONFIG,
    getAdminSubscriptionTypes,
    getUserSubscriptionTypes
} from '@/types/subscription';

const { Title } = Typography;

interface SubscriptionSettingsCardProps {
    form: any;
}

const SubscriptionSettingsCard: React.FC<SubscriptionSettingsCardProps> = ({ form }) => {
    return (
        <Row gutter={[24, 24]} justify="center">
            <Col xs={24} lg={16}>
                <Card
                    title={
                        <Space>
                            <BellOutlined className="text-blue-500" />
                            <span className="text-white">订阅功能设置</span>
                        </Space>
                    }
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-white font-medium">启用订阅服务</span>
                            <div className="text-white/60 text-sm">总开关，关闭后所有订阅功能停用</div>
                        </div>
                        <Form.Item name="enableSubscriptionService" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                        </Form.Item>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-white">用户订阅</span>
                            <div className="text-white/60 text-sm">开启后用户可以订阅文章和商品通知</div>
                        </div>
                        <Form.Item name="enableUserSubscriptions" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                        </Form.Item>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-white">访客订阅</span>
                            <div className="text-white/60 text-sm">开启后未登录用户也可以通过邮箱订阅</div>
                        </div>
                        <Form.Item name="enableGuestSubscriptions" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch checkedChildren="允许" unCheckedChildren="仅限登录" />
                        </Form.Item>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-white">邮箱验证</span>
                            <div className="text-white/60 text-sm">新订阅是否需要邮箱验证</div>
                        </div>
                        <Form.Item name="requireEmailVerification" valuePropName="checked" style={{ margin: 0 }}>
                            <Switch checkedChildren="需要" unCheckedChildren="免验证" />
                        </Form.Item>
                    </div>

                    <Divider className="border-white/20" />

                    <Form.Item
                        label={<span className="text-white">订阅限制设置</span>}
                        name="maxSubscriptionsPerEmail"
                        help={<span className="text-white/60">每个邮箱最多可订阅的数量</span>}
                        initialValue={5}
                    >
                        <InputNumber
                            min={1}
                            max={20}
                            placeholder="最大订阅数"
                            className="w-full bg-white/15 border-white/30 text-white"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">发送频率限制</span>}
                        name="subscriptionCooldownMinutes"
                        help={<span className="text-white/60">同一邮箱发送验证码的冷却时间（分钟）</span>}
                        initialValue={2}
                    >
                        <InputNumber
                            min={1}
                            max={60}
                            placeholder="冷却时间"
                            className="w-full bg-white/15 border-white/30 text-white"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">IP频率限制</span>}
                        name="subscriptionRateLimit"
                        help={<span className="text-white/60">每小时同一IP最多发送验证码次数</span>}
                        initialValue={20}
                    >
                        <InputNumber
                            min={5}
                            max={100}
                            placeholder="每小时限制"
                            className="w-full bg-white/15 border-white/30 text-white"
                        />
                    </Form.Item>

                    <Divider className="border-white/20" />

                    <div className="mb-4">
                        <Title level={5} className="text-white/90 mb-3">
                            管理员订阅类型
                        </Title>
                        {getAdminSubscriptionTypes().map(type => {
                            const config = SUBSCRIPTION_TYPE_CONFIG[type];
                            const fieldName = type === 'ADMIN_NEW_USER' ? 'adminSubscriptionNewUser' :
                                type === 'ADMIN_NEW_COMMENT' ? 'adminSubscriptionNewComment' :
                                    type === 'ADMIN_NEW_ARTICLE' ? 'adminSubscriptionNewArticle' :
                                        type === 'ADMIN_NEW_PRODUCT' ? 'adminSubscriptionNewProduct' : '';

                            return (
                                <div key={type}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Space>
                                            <span>{config.icon}</span>
                                            <span className="text-white">{config.description}</span>
                                        </Space>
                                        <Form.Item
                                            name={fieldName}
                                            valuePropName="checked"
                                            style={{ margin: 0 }}
                                        >
                                            <Switch
                                                checkedChildren="启用"
                                                unCheckedChildren="禁用"
                                                checked={form.getFieldValue(fieldName)}
                                                onChange={(checked) => {
                                                    form.setFieldValue(fieldName, checked);
                                                }}
                                            />
                                        </Form.Item>
                                    </div>
                                    <div className="text-white/60 text-sm mb-4">{config.description} - 管理员可接收此类通知</div>
                                </div>
                            );
                        })}
                    </div>

                    <div>
                        <Title level={5} className="text-white/90 mb-3">
                            用户订阅类型
                        </Title>
                        {getUserSubscriptionTypes().map(type => {
                            const config = SUBSCRIPTION_TYPE_CONFIG[type];
                            const fieldName = type === 'USER_NEW_ARTICLE' ? 'userSubscriptionNewArticle' :
                                type === 'USER_NEW_PRODUCT' ? 'userSubscriptionNewProduct' :
                                    type === 'USER_COMMENT_REPLY' ? 'userSubscriptionCommentReply' : '';

                            return (
                                <div key={type}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Space>
                                            <span>{config.icon}</span>
                                            <span className="text-white">{config.description}</span>
                                        </Space>
                                        <Form.Item
                                            name={fieldName}
                                            valuePropName="checked"
                                            style={{ margin: 0 }}
                                        >
                                            <Switch
                                                checkedChildren="开放"
                                                unCheckedChildren="关闭"
                                                checked={form.getFieldValue(fieldName)}
                                                onChange={(checked) => {
                                                    form.setFieldValue(fieldName, checked);
                                                }}
                                            />
                                        </Form.Item>
                                    </div>
                                    <div className="text-white/60 text-sm mb-4">{config.description} - 用户可订阅此类通知</div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default SubscriptionSettingsCard;