// src/pages/user/Profile/UserProfileManagement.tsx - 集成订阅功能
import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, message, Modal, Steps, Space, Typography, Divider, Tabs } from 'antd'
import {
    LockOutlined, MailOutlined, UserOutlined, SafetyCertificateOutlined,
    CheckCircleOutlined, EyeInvisibleOutlined, EyeTwoTone, BellOutlined
} from '@ant-design/icons'
import { useAuth } from '@/hooks/auth/useAuth'
import { useAppDispatch } from '@/hooks/redux'
import { updateUserProfile, getCurrentUser } from '@/store/slices/authSlice'
import { usePageTitle } from '@/hooks/business/usePageTitle'
import PageTitle from '@/components/Common/PageTitle'
import Navbar from '@/components/Common/Navbar'
import UserSubscriptionManagement from '@/pages/user/Profile/UserSubscriptionManagement'
import api from '@/services/api'
import { modalGlassCardStyle } from '@/constants/styles'

const { Title, Text } = Typography
const { TabPane } = Tabs

const UserProfileManagement: React.FC = () => {
    const { user } = useAuth()
    const dispatch = useAppDispatch()
    const [passwordForm] = Form.useForm()
    const [emailForm] = Form.useForm()
    const [displayNameForm] = Form.useForm()

    // 密码修改状态
    const [passwordModalVisible, setPasswordModalVisible] = useState(false)
    const [passwordStep, setPasswordStep] = useState(0)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [emailCodeCountdown, setEmailCodeCountdown] = useState(0)

    // 邮箱换绑状态
    const [emailModalVisible, setEmailModalVisible] = useState(false)
    const [emailStep, setEmailStep] = useState(0)
    const [emailLoading, setEmailLoading] = useState(false)
    const [currentEmailVerified, setCurrentEmailVerified] = useState(false)
    const [emailPasswordVerified, setEmailPasswordVerified] = useState(false)
    const [newEmailVerified, setNewEmailVerified] = useState(false)
    const [currentEmailCountdown, setCurrentEmailCountdown] = useState(0)
    const [newEmailCountdown, setNewEmailCountdown] = useState(0)

    // 昵称修改状态
    const [displayNameLoading, setDisplayNameLoading] = useState(false)

    usePageTitle('账户安全管理')

    useEffect(() => {
        if (user) {
            displayNameForm.setFieldValue('displayName', user.displayName)
        }
    }, [user, displayNameForm])

    // 倒计时效果
    useEffect(() => {
        let timer: number
        if (emailCodeCountdown > 0) {
            timer = setTimeout(() => setEmailCodeCountdown(emailCodeCountdown - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [emailCodeCountdown])

    useEffect(() => {
        let timer: number
        if (currentEmailCountdown > 0) {
            timer = setTimeout(() => setCurrentEmailCountdown(currentEmailCountdown - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [currentEmailCountdown])

    useEffect(() => {
        let timer: number
        if (newEmailCountdown > 0) {
            timer = setTimeout(() => setNewEmailCountdown(newEmailCountdown - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [newEmailCountdown])

    // 修改昵称
    const handleUpdateDisplayName = async (values: { displayName: string }) => {
        setDisplayNameLoading(true)
        try {
            await dispatch(updateUserProfile(values)).unwrap()
            message.success('昵称修改成功')
            await dispatch(getCurrentUser())
        } catch (error) {
            message.error('修改失败')
        } finally {
            setDisplayNameLoading(false)
        }
    }

    // 密码修改流程
    const sendPasswordResetCode = async () => {
        try {
            await api.post('/api/email/send-code', {
                email: user?.email,
                codeType: 'PASSWORD_RESET'
            })
            setEmailCodeCountdown(60)
            message.success('验证码已发送到您的邮箱')
        } catch (error: any) {
            message.error(error.message || '发送验证码失败')
        }
    }

    const verifyPasswordResetCode = async () => {
        const code = passwordForm.getFieldValue('verificationCode')
        if (!code) {
            message.error('请输入验证码')
            return
        }

        try {
            const response = await api.post('/api/email/verify-code', {
                email: user?.email,
                code,
                codeType: 'PASSWORD_RESET'
            })
            if (response.data) {
                setPasswordStep(1)
                message.success('验证码验证成功')
            }
        } catch (error: any) {
            message.error(error.message || '验证码错误')
        }
    }

    const handlePasswordChange = async () => {
        setPasswordLoading(true)
        try {
            const values = await passwordForm.validateFields()

            // 验证当前密码
            await api.post('/api/user/verify-password', {
                currentPassword: values.currentPassword
            })

            // 修改密码
            await api.put('/api/user/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            })

            message.success('密码修改成功，请重新登录')
            setPasswordModalVisible(false)
            resetPasswordForm()

            // 可能需要重新登录
            setTimeout(() => {
                window.location.href = '/auth/login'
            }, 2000)
        } catch (error: any) {
            message.error(error.message || '密码修改失败')
        } finally {
            setPasswordLoading(false)
        }
    }

    // 邮箱换绑流程
    const sendCurrentEmailCode = async () => {
        try {
            await api.post('/api/email/send-code', {
                email: user?.email,
                codeType: 'EMAIL_CHANGE'
            })
            setCurrentEmailCountdown(60)
            message.success('验证码已发送到当前邮箱')
        } catch (error: any) {
            message.error(error.message || '发送验证码失败')
        }
    }

    const verifyCurrentEmail = async () => {
        const code = emailForm.getFieldValue('currentEmailCode')
        if (!code) {
            message.error('请输入当前邮箱验证码')
            return
        }

        try {
            const response = await api.post('/api/email/verify-code', {
                email: user?.email,
                code,
                codeType: 'EMAIL_CHANGE'
            })
            if (response.data) {
                setCurrentEmailVerified(true)
                setEmailStep(1)
                message.success('当前邮箱验证成功')
            }
        } catch (error: any) {
            message.error(error.message || '验证码错误')
        }
    }

    const verifyEmailPassword = async () => {
        const password = emailForm.getFieldValue('currentPassword')
        if (!password) {
            message.error('请输入当前密码')
            return
        }

        try {
            await api.post('/api/user/verify-password', {
                currentPassword: password
            })
            setEmailPasswordVerified(true)
            setEmailStep(2)
            message.success('密码验证成功')
        } catch (error: any) {
            message.error(error.message || '密码错误')
        }
    }

    const sendNewEmailCode = async () => {
        const newEmail = emailForm.getFieldValue('newEmail')
        if (!newEmail) {
            message.error('请输入新邮箱地址')
            return
        }

        try {
            await api.post('/api/email/send-code', {
                email: newEmail,
                codeType: 'EMAIL_CHANGE'
            })
            setNewEmailCountdown(60)
            message.success('验证码已发送到新邮箱')
        } catch (error: any) {
            message.error(error.message || '发送验证码失败')
        }
    }

    const verifyNewEmail = async () => {
        const code = emailForm.getFieldValue('newEmailCode')
        const newEmail = emailForm.getFieldValue('newEmail')

        if (!code) {
            message.error('请输入新邮箱验证码')
            return
        }

        try {
            const response = await api.post('/api/email/verify-code', {
                email: newEmail,
                code,
                codeType: 'EMAIL_CHANGE'
            })
            if (response.data) {
                setNewEmailVerified(true)
                setEmailStep(3)
                message.success('新邮箱验证成功')
            }
        } catch (error: any) {
            message.error(error.message || '验证码错误')
        }
    }

    const handleEmailChange = async () => {
        setEmailLoading(true)
        try {
            const values = await emailForm.validateFields()

            await api.put('/api/user/change-email', {
                currentPassword: values.currentPassword,
                newEmail: values.newEmail,
                currentEmailCode: values.currentEmailCode,
                newEmailCode: values.newEmailCode
            })

            message.success('邮箱换绑成功')
            setEmailModalVisible(false)
            resetEmailForm()
            await dispatch(getCurrentUser())
        } catch (error: any) {
            message.error(error.message || '邮箱换绑失败')
        } finally {
            setEmailLoading(false)
        }
    }

    const resetPasswordForm = () => {
        passwordForm.resetFields()
        setPasswordStep(0)
        setEmailCodeCountdown(0)
    }

    const resetEmailForm = () => {
        emailForm.resetFields()
        setEmailStep(0)
        setCurrentEmailVerified(false)
        setEmailPasswordVerified(false)
        setNewEmailVerified(false)
        setCurrentEmailCountdown(0)
        setNewEmailCountdown(0)
    }

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px'
    }

    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        color: 'white'
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: `url('/background_placeholder.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
        }}>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(102, 126, 234, 0.4)',
                backdropFilter: 'blur(1px)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 10 }}>
                <Navbar />
            </div>

            <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', paddingBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <PageTitle
                        title="个人中心"
                        subtitle="管理您的个人信息、安全设置和订阅偏好"
                        showBreadcrumb={false}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '800px', padding: '0 1rem' }}>

                        <Tabs defaultActiveKey="profile" size="large" centered>
                            <TabPane tab={
                                <span>
                                    <UserOutlined />
                                    个人资料
                                </span>
                            } key="profile">
                                {/* 昵称修改 */}
                                <Card title={
                                    <Space>
                                        <UserOutlined style={{ color: '#1890ff' }} />
                                        <span style={{ color: 'white' }}>修改昵称</span>
                                    </Space>
                                } style={{ ...cardStyle, marginBottom: '2rem' }}>
                                    <Form form={displayNameForm} onFinish={handleUpdateDisplayName} layout="vertical">
                                        <Form.Item
                                            label={<span style={{ color: 'white' }}>显示名称</span>}
                                            name="displayName"
                                            rules={[
                                                { required: true, message: '请输入显示名称' },
                                                { min: 2, message: '显示名称至少2个字符' }
                                            ]}
                                        >
                                            <Input
                                                placeholder="显示名称"
                                                style={inputStyle}
                                                size="large"
                                            />
                                        </Form.Item>
                                        <Button
                                            type="primary"
                                            onClick={() => displayNameForm.submit()}
                                            loading={displayNameLoading}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                borderRadius: '8px'
                                            }}
                                        >
                                            保存修改
                                        </Button>
                                    </Form>
                                </Card>
                            </TabPane>

                            <TabPane tab={
                                <span>
                                    <LockOutlined />
                                    安全设置
                                </span>
                            } key="security">
                                {/* 密码修改 */}
                                <Card title={
                                    <Space>
                                        <LockOutlined style={{ color: '#f5222d' }} />
                                        <span style={{ color: 'white' }}>修改密码</span>
                                    </Space>
                                } style={{ ...cardStyle, marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Text style={{ color: 'white', fontSize: '16px' }}>当前密码</Text>
                                            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                                                上次修改：*** (为安全考虑不显示)
                                            </div>
                                        </div>
                                        <Button
                                            type="primary"
                                            onClick={() => setPasswordModalVisible(true)}
                                            style={{
                                                background: 'rgba(245, 34, 45, 0.8)',
                                                border: 'none',
                                                borderRadius: '8px'
                                            }}
                                        >
                                            修改密码
                                        </Button>
                                    </div>
                                </Card>

                                {/* 邮箱换绑 */}
                                <Card title={
                                    <Space>
                                        <MailOutlined style={{ color: '#52c41a' }} />
                                        <span style={{ color: 'white' }}>邮箱管理</span>
                                    </Space>
                                } style={cardStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Text style={{ color: 'white', fontSize: '16px' }}>当前邮箱</Text>
                                            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                                                {user?.email}
                                            </div>
                                        </div>
                                        <Button
                                            type="primary"
                                            onClick={() => setEmailModalVisible(true)}
                                            style={{
                                                background: 'rgba(82, 196, 26, 0.8)',
                                                border: 'none',
                                                borderRadius: '8px'
                                            }}
                                        >
                                            更换邮箱
                                        </Button>
                                    </div>
                                </Card>
                            </TabPane>

                            <TabPane tab={
                                <span>
                                    <BellOutlined />
                                    订阅管理
                                </span>
                            } key="subscriptions">
                                {/* 订阅管理组件 */}
                                <UserSubscriptionManagement />
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* 密码修改弹窗 */}
            <Modal
                title={null}
                open={passwordModalVisible}
                onCancel={() => {
                    setPasswordModalVisible(false)
                    resetPasswordForm()
                }}
                footer={null}
                width={600}
                centered
                closable={false}
                styles={{
                    content: { background: 'transparent', boxShadow: 'none', padding: 0 },
                    body: { padding: 0 },
                    mask: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }
                }}
            >
                <div style={{
                    ...modalGlassCardStyle,
                    padding: '24px',
                }}>
                    <Title level={4} style={{
                        color: 'white',
                        margin: 0,
                        marginBottom: '24px',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                        textAlign: 'center'
                    }}>
                        <Space>
                            <LockOutlined />
                            <span>修改密码</span>
                        </Space>
                    </Title>

                    <Steps
                        current={passwordStep}
                        size="small"
                        style={{ marginBottom: '2rem' }}
                        items={[
                            { title: '邮箱验证', icon: <MailOutlined /> },
                            { title: '设置新密码', icon: <LockOutlined /> }
                        ]}
                    />

                    <Form form={passwordForm} layout="vertical">
                        {passwordStep === 0 && (
                            <div>
                                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                                    <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                                    <Title level={4} style={{ marginTop: '1rem', color: 'white' }}>安全验证</Title>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>为了您的账户安全，请先验证邮箱</Text>
                                </div>

                                <Form.Item
                                    label={<span style={{ color: 'white' }}>邮箱验证码</span>}
                                    name="verificationCode"
                                    rules={[{ required: true, message: '请输入验证码' }]}
                                >
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input
                                            placeholder="请输入6位验证码"
                                            maxLength={6}
                                            style={{ width: '70%', ...inputStyle }}
                                        />
                                        <Button
                                            onClick={sendPasswordResetCode}
                                            disabled={emailCodeCountdown > 0}
                                            style={{ width: '30%' }}
                                        >
                                            {emailCodeCountdown > 0 ? `${emailCodeCountdown}s` : '发送验证码'}
                                        </Button>
                                    </Space.Compact>
                                </Form.Item>

                                <Button type="primary" onClick={verifyPasswordResetCode} block>
                                    验证邮箱
                                </Button>
                            </div>
                        )}

                        {passwordStep === 1 && (
                            <div>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>当前密码</span>}
                                    name="currentPassword"
                                    rules={[{ required: true, message: '请输入当前密码' }]}
                                >
                                    <Input.Password
                                        placeholder="请输入当前密码"
                                        style={inputStyle}
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span style={{ color: 'white' }}>新密码</span>}
                                    name="newPassword"
                                    rules={[
                                        { required: true, message: '请输入新密码' },
                                        { min: 6, message: '密码至少6位字符' }
                                    ]}
                                >
                                    <Input.Password
                                        placeholder="请输入新密码"
                                        style={inputStyle}
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span style={{ color: 'white' }}>确认新密码</span>}
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: '请确认新密码' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve()
                                                }
                                                return Promise.reject(new Error('两次输入的密码不一致'))
                                            }
                                        })
                                    ]}
                                >
                                    <Input.Password
                                        placeholder="请再次输入新密码"
                                        style={inputStyle}
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    onClick={handlePasswordChange}
                                    loading={passwordLoading}
                                    block
                                >
                                    确认修改
                                </Button>
                            </div>
                        )}
                    </Form>

                    <div style={{ textAlign: 'right', marginTop: '24px' }}>
                        <Button onClick={() => {
                            setPasswordModalVisible(false)
                            resetPasswordForm()
                        }} style={{ marginRight: 8 }}>
                            取消
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* 邮箱换绑弹窗 */}
            <Modal
                title={null}
                open={emailModalVisible}
                onCancel={() => {
                    setEmailModalVisible(false)
                    resetEmailForm()
                }}
                footer={null}
                width={700}
                centered
                closable={false}
                styles={{
                    content: { background: 'transparent', boxShadow: 'none', padding: 0 },
                    body: { padding: 0 },
                    mask: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }
                }}
            >
                <div style={{
                    ...modalGlassCardStyle,
                    padding: '24px',
                }}>
                    <Title level={4} style={{
                        color: 'white',
                        margin: 0,
                        marginBottom: '24px',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                        textAlign: 'center'
                    }}>
                        <Space>
                            <MailOutlined />
                            <span>更换邮箱</span>
                        </Space>
                    </Title>

                    <Steps
                        current={emailStep}
                        size="small"
                        style={{ marginBottom: '2rem' }}
                        items={[
                            {
                                title: '验证当前邮箱',
                                icon: currentEmailVerified ? <CheckCircleOutlined /> : <MailOutlined />,
                                status: currentEmailVerified ? 'finish' : emailStep === 0 ? 'process' : 'wait'
                            },
                            {
                                title: '验证密码',
                                icon: emailPasswordVerified ? <CheckCircleOutlined /> : <LockOutlined />,
                                status: emailPasswordVerified ? 'finish' : emailStep === 1 ? 'process' : 'wait'
                            },
                            {
                                title: '验证新邮箱',
                                icon: newEmailVerified ? <CheckCircleOutlined /> : <MailOutlined />,
                                status: newEmailVerified ? 'finish' : emailStep === 2 ? 'process' : 'wait'
                            },
                            {
                                title: '完成换绑',
                                icon: <CheckCircleOutlined />,
                                status: emailStep === 3 ? 'process' : 'wait'
                            }
                        ]}
                    />

                    <Form form={emailForm} layout="vertical">
                        {emailStep === 0 && (
                            <div>
                                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(24, 144, 255, 0.1)', borderRadius: '8px' }}>
                                    <Text style={{ color: 'white' }}>当前邮箱：{user?.email}</Text>
                                </div>

                                <Form.Item
                                    label={<span style={{ color: 'white' }}>邮箱验证码</span>}
                                    name="currentEmailCode"
                                    rules={[{ required: true, message: '请输入验证码' }]}
                                >
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input
                                            placeholder="请输入6位验证码"
                                            maxLength={6}
                                            style={{ width: '70%', ...inputStyle }}
                                        />
                                        <Button
                                            onClick={sendCurrentEmailCode}
                                            disabled={currentEmailCountdown > 0}
                                            style={{ width: '30%' }}
                                        >
                                            {currentEmailCountdown > 0 ? `${currentEmailCountdown}s` : '发送验证码'}
                                        </Button>
                                    </Space.Compact>
                                </Form.Item>

                                <Button type="primary" onClick={verifyCurrentEmail} block>
                                    验证当前邮箱
                                </Button>
                            </div>
                        )}

                        {emailStep === 1 && (
                            <div>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>当前密码</span>}
                                    name="currentPassword"
                                    rules={[{ required: true, message: '请输入当前密码' }]}
                                >
                                    <Input.Password
                                        placeholder="请输入当前密码进行安全验证"
                                        style={inputStyle}
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>

                                <Button type="primary" onClick={verifyEmailPassword} block>
                                    验证密码
                                </Button>
                            </div>
                        )}

                        {emailStep === 2 && (
                            <div>
                                <Form.Item
                                    label={<span style={{ color: 'white' }}>新邮箱地址</span>}
                                    name="newEmail"
                                    rules={[
                                        { required: true, message: '请输入新邮箱地址' },
                                        { type: 'email', message: '邮箱格式不正确' }
                                    ]}
                                >
                                    <Input placeholder="请输入新邮箱地址" style={inputStyle} />
                                </Form.Item>

                                <Form.Item
                                    label={<span style={{ color: 'white' }}>新邮箱验证码</span>}
                                    name="newEmailCode"
                                    rules={[{ required: true, message: '请输入新邮箱验证码' }]}
                                >
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input
                                            placeholder="请输入6位验证码"
                                            maxLength={6}
                                            style={{ width: '70%', ...inputStyle }}
                                        />
                                        <Button
                                            onClick={sendNewEmailCode}
                                            disabled={newEmailCountdown > 0}
                                            style={{ width: '30%' }}
                                        >
                                            {newEmailCountdown > 0 ? `${newEmailCountdown}s` : '发送验证码'}
                                        </Button>
                                    </Space.Compact>
                                </Form.Item>

                                <Button type="primary" onClick={verifyNewEmail} block>
                                    验证新邮箱
                                </Button>
                            </div>
                        )}

                        {emailStep === 3 && (
                            <div style={{ textAlign: 'center' }}>
                                <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '1rem' }} />
                                <Title level={3} style={{ color: 'white' }}>验证完成</Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>所有验证步骤已完成，点击下方按钮完成邮箱换绑</Text>

                                <Divider />

                                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <Text style={{ color: 'white' }}>当前邮箱：{user?.email}</Text>
                                    <br />
                                    <Text style={{ color: 'white' }}>新邮箱：{emailForm.getFieldValue('newEmail')}</Text>
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleEmailChange}
                                    loading={emailLoading}
                                    style={{ marginTop: '1rem' }}
                                    block
                                >
                                    确认更换邮箱
                                </Button>
                            </div>
                        )}
                    </Form>

                    <div style={{ textAlign: 'right', marginTop: '24px' }}>
                        <Button onClick={() => {
                            setEmailModalVisible(false)
                            resetEmailForm()
                        }} style={{ marginRight: 8 }}>
                            取消
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default UserProfileManagement
