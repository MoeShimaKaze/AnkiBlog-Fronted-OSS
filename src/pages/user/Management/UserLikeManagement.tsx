// src/pages/user/Management/UserLikeManagement.tsx
import React, { useState, useEffect } from 'react';
import { Tabs, List, Space, Typography, Avatar, Tag, Empty, Spin } from 'antd';
import {EyeOutlined, ClockCircleOutlined, ShoppingOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useUserInteractions } from '@/hooks/api/useInteractions';
import { formatDate, formatNumber } from '@/utils/format';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import Navbar from '@/components/Common/Navbar';
import PageTitle from '@/components/Common/PageTitle';
import { userGlassCardStyle } from '@/constants/styles';

const { Title, Text, Paragraph } = Typography;

const UserLikeManagement: React.FC = () => {
    usePageTitle('我的收藏');
    const [activeTab, setActiveTab] = useState('articles');

    const {
        likedArticles,
        favoriteProducts,
        articlesLoading,
        productsLoading,
        articlesTotal,
        productsTotal,
        fetchLikedArticles,
        fetchFavoriteProducts
    } = useUserInteractions();

    useEffect(() => {
        if (activeTab === 'articles') {
            fetchLikedArticles();
        } else {
            fetchFavoriteProducts();
        }
    }, [activeTab]);

    const glassCardStyle = userGlassCardStyle;

    const renderArticleItem = (article: any) => (
        <List.Item
            key={article.id}
            style={{ ...glassCardStyle, padding: '1.5rem', marginBottom: '1rem' }}
        >
            <List.Item.Meta
                avatar={
                    <Avatar
                        src={article.coverImage}
                        icon={<FileTextOutlined />}
                        size={64}
                        shape="square"
                        style={{ borderRadius: '8px' }}
                    />
                }
                title={
                    <Link to={`/articles/${article.slug}`}>
                        <Title level={4} style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>
                            {article.title}
                        </Title>
                    </Link>
                }
                description={
                    <div>
                        <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0' }}
                        >
                            {article.excerpt}
                        </Paragraph>
                        <Space wrap style={{ marginTop: '0.5rem' }}>
                            {article.tags?.map((tag: any, index: number) => (
                                <Tag key={index} color="blue" style={{ fontSize: '0.8rem' }}>
                                    {typeof tag === 'string' ? tag : tag.name}
                                </Tag>
                            ))}
                        </Space>
                        <div style={{ marginTop: '0.5rem' }}>
                            <Space style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                                <EyeOutlined />
                                <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    {formatNumber(article.viewCount)} 阅读
                                </Text>
                                <ClockCircleOutlined />
                                <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    {formatDate(article.publishedAt)}
                                </Text>
                            </Space>
                        </div>
                    </div>
                }
            />
        </List.Item>
    );

    const renderProductItem = (product: any) => (
        <List.Item
            key={product.id}
            style={{ ...glassCardStyle, padding: '1.5rem', marginBottom: '1rem' }}
        >
            <List.Item.Meta
                avatar={
                    <Avatar
                        src={product.mainImage}
                        icon={<ShoppingOutlined />}
                        size={64}
                        shape="square"
                        style={{ borderRadius: '8px' }}
                    />
                }
                title={
                    <Link to={`/products/${product.slug}`}>
                        <Title level={4} style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>
                            {product.name}
                        </Title>
                    </Link>
                }
                description={
                    <div>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <Text style={{ color: '#ff4d4f', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                ¥{product.price}
                            </Text>
                            {product.originalPrice && (
                                <Text delete style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: '0.5rem' }}>
                                    ¥{product.originalPrice}
                                </Text>
                            )}
                        </div>
                        <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0' }}
                        >
                            {product.summary || product.description}
                        </Paragraph>
                        <Space wrap style={{ marginTop: '0.5rem' }}>
                            {product.tags?.map((tag: string, index: number) => (
                                <Tag key={index} color="green" style={{ fontSize: '0.8rem' }}>
                                    {tag}
                                </Tag>
                            ))}
                        </Space>
                    </div>
                }
            />
        </List.Item>
    );

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
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
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
                        title="我的收藏"
                        subtitle="管理您收藏的文章和商品"
                        showBreadcrumb={false}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '1000px', padding: '0 1rem' }}>
                        <div style={glassCardStyle}>
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                size="large"
                                style={{ padding: '1rem' }}
                                items={[
                                    {
                                        key: 'articles',
                                        label: (
                                            <Space>
                                                <FileTextOutlined />
                                                收藏文章 ({articlesTotal})
                                            </Space>
                                        ),
                                        children: (
                                            <Spin spinning={articlesLoading}>
                                                {likedArticles.length > 0 ? (
                                                    <List
                                                        dataSource={likedArticles}
                                                        renderItem={renderArticleItem}
                                                        style={{ background: 'transparent' }}
                                                    />
                                                ) : (
                                                    <Empty
                                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                        description={
                                                            <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                                暂无收藏的文章
                                                            </Text>
                                                        }
                                                        style={{ padding: '2rem' }}
                                                    />
                                                )}
                                            </Spin>
                                        )
                                    },
                                    {
                                        key: 'products',
                                        label: (
                                            <Space>
                                                <ShoppingOutlined />
                                                收藏商品 ({productsTotal})
                                            </Space>
                                        ),
                                        children: (
                                            <Spin spinning={productsLoading}>
                                                {favoriteProducts.length > 0 ? (
                                                    <List
                                                        dataSource={favoriteProducts}
                                                        renderItem={renderProductItem}
                                                        style={{ background: 'transparent' }}
                                                    />
                                                ) : (
                                                    <Empty
                                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                        description={
                                                            <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                                暂无收藏的商品
                                                            </Text>
                                                        }
                                                        style={{ padding: '2rem' }}
                                                    />
                                                )}
                                            </Spin>
                                        )
                                    }
                                ]}
                                tabBarStyle={{
                                    color: 'white',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLikeManagement;
