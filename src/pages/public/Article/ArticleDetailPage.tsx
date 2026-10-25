// src/pages/public/Article/ArticleDetailPage.tsx - 增强版
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {Typography, Space, Tag, Button, message, BackTop, Avatar } from 'antd'
import {
    ArrowLeftOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    ShareAltOutlined,
    HeartOutlined,
    HeartFilled,
    UserOutlined
} from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { getArticleBySlug } from '@/services/articles'
import { useArticleLike } from '@/hooks/api/useInteractions';
import { useAuth } from '@/hooks/auth/useAuth'
import CommentSection from '@/components/Comment/CommentSection'
import { formatDate, formatRelativeTime, formatNumber } from '@/utils/format'
import Navbar from '../../../components/Common/Navbar'
import { Article } from '@/types/article'
import 'highlight.js/styles/github.css'
import { usePageTitle } from '@/hooks/business/usePageTitle'
import { elevatedGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles'

const { Title, Text } = Typography

const ArticleDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [article, setArticle] = useState<Article | null>(null)
    const [loading, setLoading] = useState(true)

    // 收藏功能Hook
    const { isLiked, likeCount, loading: likeLoading, toggle: toggleLike } = useArticleLike(article?.id || '')

    usePageTitle(article?.title, {
        tags: article?.tags?.map(tag => tag.name).join(', '),
        author: article?.authorName
    })

    useEffect(() => {
        if (slug) {
            fetchArticle(slug)
        }
    }, [slug])

    const fetchArticle = async (articleSlug: string) => {
        setLoading(true)
        try {
            const response = await getArticleBySlug(articleSlug);
            setArticle(response.data);
        } catch (error) {
            console.error('获取文章详情失败:', error)
            message.error('文章不存在或已下架')
            navigate('/articles')
        } finally {
            setLoading(false)
        }
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article?.title,
                text: article?.excerpt,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            message.success('链接已复制到剪贴板')
        }
    }

    const handleLike = () => {
        if (!user) {
            message.warning('请先登录后再收藏')
            navigate('/auth/login?return=' + encodeURIComponent(window.location.pathname))
            return
        }
        toggleLike()
    }

    const glassCardStyle = elevatedGlassCardStyle;

    if (loading) {
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
                <div
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '60vh',
                        color: 'white',
                        fontSize: '1.2rem'
                    }}
                >
                    加载中...
                </div>
            </div>
        )
    }

    if (!article) {
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
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: '100%', maxWidth: '900px', padding: '0 1rem' }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/articles')}
                            style={{
                                background: 'rgba(35, 35, 35, 0.65)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                borderRadius: '25px',
                                fontWeight: 'bold'
                            }}
                        >
                            返回文章列表
                        </Button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '900px', padding: '0 1rem' }}>
                        {/* 文章头部信息 */}
                        <div
                            style={{
                                ...glassCardStyle,
                                padding: '2rem',
                                marginBottom: '1.5rem'
                            }}
                        >
                            {article.coverImage && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <img
                                        src={article.coverImage}
                                        alt={article.title}
                                        style={{
                                            width: '100%',
                                            maxHeight: '400px',
                                            objectFit: 'cover',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                                        }}
                                    />
                                </div>
                            )}

                            <Title
                                level={1}
                                style={{
                                    margin: '0 0 1.5rem 0',
                                    ...primaryTextStyle,
                                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                    lineHeight: '1.3'
                                }}
                            >
                                {article.title}
                            </Title>

                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <Space style={secondaryTextStyle}>
                                    <CalendarOutlined />
                                    <Text style={secondaryTextStyle}>
                                        {article.publishedAt && formatDate(article.publishedAt)} ({article.publishedAt && formatRelativeTime(article.publishedAt)})
                                    </Text>
                                </Space>
                                <Space style={secondaryTextStyle}>
                                    <ClockCircleOutlined />
                                    <Text style={secondaryTextStyle}>
                                        {article.readingTime || '-'} 分钟阅读
                                    </Text>
                                </Space>
                                <Space style={secondaryTextStyle}>
                                    <EyeOutlined />
                                    <Text style={secondaryTextStyle}>
                                        {formatNumber(article.viewCount)} 次阅读
                                    </Text>
                                </Space>
                                <Space style={secondaryTextStyle}>
                                    <HeartOutlined />
                                    <Text style={secondaryTextStyle}>
                                        {formatNumber(likeCount)} 次收藏
                                    </Text>
                                </Space>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <Space wrap>
                                    {(article.tags || []).map((tag, index) => (
                                        <Tag
                                            key={tag.id || `${tag.name}-${index}`}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '4px 12px',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {tag.name}
                                        </Tag>
                                    ))}
                                </Space>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <Space>
                                    <Avatar
                                        src={article.authorAvatar}
                                        icon={<UserOutlined />}
                                        size={40}
                                        style={{
                                            border: '2px solid rgba(255, 255, 255, 0.3)'
                                        }}
                                    />
                                    <Text
                                        strong
                                        style={{
                                            ...primaryTextStyle,
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        {article.authorName}
                                    </Text>
                                </Space>

                                <Space>
                                    <Button
                                        icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                                        onClick={handleLike}
                                        loading={likeLoading}
                                        style={{
                                            background: isLiked
                                                ? 'linear-gradient(135deg, #ff6b8a 0%, #ff416c 100%)'
                                                : 'rgba(35, 35, 35, 0.65)',
                                            backdropFilter: 'blur(10px)',
                                            border: isLiked
                                                ? 'none'
                                                : '1px solid rgba(255, 255, 255, 0.3)',
                                            color: 'white',
                                            borderRadius: '20px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {isLiked ? '已收藏' : '收藏'} ({formatNumber(likeCount)})
                                    </Button>
                                    <Button
                                        icon={<ShareAltOutlined />}
                                        onClick={handleShare}
                                        style={{
                                            background: 'rgba(35, 35, 35, 0.65)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            color: 'white',
                                            borderRadius: '20px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        分享
                                    </Button>
                                </Space>
                            </div>
                        </div>

                        {/* 文章正文 */}
                        <div
                            style={{
                                ...glassCardStyle,
                                padding: '2.5rem',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <div
                                className="markdown-content prose max-w-none"
                                style={{
                                    color: 'white',
                                    fontWeight: '500',
                                    lineHeight: '1.7'
                                }}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                >
                                    {article.content}
                                </ReactMarkdown>
                            </div>
                        </div>

                        <div
                            style={{
                                ...glassCardStyle,
                                padding: '2rem'
                            }}
                        >
                            <CommentSection articleId={article.id} />
                        </div>
                    </div>
                </div>
            </div>

            <BackTop />
        </div>
    )
}

export default ArticleDetailPage
