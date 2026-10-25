// src/pages/user/Dashboard/UserDashboard.tsx - 完整更新版
import React, { useState, useEffect } from 'react'
import { Row, Col, Statistic, Typography, Space, Avatar, Button, Spin, Alert } from 'antd'
import {
    FileTextOutlined,
    MessageOutlined,
    HeartOutlined,
    UserOutlined,
    SettingOutlined,
    EditOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    EyeOutlined,
    ShoppingOutlined,
    StarOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/auth/useAuth'
import { usePageTitle } from '@/hooks/business/usePageTitle'
import { useDashboard } from '@/hooks/dashboard/useDashboard'
import { getMyLikedArticles, getMyFavoriteProducts } from '@/services/interactions'
import PageTitle from '@/components/Common/PageTitle'
import Navbar from '@/components/Common/Navbar'
import ImageViewer from '@/components/UI/ImageViewer'
import { formatRelativeTime, formatNumber } from '@/utils/format'
import { message } from 'antd'

const { Title, Text } = Typography

const UserDashboard: React.FC = () => {
    const { user } = useAuth()
    const { data: dashboardData, loading, error, refetch } = useDashboard()

    // 收藏统计状态
    const [likedArticlesCount, setLikedArticlesCount] = useState(0)
    const [favoriteProductsCount, setFavoriteProductsCount] = useState(0)
    const [likesLoading, setLikesLoading] = useState(false)

    // 头像查看器状态
    const [avatarViewerVisible, setAvatarViewerVisible] = useState(false)

    usePageTitle(
        user?.displayName ? `${user.displayName}的个人中心` : '个人中心',
        user ? {
            '{userName}': user.displayName,
            '{userRole}': user.role === 'ADMIN' ? '管理员' : '用户'
        } : undefined
    )

    // 获取收藏统计
    useEffect(() => {
        if (user) fetchLikeStats()
    }, [user])

    const fetchLikeStats = async () => {
        setLikesLoading(true)
        try {
            const [articlesRes, productsRes] = await Promise.all([
                getMyLikedArticles({ size: 1 }),
                getMyFavoriteProducts({ size: 1 })
            ])

            if (articlesRes.success) {
                setLikedArticlesCount(articlesRes.data.totalElements)
            }
            if (productsRes.success) {
                setFavoriteProductsCount(productsRes.data.totalElements)
            }
        } catch (error) {
            console.error('获取收藏统计失败:', error)
        } finally {
            setLikesLoading(false)
        }
    }

    const handleViewAvatar = () => {
        if (dashboardData?.avatarUrl || user?.avatarUrl) {
            setAvatarViewerVisible(true)
        } else {
            message.info('暂无头像')
        }
    }

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'COMMENT': return '#52c41a'
            case 'LIKE': return '#f5222d'
            case 'FAVORITE': return '#f5222d'
            case 'VIEW': return '#722ed1'
            default: return '#1890ff'
        }
    }

    const quickActions = [
        { title: '浏览文章', desc: '发现更多精彩内容', icon: <FileTextOutlined />, color: '#1890ff', link: '/articles' },
        { title: '我的收藏', desc: '查看收藏的内容', icon: <HeartOutlined />, color: '#f5222d', link: '/user/interactions' },
        { title: '我的评论', desc: '管理评论历史', icon: <MessageOutlined />, color: '#52c41a', link: '/user/comments' },
        { title: '个人设置', desc: '编辑个人信息', icon: <SettingOutlined />, color: '#722ed1', link: '/user/settings' },
    ]

    if (loading || likesLoading) {
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
                <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '20px',
                                padding: '3rem 4rem',
                                textAlign: 'center'
                            }}
                        >
                            <Spin size="large" />
                            <div style={{ marginTop: '1rem', color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                正在加载个人中心...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
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
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '600px', padding: '0 1rem' }}>
                            <Alert
                                message="加载失败"
                                description={error}
                                type="error"
                                action={
                                    <Button size="small" danger onClick={() => { refetch(); fetchLikeStats(); }} icon={<ReloadOutlined />}>
                                        重试
                                    </Button>
                                }
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
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
                        title={user?.displayName ? `${user.displayName}的个人中心` : '个人中心'}
                        subtitle="管理您的个人信息和内容"
                        showBreadcrumb={false}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '1200px', padding: '0 1rem' }}>

                        {/* 用户信息卡片 */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    padding: '2rem'
                                }}
                            >
                                <Space size="large" align="center" style={{ width: '100%' }}>
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <Avatar
                                            size={80}
                                            src={dashboardData?.avatarUrl || user?.avatarUrl}
                                            icon={<UserOutlined />}
                                            style={{
                                                border: '4px solid rgba(255, 255, 255, 0.3)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={handleViewAvatar}
                                        />
                                        {(dashboardData?.avatarUrl || user?.avatarUrl) && (
                                            <Button
                                                size="small"
                                                icon={<EyeOutlined />}
                                                onClick={handleViewAvatar}
                                                style={{
                                                    position: 'absolute',
                                                    top: '2px',
                                                    right: '2px',
                                                    background: 'rgba(0, 0, 0, 0.6)',
                                                    border: 'none',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '10px'
                                                }}
                                                title="查看头像"
                                            />
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <Title level={2} style={{ margin: '0 0 8px 0', color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                            欢迎回来，{dashboardData?.displayName || user?.displayName}
                                        </Title>
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '1px 1px 3px rgba(0,0,0,0.8)', fontSize: '16px' }}>
                                            {user?.bio || '还没有个人简介，去完善一下吧'}
                                        </Text>
                                        {user?.website && (
                                            <div style={{ marginTop: '8px' }}>
                                                <a
                                                    href={user.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: 'rgba(255, 255, 255, 0.9)',
                                                        textDecoration: 'underline',
                                                        textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
                                                    }}
                                                >
                                                    {user.website}
                                                </a>
                                            </div>
                                        )}
                                        {dashboardData?.lastLoginAt && (
                                            <div style={{ marginTop: '4px' }}>
                                                <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                                                    上次登录：{formatRelativeTime(dashboardData.lastLoginAt)}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                    <Link to="/user/profile">
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            编辑资料
                                        </Button>
                                    </Link>
                                </Space>
                            </div>
                        </div>

                        {/* 统计数据 */}
                        <Row gutter={[24, 24]} style={{ marginBottom: '2rem' }}>
                            <Col xs={24} sm={12} lg={6}>
                                <div
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>收藏文章</span>}
                                        value={likedArticlesCount}
                                        prefix={<FileTextOutlined style={{ color: '#3f8600' }} />}
                                        valueStyle={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                                        formatter={(value) => formatNumber(Number(value))}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <div
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>收藏商品</span>}
                                        value={favoriteProductsCount}
                                        prefix={<ShoppingOutlined style={{ color: '#cf1322' }} />}
                                        valueStyle={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                                        formatter={(value) => formatNumber(Number(value))}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <div
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>我的评论</span>}
                                        value={dashboardData?.myCommentsCount || 0}
                                        prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
                                        valueStyle={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                                        formatter={(value) => formatNumber(Number(value))}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <div
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>总收藏</span>}
                                        value={likedArticlesCount + favoriteProductsCount}
                                        prefix={<StarOutlined style={{ color: '#722ed1' }} />}
                                        valueStyle={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                                        formatter={(value) => formatNumber(Number(value))}
                                    />
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={[24, 24]}>
                            {/* 最近活动 */}
                            <Col xs={24} lg={14}>
                                <div
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1.5rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <Title level={3} style={{ margin: 0, color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                            <ClockCircleOutlined className="mr-2" />
                                            最近活动
                                        </Title>
                                        <Link to="/user/activities">
                                            <Button
                                                type="text"
                                                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                            >
                                                查看全部
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="space-y-4">
                                        {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                                            dashboardData.recentActivities.map((activity, index) => (
                                                <div key={activity.id || index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div
                                                        style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            backgroundColor: getActivityColor(activity.type),
                                                            borderRadius: '50%',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <Text style={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                                            {activity.description}
                                                        </Text>
                                                    </div>
                                                    <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                                                        {formatRelativeTime(activity.createdAt)}
                                                    </Text>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                                <ClockCircleOutlined style={{ fontSize: '2rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.5rem' }} />
                                                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                    暂无活动记录
                                                </div>
                                                <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', marginTop: '0.25rem' }}>
                                                    开始浏览和互动来记录您的活动
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Col>

                            {/* 快捷操作 */}
                            <Col xs={24} lg={10}>
                                <div
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1.5rem'
                                    }}
                                >
                                    <Title level={3} style={{ margin: '0 0 1rem 0', color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                        快捷操作
                                    </Title>
                                    <Row gutter={[16, 16]}>
                                        {quickActions.map((action, index) => (
                                            <Col span={12} key={index}>
                                                <Link to={action.link}>
                                                    <div
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.1)',
                                                            backdropFilter: 'blur(10px)',
                                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                                            borderRadius: '8px',
                                                            padding: '1rem',
                                                            textAlign: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            height: '100px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)'
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)'
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                                        }}
                                                    >
                                                        <div style={{ fontSize: '1.5rem', color: action.color, marginBottom: '0.5rem' }}>
                                                            {action.icon}
                                                        </div>
                                                        <div style={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)', fontWeight: 'bold', fontSize: '14px' }}>
                                                            {action.title}
                                                        </div>
                                                        <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginTop: '2px' }}>
                                                            {action.desc}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>

            <ImageViewer
                src={dashboardData?.avatarUrl || user?.avatarUrl || ''}
                alt={`${user?.displayName || '用户'}的头像`}
                visible={avatarViewerVisible}
                onClose={() => setAvatarViewerVisible(false)}
                title="我的头像"
            />
        </div>
    )
}

export default UserDashboard