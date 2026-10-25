// SearchResultPage.tsx - 更新搜索结果页面
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input, Tabs, Row, Col, Typography, Spin, Space, Tag, Alert } from 'antd';
import { SearchOutlined, FileTextOutlined, ShoppingOutlined, TagOutlined } from '@ant-design/icons';
import ArticleCard from '../../../components/Article/ArticleCard';
import ProductCard from '../../../components/Product/ProductCard';
import Navbar from '../../../components/Common/Navbar';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { performSearch, setKeyword, addToHistory } from '@/store/slices/searchSlice';
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";

const { Search } = Input;
const { Title, Text } = Typography;

const SearchResultPage: React.FC = () => {
    usePageTitle('搜索结果', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const { keyword, results, loading, history } = useAppSelector(state => state.search);
    const [activeTab, setActiveTab] = useState('all');

    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (query && query !== keyword) {
            dispatch(setKeyword(query));
            dispatch(performSearch(query));
            dispatch(addToHistory(query));
        }
    }, [query, keyword, dispatch]);

    const handleSearch = (value: string) => {
        if (value.trim()) {
            setSearchParams({ q: value.trim() });
        }
    };

    const searchResults = (results.articles?.length || 0) + (results.products?.length || 0);
    const hasTagMatches = results.matchedTags?.length > 0;

    // 标签匹配提示组件
    const TagMatchIndicator = () => {
        if (!hasTagMatches) return null;

        return (
            <Alert
                message={
                    <div>
                        <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
                            🏷️ 智能匹配到相关标签
                        </Text>
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {results.matchedTags.map((tag: any) => (
                                <Tag
                                    key={tag.id}
                                    color="blue"
                                    style={{
                                        background: 'rgba(24, 144, 255, 0.1)',
                                        border: '1px solid rgba(24, 144, 255, 0.3)',
                                        borderRadius: '12px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleSearch(tag.name)}
                                >
                                    <TagOutlined style={{ marginRight: '4px' }} />
                                    {tag.name} ({(tag.articleCount || 0) + (tag.productCount || 0)})
                                </Tag>
                            ))}
                        </div>
                    </div>
                }
                type="info"
                style={{
                    background: 'rgba(24, 144, 255, 0.05)',
                    border: '1px solid rgba(24, 144, 255, 0.2)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                }}
                showIcon={false}
            />
        );
    };

    // 增强的卡片组件
    const EnhancedProductCard = ({ product }: { product: any }) => {
        const matchedTagNames = results.matchedTags?.map((tag: any) => tag.name) || [];
        const hasTagMatch = matchedTagNames.some(tagName =>
            product.tags?.includes(tagName)
        );

        return (
            <div style={{ position: 'relative' }}>
                {hasTagMatch && (
                    <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        🏷️
                    </div>
                )}
                <ProductCard product={product} />
            </div>
        );
    };

    const EnhancedArticleCard = ({ article }: { article: any }) => {
        const matchedTagNames = results.matchedTags?.map((tag: any) => tag.name) || [];
        const hasTagMatch = matchedTagNames.some(tagName =>
            article.tags?.includes(tagName)
        );

        return (
            <div style={{ position: 'relative' }}>
                {hasTagMatch && (
                    <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        🏷️
                    </div>
                )}
                <ArticleCard article={article} />
            </div>
        );
    };

    const tabItems = [
        {
            key: 'all',
            label: (
                <Space>
                    <SearchOutlined />
                    全部 ({searchResults})
                    {hasTagMatches && <span style={{ color: '#1890ff' }}>✨</span>}
                </Space>
            ),
            children: (
                <div className="space-y-8">
                    <TagMatchIndicator />

                    {results.articles?.length > 0 && (
                        <div>
                            <Title level={4} style={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                <FileTextOutlined style={{ marginRight: '8px' }} />
                                文章 ({results.articles.length})
                                {hasTagMatches && (
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginLeft: '8px' }}>
                                        (包含标签匹配内容)
                                    </Text>
                                )}
                            </Title>
                            <Row gutter={[24, 24]}>
                                {results.articles.slice(0, 6).map((article: any) => (
                                    <Col key={article.id} xs={24} sm={12} lg={8}>
                                        <EnhancedArticleCard article={article} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {results.products?.length > 0 && (
                        <div>
                            <Title level={4} style={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                <ShoppingOutlined style={{ marginRight: '8px' }} />
                                商品 ({results.products.length})
                                {hasTagMatches && (
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginLeft: '8px' }}>
                                        (包含标签匹配内容)
                                    </Text>
                                )}
                            </Title>
                            <Row gutter={[24, 24]}>
                                {results.products.slice(0, 6).map((product: any) => (
                                    <Col key={product.id} xs={24} sm={12} lg={8}>
                                        <EnhancedProductCard product={product} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'articles',
            label: (
                <Space>
                    <FileTextOutlined />
                    文章 ({results.articles?.length || 0})
                </Space>
            ),
            children: (
                <div>
                    <TagMatchIndicator />
                    <Row gutter={[24, 24]}>
                        {results.articles?.map((article: any) => (
                            <Col key={article.id} xs={24} sm={12} lg={8}>
                                <EnhancedArticleCard article={article} />
                            </Col>
                        ))}
                    </Row>
                </div>
            ),
        },
        {
            key: 'products',
            label: (
                <Space>
                    <ShoppingOutlined />
                    商品 ({results.products?.length || 0})
                </Space>
            ),
            children: (
                <div>
                    <TagMatchIndicator />
                    <Row gutter={[24, 24]}>
                        {results.products?.map((product: any) => (
                            <Col key={product.id} xs={24} sm={12} lg={8}>
                                <EnhancedProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                </div>
            ),
        },
    ];

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
                        搜索结果
                    </Title>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '100%', maxWidth: '800px', padding: '0 1rem' }}>
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                padding: '1.5rem'
                            }}
                        >
                            <Search
                                placeholder="搜索文章和商品..."
                                allowClear
                                enterButton={
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <SearchOutlined />
                    搜索
                  </span>
                                }
                                size="large"
                                defaultValue={query}
                                onSearch={handleSearch}
                                style={{ marginBottom: '1rem' }}
                            />

                            {query && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <Text style={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                        搜索 "<strong>{query}</strong>" 的结果，找到 {searchResults} 条相关内容
                                        {hasTagMatches && (
                                            <span style={{ color: '#91d5ff', marginLeft: '8px' }}>
                        ✨ 智能匹配到相关标签
                      </span>
                                        )}
                                    </Text>
                                </div>
                            )}

                            {history.length > 0 && !query && (
                                <div>
                                    <Text style={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)', fontSize: '16px', fontWeight: 'bold' }}>
                                        搜索历史
                                    </Text>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {history.map(item => (
                                            <Tag
                                                key={item}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    borderRadius: '12px'
                                                }}
                                                onClick={() => handleSearch(item)}
                                            >
                                                {item}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '1200px', padding: '0 1rem' }}>
                        {loading && (
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    padding: '3rem',
                                    textAlign: 'center'
                                }}
                            >
                                <Spin size="large" />
                                <div style={{ marginTop: '1rem', color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                    正在搜索...
                                </div>
                            </div>
                        )}

                        {!loading && query && searchResults === 0 && (
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    padding: '3rem',
                                    textAlign: 'center'
                                }}
                            >
                                <SearchOutlined style={{ fontSize: '3rem', color: 'white', opacity: 0.6, marginBottom: '1rem' }} />
                                <Title level={3} style={{ color: 'white', margin: '0 0 1rem 0', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                    没有找到相关内容
                                </Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                    搜索 "{query}" 没有找到匹配的文章或商品，请尝试其他关键词
                                </Text>
                            </div>
                        )}

                        {!loading && query && searchResults > 0 && (
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    padding: '1.5rem'
                                }}
                            >
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                    items={tabItems}
                                    size="large"
                                    className="[&_.ant-tabs-tab]:text-white/80 [&_.ant-tabs-tab-active]:text-white"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResultPage;