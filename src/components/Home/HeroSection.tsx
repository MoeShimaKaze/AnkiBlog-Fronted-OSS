// src/components/Home/HeroSection.tsx
import React, { useEffect, useState } from 'react'
import { Typography, Button, Row, Col, Card, Space, Spin, Alert } from 'antd'
import { Link } from 'react-router-dom'
import {
    FileTextOutlined,
    ShoppingOutlined,
    SearchOutlined,
    UserOutlined,
    HeartOutlined,
    EditOutlined,
    ArrowRightOutlined,
    ThunderboltOutlined,
    CheckSquareOutlined,
    AimOutlined
} from '@ant-design/icons'
import FeaturedArticles from '../Article/FeaturedArticles'
import FeaturedProducts from '../Product/FeaturedProducts'
import Navbar from '../Common/Navbar'
import { useAuth } from '@/hooks/auth/useAuth'
import { useAppDispatch } from '@/hooks/redux'
import { getCurrentUser } from '@/store/slices/authSlice'
import { getSiteBasicInfo, SiteBasicInfo } from '@/services/siteConfig'

const { Title, Text } = Typography

const HeroSection: React.FC = () => {
    const { user, isAuthenticated } = useAuth()
    const dispatch = useAppDispatch()

    const [siteConfig, setSiteConfig] = useState<SiteBasicInfo | null>(null)
    const [configLoading, setConfigLoading] = useState(true)
    const [configError, setConfigError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSiteConfig = async () => {
            try {
                setConfigLoading(true)
                setConfigError(null)
                const response = await getSiteBasicInfo()
                if (response.success && response.data) {
                    setSiteConfig(response.data)
                } else {
                    setConfigError('获取站点配置失败')
                }
            } catch (error) {
                console.error('获取站点配置失败:', error)
                setSiteConfig({
                    siteName: 'AnkiBlog',
                    siteTagline: '个人博客与商品推荐平台',
                    heroTitle: '欢迎来到我的个人空间',
                    heroSubtitle: '这里记录着我的思考、分享着有趣的内容，也推荐一些优质的产品。让我们一起探索知识的边界，发现生活的美好。',
                    themeColor: '#007bff'
                })
            } finally {
                setConfigLoading(false)
            }
        }
        fetchSiteConfig()
    }, [])

    useEffect(() => {
        if (isAuthenticated && !user) {
            dispatch(getCurrentUser())
        }
    }, [isAuthenticated, user, dispatch])

    return (
        <div
            className="hero-section relative w-full min-h-screen"
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: `url('/background_placeholder.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* 导航栏 */}
            <Navbar />

            <div
                className="absolute inset-0"
                style={{
                    background: 'rgba(102, 126, 234, 0.4)',
                    backdropFilter: 'blur(1px)'
                }}
            />

            {/* 主内容区域 - 响应式设计 */}
            <div
                className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8"
                style={{
                    minHeight: '60vh',
                    paddingTop: '2rem',
                    paddingBottom: '2rem'
                }}
            >
                <div className="text-center w-full max-w-6xl">
                    {configLoading ? (
                        <div style={{ padding: '40px 0' }}>
                            <Spin size="large" />
                            <Text style={{ color: 'white', display: 'block', marginTop: '16px', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                正在加载站点配置...
                            </Text>
                        </div>
                    ) : (
                        <>
                            {configError && (
                                <div style={{ marginBottom: '24px' }}>
                                    <Alert
                                        message={configError}
                                        type="warning"
                                        showIcon
                                        style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white' }}
                                    />
                                </div>
                            )}
                            <Title
                                level={1}
                                style={{
                                    color: 'white',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                    fontSize: 'clamp(1.75rem, 8vw, 4.5rem)',
                                    fontWeight: 700,
                                    marginBottom: '24px',
                                    textAlign: 'center',
                                    lineHeight: '1.2'
                                }}
                            >
                                {siteConfig?.heroTitle || '欢迎来到我的个人空间'}
                            </Title>
                            <Text
                                style={{
                                    color: 'white',
                                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                                    fontSize: 'clamp(0.875rem, 4vw, 1.5rem)',
                                    fontWeight: 300,
                                    lineHeight: 1.6,
                                    display: 'block',
                                    marginBottom: '48px',
                                    textAlign: 'center',
                                    padding: '0 16px'
                                }}
                            >
                                {siteConfig?.heroSubtitle?.split('\n').map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        {index < (siteConfig?.heroSubtitle?.split('\n').length || 1) - 1 && <br />}
                                    </React.Fragment>
                                )) || (
                                    <>
                                        这里记录着我的思考、分享着有趣的内容，也推荐一些优质的产品。
                                        <br className="hidden sm:block" />
                                        让我们一起探索知识的边界，发现生活的美好。
                                    </>
                                )}
                            </Text>
                        </>
                    )}

                    {/* 响应式按钮布局 - 横屏最多5个一行，竖屏一行一个 */}
                    <style>{`
                        .hero-buttons-grid {
                            display: grid;
                            gap: 12px;
                            max-width: 900px;
                            width: 100%;
                            padding: 0 16px;
                        }
                        /* 桌面端：最多5个一行 */
                        @media (min-width: 769px) {
                            .hero-buttons-grid {
                                grid-template-columns: repeat(5, 1fr);
                            }
                        }
                        /* 平板端：3个一行 */
                        @media (min-width: 577px) and (max-width: 768px) {
                            .hero-buttons-grid {
                                grid-template-columns: repeat(3, 1fr);
                            }
                        }
                        /* 移动端竖屏：一行一个 */
                        @media (max-width: 576px) {
                            .hero-buttons-grid {
                                grid-template-columns: 1fr;
                            }
                        }
                    `}</style>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '48px' }}>
                        <div className="hero-buttons-grid">
                            <Link to="/articles">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<FileTextOutlined />}
                                    className="hero-button"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        borderRadius: '25px',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: 'clamp(12px, 3vw, 14px)'
                                    }}
                                >
                                    阅读文章
                                </Button>
                            </Link>
                            <Link to="/products">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ShoppingOutlined />}
                                    className="hero-button"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        borderRadius: '25px',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: 'clamp(12px, 3vw, 14px)'
                                    }}
                                >
                                    发现好物
                                </Button>
                            </Link>
                            <Link to="/daily-outfit">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ThunderboltOutlined />}
                                    className="hero-button"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        borderRadius: '25px',
                                        background: 'rgba(255, 193, 7, 0.25)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 193, 7, 0.5)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: 'clamp(12px, 3vw, 14px)'
                                    }}
                                >
                                    今天穿什么
                                </Button>
                            </Link>
                            <Link to="/todos">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CheckSquareOutlined />}
                                    className="hero-button"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        borderRadius: '25px',
                                        background: 'rgba(82, 196, 26, 0.25)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(82, 196, 26, 0.5)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: 'clamp(12px, 3vw, 14px)'
                                    }}
                                >
                                    我的待办
                                </Button>
                            </Link>
                            <Link to="/goals">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<AimOutlined />}
                                    className="hero-button"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        borderRadius: '25px',
                                        background: 'rgba(74, 222, 128, 0.25)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(74, 222, 128, 0.5)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: 'clamp(12px, 3vw, 14px)'
                                    }}
                                >
                                    打卡进度
                                </Button>
                            </Link>
                            <Link to="/search">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SearchOutlined />}
                                    className="hero-button"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        borderRadius: '25px',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: 'clamp(12px, 3vw, 14px)'
                                    }}
                                >
                                    搜索内容
                                </Button>
                            </Link>
                            <Link to="/user/dashboard">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<UserOutlined />}
                                    className="hero-button"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        borderRadius: '25px',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: 'clamp(12px, 3vw, 14px)'
                                    }}
                                >
                                    个人中心
                                </Button>
                            </Link>
                            <Link to="/user/profile">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<HeartOutlined />}
                                    className="hero-button"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        borderRadius: '25px',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: 'clamp(12px, 3vw, 14px)'
                                    }}
                                >
                                    我的收藏
                                </Button>
                            </Link>
                            <Link to="/auth/register">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<EditOutlined />}
                                    className="hero-button"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        borderRadius: '25px',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: 'clamp(12px, 3vw, 14px)'
                                    }}
                                >
                                    加入我们
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 底部内容区域 - 响应式网格 */}
            <div className="relative z-10 pb-16 px-4 sm:px-6 lg:px-8">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <Row gutter={[24, 24]} justify="center">
                        <Col xs={24} lg={12}>
                            <Card
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    height: '100%'
                                }}
                                bodyStyle={{ padding: '20px' }}
                            >
                                <Space direction="vertical" size="middle" className="w-full">
                                    <div className="flex justify-between items-center">
                                        <Title level={3} style={{ margin: 0, color: 'white', fontSize: 'clamp(18px, 4vw, 24px)' }}>精选文章</Title>
                                        <Link to="/articles">
                                            <Button type="text" icon={<ArrowRightOutlined />} style={{ color: 'white' }}>更多</Button>
                                        </Link>
                                    </div>
                                    <FeaturedArticles />
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    height: '100%'
                                }}
                                bodyStyle={{ padding: '20px' }}
                            >
                                <Space direction="vertical" size="middle" className="w-full">
                                    <div className="flex justify-between items-center">
                                        <Title level={3} style={{ margin: 0, color: 'white', fontSize: 'clamp(18px, 4vw, 24px)' }}>推荐商品</Title>
                                        <Link to="/products">
                                            <Button type="text" icon={<ArrowRightOutlined />} style={{ color: 'white' }}>更多</Button>
                                        </Link>
                                    </div>
                                    <FeaturedProducts />
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
}

export default HeroSection