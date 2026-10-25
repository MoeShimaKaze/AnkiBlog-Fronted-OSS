// src/pages/user/Profile/UserProfile.tsx - 修复头像上传
import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Avatar, message } from 'antd'
import { UserOutlined, SaveOutlined, ReloadOutlined, EditOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/auth/useAuth.ts'
import { useAppDispatch } from '@/hooks/redux.ts'
import { updateUserProfile, getCurrentUser } from '@/store/slices/authSlice.ts'
import { usePageTitle } from '@/hooks/business/usePageTitle'
import PageTitle from '@/components/Common/PageTitle'
import Navbar from '@/components/Common/Navbar'
import AvatarUploader from '@/components/Upload/AvatarUploader' // 修改：使用专门的头像上传组件
import ImageViewer from '@/components/UI/ImageViewer'

interface EditState {
    displayName: boolean
    bio: boolean
    website: boolean
}

const UserProfile: React.FC = () => {
    usePageTitle('个人资料', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const { user, loading } = useAuth()
    const dispatch = useAppDispatch()
    const [form] = Form.useForm()
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl)
    const [editState, setEditState] = useState<EditState>({
        displayName: false,
        bio: false,
        website: false
    })
    const [avatarViewerVisible, setAvatarViewerVisible] = useState(false)

    usePageTitle(
        user?.displayName ? `${user.displayName}的个人资料` : '个人资料',
        user ? {
            '{userName}': user.displayName,
            '{userRole}': user.role === 'ADMIN' ? '管理员' : '用户'
        } : undefined
    )

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                displayName: user.displayName,
                email: user.email,
                bio: user.bio,
                website: user.website,
            })
            setAvatarUrl(user.avatarUrl)
        }
    }, [user, form])

    const handleSubmit = async (values: {
        displayName: string
        bio: string
        website: string
    }) => {
        try {
            await dispatch(updateUserProfile(values)).unwrap()
            message.success('个人资料更新成功')

            setEditState({
                displayName: false,
                bio: false,
                website: false
            })

            await dispatch(getCurrentUser())
        } catch (error) {
            message.error('更新失败')
        }
    }

    // 修改：头像上传成功后的处理
    const handleAvatarUpload = async (newAvatarUrl: string) => {
        setAvatarUrl(newAvatarUrl)
        // 头像上传接口会返回更新后的用户信息，所以重新获取用户数据
        await dispatch(getCurrentUser())
    }

    const handleReset = () => {
        form.resetFields()
        setAvatarUrl(user?.avatarUrl)
        setEditState({
            displayName: false,
            bio: false,
            website: false
        })
    }

    const toggleEdit = (field: keyof EditState) => {
        setEditState(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const cancelEdit = (field: keyof EditState) => {
        setEditState(prev => ({
            ...prev,
            [field]: false
        }))
        if (user) {
            form.setFieldValue(field, user[field])
        }
    }

    const handleViewAvatar = () => {
        if (avatarUrl || user?.avatarUrl) {
            setAvatarViewerVisible(true)
        } else {
            message.info('暂无头像')
        }
    }

    const fieldContainerStyle = {
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '25px',
    }

    const editButtonContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '12px'
    }

    return (
        <div
            className="user-profile-page"
            style={{
                minHeight: '100vh',
                backgroundImage: `url('/background_placeholder.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
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

            <div style={{ position: 'relative', zIndex: 10 }}>
                <Navbar />
            </div>

            <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', paddingBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <PageTitle
                        title={user?.displayName ? `${user.displayName}的个人资料` : '个人资料'}
                        subtitle="管理您的个人信息和账户设置"
                        showBreadcrumb={false}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '600px', padding: '0 1rem' }}>
                        <Card
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px'
                            }}
                            bodyStyle={{ padding: '2rem' }}
                        >
                            {/* 头像上传区域 - 修改为使用AvatarUploader */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
                                    <Avatar
                                        size={120}
                                        src={avatarUrl || user?.avatarUrl}
                                        icon={<UserOutlined />}
                                        style={{
                                            border: '4px solid rgba(255, 255, 255, 0.3)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                            cursor: 'pointer'
                                        }}
                                        key={`${avatarUrl}-${user?.avatarUrl}`}
                                        onClick={handleViewAvatar}
                                    />

                                    {(avatarUrl || user?.avatarUrl) && (
                                        <Button
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={handleViewAvatar}
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                background: 'rgba(0, 0, 0, 0.6)',
                                                border: 'none',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px'
                                            }}
                                            title="查看头像"
                                        />
                                    )}
                                </div>

                                {/* 修改：使用专门的AvatarUploader组件 */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <AvatarUploader
                                        value={avatarUrl || user?.avatarUrl}
                                        onChange={handleAvatarUpload}
                                        size={80}
                                    />
                                </div>

                                <div style={{
                                    marginTop: '8px',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '12px'
                                }}>
                                    支持图片裁剪，点击头像可查看大图
                                </div>
                            </div>

                            {/* 表单区域 - 保持不变 */}
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                size="large"
                            >
                                {/* 显示名称字段 */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        color: 'white',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        显示名称
                                    </div>
                                    <div style={{
                                        ...fieldContainerStyle,
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 20px',
                                        minHeight: '50px'
                                    }}>
                                        <Form.Item
                                            name="displayName"
                                            rules={[
                                                { required: true, message: '请输入显示名称' },
                                                { min: 2, message: '显示名称至少2个字符' }
                                            ]}
                                            style={{ flex: 1, margin: 0 }}
                                        >
                                            <Input
                                                placeholder="显示名称"
                                                variant="borderless"
                                                disabled={!editState.displayName}
                                                style={{
                                                    background: 'transparent',
                                                    color: 'white',
                                                    fontSize: '16px'
                                                }}
                                            />
                                        </Form.Item>
                                        <div style={editButtonContainerStyle}>
                                            {editState.displayName ? (
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <Button
                                                        size="small"
                                                        icon={<CheckOutlined />}
                                                        style={{
                                                            background: 'rgba(76, 175, 80, 0.8)',
                                                            border: 'none',
                                                            color: 'white',
                                                            width: '24px',
                                                            height: '24px',
                                                            padding: 0,
                                                            borderRadius: '4px'
                                                        }}
                                                        onClick={() => toggleEdit('displayName')}
                                                    />
                                                    <Button
                                                        size="small"
                                                        icon={<CloseOutlined />}
                                                        style={{
                                                            background: 'rgba(244, 67, 54, 0.8)',
                                                            border: 'none',
                                                            color: 'white',
                                                            width: '24px',
                                                            height: '24px',
                                                            padding: 0,
                                                            borderRadius: '4px'
                                                        }}
                                                        onClick={() => cancelEdit('displayName')}
                                                    />
                                                </div>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: '2px solid white',
                                                        color: 'white',
                                                        width: '24px',
                                                        height: '24px',
                                                        padding: 0,
                                                        borderRadius: '4px'
                                                    }}
                                                    onClick={() => toggleEdit('displayName')}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 个人简介字段 */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        color: 'white',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        个人简介
                                    </div>
                                    <div style={{
                                        ...fieldContainerStyle,
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        padding: '15px 20px'
                                    }}>
                                        <Form.Item
                                            name="bio"
                                            style={{ flex: 1, margin: 0 }}
                                        >
                                            <Input.TextArea
                                                placeholder="个人简介"
                                                rows={3}
                                                maxLength={200}
                                                disabled={!editState.bio}
                                                variant="borderless"
                                                style={{
                                                    background: 'transparent',
                                                    color: 'white',
                                                    resize: 'none',
                                                    padding: 0
                                                }}
                                            />
                                        </Form.Item>
                                        <div style={{
                                            ...editButtonContainerStyle,
                                            alignSelf: 'center',
                                            marginTop: '0'
                                        }}>
                                            {editState.bio ? (
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <Button
                                                        size="small"
                                                        icon={<CheckOutlined />}
                                                        style={{
                                                            background: 'rgba(76, 175, 80, 0.8)',
                                                            border: 'none',
                                                            color: 'white',
                                                            width: '24px',
                                                            height: '24px',
                                                            padding: 0,
                                                            borderRadius: '4px'
                                                        }}
                                                        onClick={() => toggleEdit('bio')}
                                                    />
                                                    <Button
                                                        size="small"
                                                        icon={<CloseOutlined />}
                                                        style={{
                                                            background: 'rgba(244, 67, 54, 0.8)',
                                                            border: 'none',
                                                            color: 'white',
                                                            width: '24px',
                                                            height: '24px',
                                                            padding: 0,
                                                            borderRadius: '4px'
                                                        }}
                                                        onClick={() => cancelEdit('bio')}
                                                    />
                                                </div>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: '2px solid white',
                                                        color: 'white',
                                                        width: '24px',
                                                        height: '24px',
                                                        padding: 0,
                                                        borderRadius: '4px'
                                                    }}
                                                    onClick={() => toggleEdit('bio')}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 个人网站字段 */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        color: 'white',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        个人网站
                                    </div>
                                    <div style={{
                                        ...fieldContainerStyle,
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 20px',
                                        minHeight: '50px'
                                    }}>
                                        <Form.Item
                                            name="website"
                                            rules={[{ type: 'url', message: '请输入有效的网址' }]}
                                            style={{ flex: 1, margin: 0 }}
                                        >
                                            <Input
                                                placeholder="个人网站"
                                                variant="borderless"
                                                disabled={!editState.website}
                                                style={{
                                                    background: 'transparent',
                                                    color: 'white',
                                                    fontSize: '16px'
                                                }}
                                            />
                                        </Form.Item>
                                        <div style={editButtonContainerStyle}>
                                            {editState.website ? (
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <Button
                                                        size="small"
                                                        icon={<CheckOutlined />}
                                                        style={{
                                                            background: 'rgba(76, 175, 80, 0.8)',
                                                            border: 'none',
                                                            color: 'white',
                                                            width: '24px',
                                                            height: '24px',
                                                            padding: 0,
                                                            borderRadius: '4px'
                                                        }}
                                                        onClick={() => toggleEdit('website')}
                                                    />
                                                    <Button
                                                        size="small"
                                                        icon={<CloseOutlined />}
                                                        style={{
                                                            background: 'rgba(244, 67, 54, 0.8)',
                                                            border: 'none',
                                                            color: 'white',
                                                            width: '24px',
                                                            height: '24px',
                                                            padding: 0,
                                                            borderRadius: '4px'
                                                        }}
                                                        onClick={() => cancelEdit('website')}
                                                    />
                                                </div>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: '2px solid white',
                                                        color: 'white',
                                                        width: '24px',
                                                        height: '24px',
                                                        padding: 0,
                                                        borderRadius: '4px'
                                                    }}
                                                    onClick={() => toggleEdit('website')}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 邮箱字段 */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{
                                        color: 'white',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        邮箱地址
                                    </div>
                                    <Form.Item
                                        name="email"
                                        style={{ margin: 0 }}
                                    >
                                        <Input
                                            placeholder="邮箱地址"
                                            disabled
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '25px',
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                height: '50px',
                                                fontSize: '16px',
                                                padding: '0 20px'
                                            }}
                                        />
                                    </Form.Item>
                                </div>

                                {/* 按钮区域 */}
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                                }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        icon={<SaveOutlined />}
                                        style={{
                                            flex: 1,
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
                                        保存更改
                                    </Button>
                                    <Button
                                        onClick={handleReset}
                                        icon={<ReloadOutlined />}
                                        style={{
                                            flex: 1,
                                            height: '50px',
                                            borderRadius: '25px',
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}
                                    >
                                        重置
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </div>
                </div>
            </div>

            <ImageViewer
                src={avatarUrl || user?.avatarUrl || ''}
                alt={`${user?.displayName || '用户'}的头像`}
                visible={avatarViewerVisible}
                onClose={() => setAvatarViewerVisible(false)}
                title="我的头像"
            />
        </div>
    )
}

export default UserProfile