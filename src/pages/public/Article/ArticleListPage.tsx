// ArticleListPage.tsx - 修复版本
import React, { useState } from 'react';
import { Row, Col, Input, Select, Pagination, Spin, Typography, Tag } from 'antd';
import { SearchOutlined, FileTextOutlined, CalendarOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import Navbar from '../../../components/Common/Navbar';
import { useArticles } from '@/hooks/api/useArticles';
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";
import { interactiveGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ArticleListPage: React.FC = () => {
    usePageTitle('文章列表', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki の栖脚处'
    })

    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [sortBy, setSortBy] = useState('publishedAt');

    // 使用定义好的useArticles hook
    const { articles, loading, total, error } = useArticles({
        page: current - 1,
        size: pageSize,
        keyword: keyword || undefined,
        sort: [`pinned,desc`, `${sortBy},${sortBy === 'title' ? 'asc' : 'desc'}`],
    });

    const handleSearch = (value: string) => {
        setKeyword(value);
        setCurrent(1);
    };

    const handlePageChange = (page: number) => {
        setCurrent(page);
    };

    const glassCardStyle = interactiveGlassCardStyle;

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
                    <Title
                        level={1}
                        style={{
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            fontSize: '2.5rem',
                            margin: 0
                        }}
                    >
                        文章列表
                    </Title>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '100%', maxWidth: '800px', padding: '0 1rem' }}>
                        <div
                            style={{
                                ...glassCardStyle,
                                padding: '1.5rem',
                                cursor: 'default'
                            }}
                        >
                            <Row gutter={[16, 16]} align="middle">
                                <Col xs={24} md={16}>
                                    <Search
                                        placeholder="搜索文章标题、内容..."
                                        allowClear
                                        enterButton="搜索"
                                        size="large"
                                        onSearch={handleSearch}
                                        prefix={<SearchOutlined />}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Select
                                        value={sortBy}
                                        onChange={setSortBy}
                                        size="large"
                                        style={{ width: '100%' }}
                                        dropdownStyle={{
                                            background: 'rgba(35, 35, 45, 0.85)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <Option value="publishedAt">最新发布</Option>
                                        <Option value="updatedAt">最近更新</Option>
                                        <Option value="title">标题排序</Option>
                                        <Option value="viewCount">热门文章</Option>
                                    </Select>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '800px', padding: '0 1rem' }}>

                        {loading ? (
                            <div
                                style={{
                                    ...glassCardStyle,
                                    padding: '3rem',
                                    textAlign: 'center',
                                    cursor: 'default'
                                }}
                            >
                                <Spin size="large" />
                                <div style={{ marginTop: '1rem', color: 'white' }}>正在加载文章...</div>
                            </div>
                        ) : error ? (
                            <div
                                style={{
                                    ...glassCardStyle,
                                    padding: '3rem',
                                    textAlign: 'center',
                                    cursor: 'default'
                                }}
                            >
                                <FileTextOutlined style={{ fontSize: '3rem', color: 'white', opacity: 0.6, marginBottom: '1rem' }} />
                                <Title level={3} style={{ color: 'white', margin: '0 0 1rem 0' }}>
                                    加载失败
                                </Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {error}
                                </Text>
                            </div>
                        ) : articles.length === 0 ? (
                            <div
                                style={{
                                    ...glassCardStyle,
                                    padding: '3rem',
                                    textAlign: 'center',
                                    cursor: 'default'
                                }}
                            >
                                <FileTextOutlined style={{ fontSize: '3rem', color: 'white', opacity: 0.6, marginBottom: '1rem' }} />
                                <Title level={3} style={{ color: 'white', margin: '0 0 1rem 0' }}>
                                    {keyword ? '没有找到相关文章' : '暂无文章内容'}
                                </Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {keyword
                                        ? `搜索 "${keyword}" 没有找到匹配的文章，请尝试其他关键词`
                                        : '站长还没有发布文章，请稍后再来看看吧'
                                    }
                                </Text>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {articles.map((article) => (
                                    <Link key={article.id} to={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                                        <div
                                            style={{
                                                ...glassCardStyle,
                                                padding: '1.5rem',
                                                // 置顶文章特殊样式
                                                ...(article.pinned && {
                                                    border: '2px solid rgba(255, 215, 0, 0.5)',
                                                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
                                                })
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = article.pinned ? '0 0 15px rgba(255, 215, 0, 0.2)' : 'none';
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                                <div style={{ flexShrink: 0 }}>
                                                    {article.coverImage ? (
                                                        <img
                                                            src={article.coverImage}
                                                            alt={article.title}
                                                            style={{
                                                                width: '120px',
                                                                height: '120px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: '120px',
                                                                height: '120px',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                borderRadius: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            <div style={{ textAlign: 'center' }}>
                                                                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📝</div>
                                                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>暂无配图</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        {article.pinned && (
                                                            <Tag
                                                                color="gold"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4a 100%)',
                                                                    color: '#000',
                                                                    border: 'none',
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.75rem',
                                                                    padding: '2px 8px',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                置顶
                                                            </Tag>
                                                        )}
                                                        <h3 style={{
                                                            ...primaryTextStyle,
                                                            fontSize: '1.25rem',
                                                            fontWeight: 'bold',
                                                            margin: 0,
                                                            lineHeight: '1.4'
                                                        }}>
                                                            {article.title}
                                                        </h3>
                                                    </div>

                                                    <p style={{
                                                        ...secondaryTextStyle,
                                                        margin: '0 0 1rem 0',
                                                        lineHeight: '1.6',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {article.excerpt}
                                                    </p>

                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        flexWrap: 'wrap',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                            {(article.tags || []).slice(0, 3).map(tag => (
                                                                <Tag
                                                                    key={tag.id || tag.name}
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '12px',
                                                                        fontSize: '0.75rem',
                                                                        padding: '2px 8px'
                                                                    }}
                                                                >
                                                                    {tag.name}
                                                                </Tag>
                                                            ))}
                                                            {(article.tags || []).length > 3 && (
                                                                <Tag style={{
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.75rem',
                                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                                    color: 'white',
                                                                    border: 'none'
                                                                }}>
                                                                    +{(article.tags || []).length - 3}
                                                                </Tag>
                                                            )}
                                                        </div>

                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '1rem',
                                                            fontSize: '0.8rem',
                                                            ...secondaryTextStyle
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <CalendarOutlined />
                                                                <span>{article.publishedAt ? dayjs(article.publishedAt).format('MM-DD') : '-'}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <ClockCircleOutlined />
                                                                <span>{article.readingTime}分钟</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <EyeOutlined />
                                                                <span>{article.viewCount}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {total > pageSize && (
                                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                        <div
                                            style={{
                                                ...glassCardStyle,
                                                padding: '1rem',
                                                display: 'inline-block',
                                                cursor: 'default'
                                            }}
                                        >
                                            <Pagination
                                                current={current}
                                                total={total}
                                                pageSize={pageSize}
                                                onChange={handlePageChange}
                                                showSizeChanger={false}
                                                showQuickJumper
                                                showTotal={(total, range) =>
                                                    <span style={{ color: 'white' }}>
                                                        第 {range[0]}-{range[1]} 条，共 {total} 条
                                                    </span>
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleListPage;
