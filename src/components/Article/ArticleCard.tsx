import React from 'react'
import { Card, Tag, Space } from 'antd'
import { Link } from 'react-router-dom'
import { CalendarOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Article } from '@/types/article'
import {
    brightShadowedSecondaryTextStyle,
    glassCardStyle,
    primaryTextStyle,
} from '@/constants/styles'

interface ArticleCardProps {
    article: Article
    viewType?: 'grid' | 'list'
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, viewType = 'grid' }) => {
    const displayTags = (article.tags || []).map(tag => typeof tag === 'string' ? tag : tag.name)

    if (viewType === 'list') {
        return (
            <Link to={`/articles/${article.slug}`} className="block">
                <Card
                    hoverable
                    className="transition-all duration-300 hover:shadow-xl border-0"
                    style={{
                        backgroundColor: 'transparent',
                        borderRadius: '0'
                    }}
                    bodyStyle={{
                        padding: '24px',
                        background: 'transparent'
                    }}
                >
                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            {article.coverImage ? (
                                <div className="relative overflow-hidden rounded-lg" style={{ width: '200px', height: '140px' }}>
                                    <img
                                        alt={article.title}
                                        src={article.coverImage}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-lg"
                                    style={{ width: '200px', height: '140px' }}
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-1">📝</div>
                                        <div className="text-xs opacity-80">暂无封面</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="space-y-3">
                                <h3 className="text-xl font-semibold text-gray-800 leading-tight hover:text-blue-600 transition-colors duration-200 m-0">
                                    {article.title}
                                </h3>

                                <p
                                    className="text-gray-600 leading-relaxed m-0"
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {article.excerpt}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-1">
                                        {displayTags.slice(0, 3).map(tag => (
                                            <Tag
                                                key={tag}
                                                color="blue"
                                                className="text-xs border-0"
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    padding: '2px 8px'
                                                }}
                                            >
                                                {tag}
                                            </Tag>
                                        ))}
                                        {displayTags.length > 3 && (
                                            <Tag
                                                color="default"
                                                className="text-xs"
                                                style={{ borderRadius: '12px', fontSize: '11px' }}
                                            >
                                                +{displayTags.length - 3}
                                            </Tag>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <Space size={4}>
                                            <CalendarOutlined />
                                            <span>{article.publishedAt ? dayjs(article.publishedAt).format('YYYY-MM-DD') : '-'}</span>
                                        </Space>
                                        <Space size={4}>
                                            <ClockCircleOutlined />
                                            <span>{article.readingTime}分钟</span>
                                        </Space>
                                        <Space size={4}>
                                            <EyeOutlined />
                                            <span>{article.viewCount}</span>
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
        )
    }

    // grid 视图（首页推荐卡片）
    return (
        <Link to={`/articles/${article.slug}`} className="block">
            <Card
                hoverable
                className="h-full transition-all duration-300 hover:shadow-xl border-0"
                style={{
                    ...glassCardStyle,
                    overflow: 'hidden'
                }}
                cover={
                    <div
                        style={{
                            width: '100%',
                            height: 200,
                            position: 'relative',
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {article.coverImage ? (
                            <img
                                alt={article.title}
                                src={article.coverImage}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                                loading="lazy"
                            />
                        ) : (
                            <div style={{ color: 'white', textAlign: 'center', width: '100%' }}>
                                <div style={{ fontSize: 32, marginBottom: 4 }}>📝</div>
                                <div style={{ fontSize: 12, opacity: 0.8 }}>暂无封面</div>
                            </div>
                        )}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.18), transparent)'
                        }} />
                    </div>
                }
                bodyStyle={{
                    padding: '16px',
                    background: 'transparent'
                }}
            >
                <h3
                    style={{
                        ...primaryTextStyle,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        margin: '0 0 8px 0',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {article.title}
                </h3>

                <p
                    style={{
                        ...brightShadowedSecondaryTextStyle,
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        margin: '0 0 12px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {article.excerpt}
                </p>

                {displayTags.length > 0 && (
                    <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {displayTags.slice(0, 3).map(tag => (
                            <Tag
                                key={tag}
                                color="blue"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    borderRadius: 12,
                                    fontSize: 11,
                                    padding: '2px 8px',
                                    border: 0,
                                    marginRight: 4
                                }}
                            >
                                {tag}
                            </Tag>
                        ))}
                        {displayTags.length > 3 && (
                            <Tag
                                color="default"
                                style={{ borderRadius: 12, fontSize: 11 }}
                            >
                                +{displayTags.length - 3}
                            </Tag>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #444', paddingTop: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Space size={4}>
                            <CalendarOutlined />
                            <span>{article.publishedAt ? dayjs(article.publishedAt).format('MM-DD') : '-'}</span>
                        </Space>
                        <Space size={4}>
                            <ClockCircleOutlined />
                            <span>{article.readingTime}分钟</span>
                        </Space>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <EyeOutlined />
                        <span>{article.viewCount}</span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}

export default ArticleCard
