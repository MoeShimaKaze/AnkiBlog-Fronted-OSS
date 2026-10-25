// src/components/admin/Settings/ProfileCreator.tsx
import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Switch,
    Select,
    Button,
    Tabs,
    Row,
    Col,
    Space
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { UseVerificationCodeReturn } from '@/hooks/common/useVerificationCode.ts';
import { modalGlassCardStyle } from '@/constants/styles';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface ProfileCreatorProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
    verificationHook: UseVerificationCodeReturn;
}

const ProfileCreator: React.FC<ProfileCreatorProps> = ({
                                                           visible,
                                                           onCancel,
                                                           onSubmit,
                                                           isSubmitting,
                                                           verificationHook
                                                       }) => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState<'form' | 'verification'>('form');
    const [formData, setFormData] = useState<any>(null);
    const [verificationCode, setVerificationCode] = useState('');

    const { sendingCode, codeSent, countdown, sendCode } = verificationHook;

    // 通用输入框样式
    const inputStyle = {
        background: 'rgba(55, 65, 81, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        color: 'white'
    };

    const handleFormSubmit = async (values: any) => {
        setFormData(values);
        setCurrentStep('verification');
        // 自动发送验证码
        try {
            await sendCode();
        } catch (error) {
            // 错误已在 hook 中处理
        }
    };

    const handleVerificationSubmit = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            return;
        }

        const submitData = { ...formData, verificationCode };
        await onSubmit(submitData);
        handleCancel();
    };

    const handleCancel = () => {
        form.resetFields();
        setCurrentStep('form');
        setFormData(null);
        setVerificationCode('');
        verificationHook.resetState();
        onCancel();
    };

    const renderFormContent = () => (
        <div style={{
            ...modalGlassCardStyle,
            padding: '24px',
        }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                initialValues={{
                    siteName: '',
                    siteUrl: 'https://',
                    contactEmail: '',
                    siteDescription: '',
                    templateName: `模板-${Date.now()}`,
                    templateDescription: '新创建的站点模板',
                    isActiveTemplate: false,
                    commentsEnabled: true,
                    allowGuestComments: false,
                    commentModeration: 'auto_approve',
                    homepagePostCount: 10,
                    excerptLength: 200,
                    rssFeedCount: 20,
                    themeColor: '#1890ff',
                    enableSubscriptionService: false,
                    enableUserSubscriptions: false,
                    enableGuestSubscriptions: false,
                    requireEmailVerification: true,
                    maxSubscriptionsPerEmail: 5,
                    subscriptionCooldownMinutes: 2,
                    subscriptionRateLimit: 20
                }}
            >
                <Tabs defaultActiveKey="basic" className="profile-creator-tabs">
                    <TabPane tab="基本信息" key="basic">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>站点名称</span>}
                                    name="siteName"
                                    rules={[{ required: true, message: '请输入站点名称' }]}
                                >
                                    <Input
                                        placeholder="例如：AnkiBlog"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>站点URL</span>}
                                    name="siteUrl"
                                    rules={[
                                        { required: true, message: '请输入站点URL' },
                                        { type: 'url', message: '请输入有效的URL' }
                                    ]}
                                >
                                    <Input
                                        placeholder="https://yourdomain.com"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>站点标语</span>}
                                    name="siteTagline"
                                >
                                    <Input
                                        placeholder="例如：Anki の歇脚处"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>联系邮箱</span>}
                                    name="contactEmail"
                                    rules={[
                                        { required: true, message: '请输入联系邮箱' },
                                        { type: 'email', message: '请输入有效的邮箱地址' }
                                    ]}
                                >
                                    <Input
                                        placeholder="contact@yourdomain.com"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>站点描述</span>}
                                    name="siteDescription"
                                    rules={[{ required: true, message: '请输入站点描述' }]}
                                >
                                    <TextArea
                                        rows={3}
                                        placeholder="站点的详细描述..."
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="模板设置" key="template">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>模板名称</span>}
                                    name="templateName"
                                    rules={[{ required: true, message: '请输入模板名称' }]}
                                >
                                    <Input
                                        placeholder="模板名称"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>设为活跃模板</span>}
                                    name="isActiveTemplate"
                                    valuePropName="checked"
                                >
                                    <Switch checkedChildren="是" unCheckedChildren="否" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>模板描述</span>}
                                    name="templateDescription"
                                >
                                    <TextArea
                                        rows={2}
                                        placeholder="模板的详细描述..."
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="首页设置" key="hero">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>首页标题</span>}
                                    name="heroTitle"
                                >
                                    <Input
                                        placeholder="例如：欢迎来到我的个人空间"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>主题色</span>}
                                    name="themeColor"
                                >
                                    <Input
                                        type="color"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>首页副标题</span>}
                                    name="heroSubtitle"
                                >
                                    <TextArea
                                        rows={3}
                                        placeholder="例如：这里记录着我的思考、分享着有趣的内容..."
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="站长信息" key="owner">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>站长姓名</span>}
                                    name="ownerName"
                                >
                                    <Input
                                        placeholder="请输入姓名"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>职业</span>}
                                    name="ownerProfession"
                                >
                                    <Input
                                        placeholder="例如：软件工程师"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>工作单位</span>}
                                    name="ownerCompany"
                                >
                                    <Input
                                        placeholder="例如：某某科技有限公司"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>所在地</span>}
                                    name="ownerLocation"
                                >
                                    <Input
                                        placeholder="例如：北京市"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>个人简介</span>}
                                    name="ownerBio"
                                >
                                    <TextArea
                                        rows={3}
                                        placeholder="介绍一下自己..."
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>头像URL</span>}
                                    name="ownerAvatar"
                                >
                                    <Input
                                        placeholder="https://example.com/avatar.jpg"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="评论设置" key="comments">
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>启用评论</span>}
                                    name="commentsEnabled"
                                    valuePropName="checked"
                                >
                                    <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>访客评论</span>}
                                    name="allowGuestComments"
                                    valuePropName="checked"
                                >
                                    <Switch checkedChildren="允许" unCheckedChildren="仅限登录" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>评论审核</span>}
                                    name="commentModeration"
                                >
                                    <Select
                                        style={inputStyle}
                                        dropdownStyle={{
                                            background: 'rgba(35, 35, 35, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <Option value="auto_approve">自动通过</Option>
                                        <Option value="first_time_manual">首次评论需审核</Option>
                                        <Option value="always_manual">总是需要审核</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="显示设置" key="display">
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>首页文章数量</span>}
                                    name="homepagePostCount"
                                >
                                    <InputNumber
                                        min={1}
                                        max={50}
                                        placeholder="默认10"
                                        className="w-full"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>摘要长度</span>}
                                    name="excerptLength"
                                >
                                    <InputNumber
                                        min={50}
                                        max={500}
                                        placeholder="默认200"
                                        className="w-full"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>RSS订阅数量</span>}
                                    name="rssFeedCount"
                                >
                                    <InputNumber
                                        min={5}
                                        max={100}
                                        placeholder="默认20"
                                        className="w-full"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="SEO设置" key="seo">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>Google验证码</span>}
                                    name="googleVerification"
                                >
                                    <Input
                                        placeholder="Google Search Console验证码"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>百度验证码</span>}
                                    name="baiduVerification"
                                >
                                    <Input
                                        placeholder="百度站长工具验证码"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>默认SEO描述</span>}
                                    name="defaultSeoDescription"
                                >
                                    <TextArea
                                        rows={3}
                                        placeholder="网站的SEO描述..."
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="订阅设置" key="subscription">
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>启用订阅服务</span>}
                                    name="enableSubscriptionService"
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>用户订阅</span>}
                                    name="enableUserSubscriptions"
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>访客订阅</span>}
                                    name="enableGuestSubscriptions"
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>邮箱验证</span>}
                                    name="requireEmailVerification"
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>订阅限制</span>}
                                    name="maxSubscriptionsPerEmail"
                                >
                                    <InputNumber
                                        min={1}
                                        max={20}
                                        className="w-full"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>冷却时间(分钟)</span>}
                                    name="subscriptionCooldownMinutes"
                                >
                                    <InputNumber
                                        min={1}
                                        max={60}
                                        className="w-full"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="高级设置" key="advanced">
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>自定义CSS</span>}
                                    name="customCss"
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder="/* 在此添加自定义CSS代码 */"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>自定义JavaScript</span>}
                                    name="customJs"
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder="// 在此添加自定义JavaScript代码"
                                        style={inputStyle}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>

                <div className="text-center mt-6">
                    <Space>
                        <Button
                            onClick={handleCancel}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white'
                            }}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<PlusOutlined />}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                border: 'none'
                            }}
                        >
                            下一步：验证身份
                        </Button>
                    </Space>
                </div>
            </Form>
        </div>
    );

    const renderVerificationContent = () => (
        <div style={{
            ...modalGlassCardStyle,
            padding: '24px',
        }}>
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: 'white', margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>
                    身份验证
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                        创建新模板需要验证您的身份。请获取并输入邮箱验证码。
                    </p>
                    <Button
                        onClick={sendCode}
                        loading={sendingCode}
                        disabled={codeSent}
                        type="primary"
                        size="small"
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            border: 'none',
                            marginLeft: '12px'
                        }}
                    >
                        {codeSent ? `重新发送(${countdown}s)` : '发送验证码'}
                    </Button>
                </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, fontSize: '16px', lineHeight: '40px' }}>验证码</label>
                    <div className="glass-otp-container" style={{ flex: 1 }}>
                        <Input.OTP
                            length={6}
                            value={verificationCode}
                            onChange={setVerificationCode}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    onClick={() => setCurrentStep('form')}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white'
                    }}
                >
                    返回编辑
                </Button>
                <Button
                    type="primary"
                    onClick={handleVerificationSubmit}
                    loading={isSubmitting}
                    disabled={!verificationCode || verificationCode.length !== 6}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        border: 'none'
                    }}
                >
                    确认创建
                </Button>
            </div>
        </div>
    );

    return (
        <Modal
            open={visible}
            title={currentStep === 'form' ? null : null}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
            centered
            closable={false}
            maskStyle={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
            }}
            styles={{
                content: { background: 'transparent', boxShadow: 'none', padding: 0 }
            }}
        >
            {currentStep === 'form' ? renderFormContent() : renderVerificationContent()}

            <style dangerouslySetInnerHTML={{
                __html: `
                    .profile-creator-tabs .ant-tabs-nav {
                        background: rgba(255, 255, 255, 0.1) !important;
                        backdrop-filter: blur(10px) !important;
                        border-radius: 12px !important;
                        padding: 8px !important;
                        margin-bottom: 24px !important;
                    }
                    .profile-creator-tabs .ant-tabs-tab {
                        color: rgba(255, 255, 255, 0.7) !important;
                        border: none !important;
                        border-radius: 8px !important;
                        margin: 0 4px !important;
                        font-weight: 500 !important;
                    }
                    .profile-creator-tabs .ant-tabs-tab:hover {
                        color: white !important;
                        background: rgba(255, 255, 255, 0.1) !important;
                    }
                    .profile-creator-tabs .ant-tabs-tab-active {
                        color: white !important;
                        background: rgba(59, 130, 246, 0.5) !important;
                    }
                    .profile-creator-tabs .ant-tabs-content-holder {
                        max-height: 400px !important;
                        overflow-y: auto !important;
                        background: transparent !important;
                    }
                    .profile-creator-tabs .ant-tabs-ink-bar {
                        display: none !important;
                    }
                    
                    .glass-otp-container .ant-otp-input {
                        background: rgba(55, 65, 81, 0.8) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        color: white !important;
                        border-radius: 8px !important;
                        text-align: center !important;
                        font-weight: 500 !important;
                        font-size: 16px !important;
                        height: 40px !important;
                        width: 40px !important;
                    }
                    
                    .glass-otp-container .ant-otp-input:hover {
                        border-color: rgba(255, 255, 255, 0.5) !important;
                        background: rgba(75, 85, 99, 0.8) !important;
                    }
                    
                    .glass-otp-container .ant-otp-input:focus {
                        border-color: #60a5fa !important;
                        background: rgba(75, 85, 99, 0.8) !important;
                        box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
                        outline: none !important;
                    }
                    
                    .glass-otp-container .ant-otp {
                        gap: 8px !important;
                        display: flex !important;
                        justify-content: center !important;
                    }

                    /* 全局样式覆盖 */
                    .ant-input::placeholder,
                    .ant-input-number-input::placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                    }

                    .ant-input:hover,
                    .ant-input-number:hover .ant-input-number-input {
                        border-color: rgba(255, 255, 255, 0.5) !important;
                        background: rgba(75, 85, 99, 0.8) !important;
                    }

                    .ant-input:focus,
                    .ant-input-focused,
                    .ant-input-number-focused .ant-input-number-input {
                        border-color: #60a5fa !important;
                        background: rgba(75, 85, 99, 0.8) !important;
                        box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
                    }

                    .ant-select-dropdown .ant-select-item {
                        color: white !important;
                    }

                    .ant-select-dropdown .ant-select-item:hover {
                        background: rgba(59, 130, 246, 0.3) !important;
                    }

                    .ant-select-dropdown .ant-select-item-option-selected {
                        background: rgba(59, 130, 246, 0.5) !important;
                    }
                `
            }} />
        </Modal>
    );
};

export default ProfileCreator;
