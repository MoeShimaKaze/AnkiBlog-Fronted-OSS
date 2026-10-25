// src/pages/public/Auth/LoginPage.tsx
import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Space } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/auth/useAuth'
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";

const { Title, Text } = Typography

const LoginPage: React.FC = () => {
    usePageTitle('登录', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // 从URL参数获取返回地址
    const urlParams = new URLSearchParams(location.search)
    const returnUrl = urlParams.get('return')
    const from = location.state?.from?.pathname || returnUrl || '/'

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true)
        try {
            await login(values)
            message.success('登录成功')

            // 如果有返回URL且不是登录/注册页面，跳转回去
            if (returnUrl && !returnUrl.includes('/auth/')) {
                window.location.href = decodeURIComponent(returnUrl)
            } else if (from !== '/auth/login') {
                navigate(from, { replace: true })
            } else {
                navigate('/', { replace: true })
            }
        } catch (error: any) {
            // 修复：检查错误类型，避免重复显示消息
            if (error.name === 'BusinessError') {
                // 业务错误：显示具体错误信息
                message.error(error.message || '登录失败')
            } else {
                // 网络或其他错误
                message.error('登录失败，请检查网络连接')
            }
        } finally {
            setLoading(false)
        }
    }

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
                    <div style={{ width: '100%', maxWidth: '400px', padding: '0 1rem' }}>
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
                                    欢迎回来
                                </Title>
                                <Text
                                    style={{
                                        fontSize: '14px',
                                        color: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    {returnUrl ? '请登录后继续访问' : '登录您的账户'}
                                </Text>
                            </div>

                            {returnUrl && (
                                <div style={{
                                    marginBottom: '1.5rem',
                                    padding: '12px 16px',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.3)'
                                }}>
                                    <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                                        登录后将返回: {decodeURIComponent(returnUrl)}
                                    </Text>
                                </div>
                            )}

                            <Form
                                name="login"
                                onFinish={onFinish}
                                autoComplete="off"
                                size="large"
                                layout="vertical"
                            >
                                <Form.Item
                                    name="username"
                                    rules={[
                                        { required: true, message: '请输入用户名或邮箱' },
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                                        placeholder="用户名或邮箱地址"
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
                                    rules={[{ required: true, message: '请输入密码' }]}
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

                                <Form.Item style={{ marginBottom: '1.5rem' }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        icon={<LoginOutlined />}
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
                                        登录
                                    </Button>
                                </Form.Item>
                            </Form>

                            <div style={{ textAlign: 'center' }}>
                                <Space direction="vertical" size="small">
                                    <div>
                                        <Text style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                                            还没有账户？
                                        </Text>
                                        <Link
                                            to={`/auth/register${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ''}`}
                                            style={{
                                                marginLeft: '4px',
                                                color: 'white',
                                                fontWeight: '500',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            立即注册
                                        </Link>
                                    </div>
                                    <div>
                                        <Link
                                            to="/auth/forgot-password"
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: '13px'
                                            }}
                                        >
                                            忘记密码？
                                        </Link>
                                    </div>
                                </Space>
                            </div>
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
            `}</style>
        </div>
    )
}

export default LoginPage