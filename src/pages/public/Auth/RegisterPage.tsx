// src/pages/public/Auth/RegisterPage.tsx
import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Steps, message, Progress } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, LockOutlined, MailOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons'
import { sendRegisterCode, register } from '@/services/auth.ts'
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";

const { Title, Text } = Typography

const RegisterPage: React.FC = () => {
    usePageTitle('注册', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [email, setEmail] = useState('')
    const [codeSent, setCodeSent] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()

    // 从URL参数获取返回地址
    const urlParams = new URLSearchParams(location.search)
    const returnUrl = urlParams.get('return')

    const handleSendCode = async () => {
        try {
            const emailValue = form.getFieldValue('email')
            if (!emailValue) {
                message.error('请先输入邮箱地址')
                return
            }

            setLoading(true)
            await sendRegisterCode(emailValue)
            setEmail(emailValue)
            setCodeSent(true)
            setCurrentStep(1)

            // 开始倒计时
            let count = 60
            setCountdown(count)
            const timer = setInterval(() => {
                count -= 1
                setCountdown(count)
                if (count <= 0) {
                    clearInterval(timer)
                    setCountdown(0)
                }
            }, 1000)

            message.success('验证码已发送到您的邮箱')
        } catch (error: any) {
            if (error.name === 'BusinessError') {
                message.error(error.message || '发送验证码失败')
            } else {
                message.error('发送验证码失败，请检查网络连接')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (values: {
        email: string
        username?: string
        password?: string
        displayName?: string
        verificationCode?: string
    }) => {
        // 如果还没发送验证码，阻止注册
        if (!codeSent) {
            return
        }

        setLoading(true)
        try {
            await register(
                {
                    username: values.username!,
                    email: values.email,
                    password: values.password!,
                    displayName: values.displayName!,
                },
                values.verificationCode!
            )
            setCurrentStep(2)
            message.success('注册成功，请等待管理员审核')

            // 3秒后跳转到登录页
            setTimeout(() => {
                navigate(`/auth/login${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ''}`)
            }, 3000)
        } catch (error: any) {
            if (error.name === 'BusinessError') {
                message.error(error.message || '注册失败')
            } else {
                message.error('注册失败，请检查网络连接')
            }
        } finally {
            setLoading(false)
        }
    }

    const stepItems = [
        {
            title: '输入邮箱',
            description: '验证邮箱地址'
        },
        {
            title: '填写信息',
            description: '完善个人信息'
        },
        {
            title: '注册成功',
            description: '等待审核'
        }
    ]

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundImage: `url('/background_placeholder.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* 半透明遮罩层 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(102, 126, 234, 0.4)',
                    backdropFilter: 'blur(1px)',
                    zIndex: 0
                }}
            />

            {/* 主内容区域 */}
            <div style={{ position: 'relative', zIndex: 10, paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                    <div style={{ width: '100%', maxWidth: '450px', padding: '0 1rem' }}>
                        <Card
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px'
                            }}
                            bodyStyle={{ padding: '2rem' }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <Title
                                    level={2}
                                    style={{
                                        margin: '0 0 0.5rem 0',
                                        color: 'white',
                                        textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    注册账户
                                </Title>
                                <Text
                                    style={{
                                        fontSize: '14px',
                                        color: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    创建您的新账户
                                </Text>
                            </div>

                            {/* 步骤指示器 */}
                            <div style={{ marginBottom: '2rem' }}>
                                <Steps
                                    current={currentStep}
                                    size="small"
                                    items={stepItems}
                                    style={{
                                        filter: 'invert(1) brightness(1.2)'
                                    }}
                                />
                            </div>

                            {/* 注册成功页面 */}
                            {currentStep === 2 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <CheckCircleOutlined
                                            style={{
                                                fontSize: '64px',
                                                color: '#52c41a',
                                                marginBottom: '1rem'
                                            }}
                                        />
                                    </div>
                                    <Title
                                        level={3}
                                        style={{
                                            color: 'white',
                                            marginBottom: '1rem',
                                            textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
                                        }}
                                    >
                                        注册成功！
                                    </Title>
                                    <Text
                                        style={{
                                            fontSize: '14px',
                                            display: 'block',
                                            marginBottom: '1.5rem',
                                            color: 'rgba(255, 255, 255, 0.8)'
                                        }}
                                    >
                                        您的账户已创建完成，请等待管理员审核
                                    </Text>
                                    <Progress
                                        percent={100}
                                        showInfo={false}
                                        strokeColor="#52c41a"
                                        style={{ marginBottom: '1.5rem' }}
                                    />
                                    <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                                        即将跳转到登录页面...
                                    </Text>
                                </div>
                            ) : (
                                <Form
                                    form={form}
                                    name="register"
                                    onFinish={codeSent ? handleRegister : undefined}
                                    autoComplete="off"
                                    size="large"
                                    layout="vertical"
                                >
                                    {/* 第一步：邮箱验证 */}
                                    <Form.Item
                                        name="email"
                                        rules={[
                                            { required: true, message: '请输入邮箱' },
                                            { type: 'email', message: '请输入有效的邮箱地址' }
                                        ]}
                                    >
                                        <Input
                                            prefix={<MailOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                                            placeholder="邮箱地址"
                                            disabled={codeSent}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.15)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                borderRadius: '25px',
                                                color: 'white',
                                                height: '50px',
                                                fontSize: '16px',
                                                padding: '0 20px'
                                            }}
                                            className="custom-input"
                                        />
                                    </Form.Item>

                                    {!codeSent && (
                                        <Form.Item style={{ marginBottom: '1.5rem' }}>
                                            <Button
                                                onClick={handleSendCode}
                                                loading={loading}
                                                style={{
                                                    width: '100%',
                                                    height: '50px',
                                                    borderRadius: '25px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px',
                                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                                }}
                                            >
                                                发送验证码
                                            </Button>
                                        </Form.Item>
                                    )}

                                    {/* 第二步：填写信息 */}
                                    {codeSent && (
                                        <>
                                            <Form.Item
                                                name="verificationCode"
                                                rules={[{ required: true, message: '请输入验证码' }]}
                                            >
                                                <Input
                                                    placeholder="请输入邮箱验证码"
                                                    addonAfter={
                                                        <Button
                                                            size="small"
                                                            disabled={countdown > 0}
                                                            onClick={handleSendCode}
                                                            style={{
                                                                border: 'none',
                                                                background: 'transparent',
                                                                color: countdown > 0 ? 'rgba(255, 255, 255, 0.5)' : 'white',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            {countdown > 0 ? `${countdown}s` : '重新发送'}
                                                        </Button>
                                                    }
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.15)',
                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '25px',
                                                        color: 'white',
                                                        height: '50px',
                                                        fontSize: '16px'
                                                    }}
                                                    className="custom-input"
                                                />
                                            </Form.Item>

                                            <div style={{
                                                marginBottom: '1.5rem',
                                                padding: '8px 12px',
                                                background: 'rgba(255, 255, 255, 0.15)',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                textAlign: 'center'
                                            }}>
                                                <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                                                    验证码已发送到 <strong>{email}</strong>
                                                </Text>
                                            </div>

                                            <Form.Item
                                                name="username"
                                                rules={[
                                                    { required: true, message: '请输入用户名' },
                                                    { min: 3, max: 20, message: '用户名长度为3-20个字符' },
                                                    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<UserOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                                                    placeholder="用户名"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.15)',
                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '25px',
                                                        color: 'white',
                                                        height: '50px',
                                                        fontSize: '16px',
                                                        padding: '0 20px'
                                                    }}
                                                    className="custom-input"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="displayName"
                                                rules={[
                                                    { required: true, message: '请输入显示名称' },
                                                    { min: 2, message: '显示名称至少2个字符' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<UserOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                                                    placeholder="显示名称"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.15)',
                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '25px',
                                                        color: 'white',
                                                        height: '50px',
                                                        fontSize: '16px',
                                                        padding: '0 20px'
                                                    }}
                                                    className="custom-input"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="password"
                                                rules={[
                                                    { required: true, message: '请输入密码' },
                                                    { min: 6, message: '密码至少6个字符' }
                                                ]}
                                            >
                                                <Input.Password
                                                    prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                                                    placeholder="密码"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.15)',
                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '25px',
                                                        color: 'white',
                                                        height: '50px',
                                                        fontSize: '16px',
                                                        padding: '0 20px'
                                                    }}
                                                    className="custom-input"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="confirmPassword"
                                                dependencies={['password']}
                                                rules={[
                                                    { required: true, message: '请确认密码' },
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (!value || getFieldValue('password') === value) {
                                                                return Promise.resolve()
                                                            }
                                                            return Promise.reject(new Error('两次输入的密码不一致'))
                                                        },
                                                    }),
                                                ]}
                                            >
                                                <Input.Password
                                                    prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                                                    placeholder="确认密码"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.15)',
                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '25px',
                                                        color: 'white',
                                                        height: '50px',
                                                        fontSize: '16px',
                                                        padding: '0 20px'
                                                    }}
                                                    className="custom-input"
                                                />
                                            </Form.Item>

                                            <Form.Item style={{ marginBottom: '1.5rem' }}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    loading={loading}
                                                    icon={<EditOutlined />}
                                                    style={{
                                                        width: '100%',
                                                        height: '50px',
                                                        borderRadius: '25px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        border: 'none',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px',
                                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                                    }}
                                                >
                                                    注册
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form>
                            )}

                            {currentStep !== 2 && (
                                <div style={{ textAlign: 'center' }}>
                                    <Text style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                                        已有账户？
                                    </Text>
                                    <Link
                                        to={`/auth/login${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ''}`}
                                        style={{
                                            marginLeft: '4px',
                                            color: 'white',
                                            fontWeight: '500',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        立即登录
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-input::placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                .custom-input .ant-input {
                    background: transparent !important;
                    border: none !important;
                    color: white !important;
                }
                .custom-input .ant-input-password {
                    background: transparent !important;
                    border: none !important;
                    color: white !important;
                }
                .custom-input .ant-input-password-icon {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                .custom-input .ant-input-group-addon {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: none !important;
                    color: white !important;
                }
            `}</style>
        </div>
    )
}

export default RegisterPage