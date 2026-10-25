// src/pages/admin/UserManagement/AdminUserLikeManagement.tsx
import React, { useState, useEffect } from 'react';
import {
    Table, Button, Input, Space, Tag, Modal, Avatar, Pagination, ConfigProvider,
    Tabs, List, Typography, Empty, Spin, Popconfirm, Card, Row, Col, Statistic
} from 'antd';
import {
    UserOutlined, EyeOutlined, DeleteOutlined, ClockCircleOutlined,
    ShoppingOutlined, FileTextOutlined, ReloadOutlined, HeartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as userService from '@/services/userService';
import {
    getAdminUserLikedArticles,
    getAdminUserFavoriteProducts,
    removeUserArticleLike,
    removeUserProductFavorite,
    getUserInteractionStats
} from '@/services/interactions';
import { formatDate, formatNumber } from '@/utils/format';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import type { AdminUser } from '@/services/userService';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { Article } from '@/types/article';
import type { Product } from '@/types/product';
import { userGlassCardStyle } from '@/constants/styles';

const { Title, Text, Paragraph } = Typography;

interface UserInteractionStats {
    likedArticlesCount: number;
    favoriteProductsCount: number;
    totalInteractions: number;
}

const AdminUserLikeManagement: React.FC = () => {
    usePageTitle('用户收藏管理');

    // 用户列表状态
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // 收藏详情状态
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState('articles');
    const [likedArticles, setLikedArticles] = useState<Article[]>([]);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<UserInteractionStats>({ likedArticlesCount: 0, favoriteProductsCount: 0, totalInteractions: 0 });
    const [articlesLoading, setArticlesLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize, searchText]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await userService.getUsers({
                page: currentPage - 1,
                size: pageSize,
                keyword: searchText
            });
            if (result.success) {
                setUsers(result.data.content);
                setTotal(result.data.totalElements);
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const showUserDetail = async (user: AdminUser) => {
        setSelectedUser(user);
        setDetailModalVisible(true);
        await fetchUserStats(user.id);
        if (activeTab === 'articles') {
            await fetchLikedArticles(user.id);
        } else {
            await fetchFavoriteProducts(user.id);
        }
    };

    const fetchUserStats = async (userId: string) => {
        try {
            const response = await getUserInteractionStats(userId);
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('获取用户统计失败:', error);
        }
    };

    const fetchLikedArticles = async (userId: string) => {
        setArticlesLoading(true);
        try {
            const response: ApiResponse<PageResponse<Article>> = await getAdminUserLikedArticles(userId);
            if (response.success) {
                setLikedArticles(response.data.content);
            }
        } catch (error) {
            console.error('获取收藏文章失败:', error);
        } finally {
            setArticlesLoading(false);
        }
    };

    const fetchFavoriteProducts = async (userId: string) => {
        setProductsLoading(true);
        try {
            const response: ApiResponse<PageResponse<Product>> = await getAdminUserFavoriteProducts(userId);
            if (response.success) {
                setFavoriteProducts(response.data.content);
            }
        } catch (error) {
            console.error('获取收藏商品失败:', error);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleRemoveArticleLike = async (articleId: string) => {
        if (!selectedUser) return;
        setRemoveLoading(true);
        try {
            await removeUserArticleLike(selectedUser.id, articleId);
            await fetchLikedArticles(selectedUser.id);
            await fetchUserStats(selectedUser.id);
        } catch (error) {
            console.error('移除文章收藏失败:', error);
        } finally {
            setRemoveLoading(false);
        }
    };

    const handleRemoveProductFavorite = async (productId: string) => {
        if (!selectedUser) return;
        setRemoveLoading(true);
        try {
            await removeUserProductFavorite(selectedUser.id, productId);
            await fetchFavoriteProducts(selectedUser.id);
            await fetchUserStats(selectedUser.id);
        } catch (error) {
            console.error('移除商品收藏失败:', error);
        } finally {
            setRemoveLoading(false);
        }
    };

    const onTabChange = async (key: string) => {
        setActiveTab(key);
        if (!selectedUser) return;

        if (key === 'articles') {
            await fetchLikedArticles(selectedUser.id);
        } else {
            await fetchFavoriteProducts(selectedUser.id);
        }
    };

    const columns: ColumnsType<AdminUser> = [
        {
            title: '用户',
            dataIndex: 'username',
            key: 'username',
            render: (_text, record) => (
                <Space>
                    <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
                    <div>
                        <div style={{ color: 'white', fontWeight: 'medium' }}>
                            {record.displayName || record.username}
                        </div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                            {record.email}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            width: 100,
            align: 'center',
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
                    {role === 'ADMIN' ? '管理员' : '用户'}
                </Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center',
            render: (status) => {
                const statusMap = {
                    PENDING: { color: 'orange', text: '待审核' },
                    ACTIVE: { color: 'green', text: '正常' },
                    INACTIVE: { color: 'red', text: '已禁用' },
                    DELETED: { color: 'red', text: '已删除' }
                };
                const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: '注册时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            align: 'center',
            render: (time) => <span style={{ color: 'white' }}>{new Date(time).toLocaleDateString('zh-CN')}</span>
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => showUserDetail(record)}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white'
                    }}
                >
                    查看收藏
                </Button>
            )
        },
    ];

    const glassCardStyle: React.CSSProperties = userGlassCardStyle;

    const renderArticleItem = (article: any) => (
        <List.Item
            key={article.id}
            style={{ ...glassCardStyle, padding: '1.5rem', marginBottom: '1rem' }}
            actions={[
                <Popconfirm
                    key="remove"
                    title="确认移除收藏"
                    description="此操作将移除用户对该文章的收藏，确认继续？"
                    onConfirm={() => handleRemoveArticleLike(article.id)}
                    okText="确认"
                    cancelText="取消"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        loading={removeLoading}
                        style={{ color: 'rgba(255, 100, 100, 0.8)' }}
                    >
                        移除收藏
                    </Button>
                </Popconfirm>
            ]}
        >
            <List.Item.Meta
                avatar={<Avatar src={article.coverImage} icon={<FileTextOutlined />} size={64} shape="square" style={{ borderRadius: '8px' }} />}
                title={<Title level={4} style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>{article.title}</Title>}
                description={
                    <div>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0' }}>
                            {article.excerpt}
                        </Paragraph>
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
                }
            />
        </List.Item>
    );

    const renderProductItem = (product: any) => (
        <List.Item
            key={product.id}
            style={{ ...glassCardStyle, padding: '1.5rem', marginBottom: '1rem' }}
            actions={[
                <Popconfirm
                    key="remove"
                    title="确认移除收藏"
                    description="此操作将移除用户对该商品的收藏，确认继续？"
                    onConfirm={() => handleRemoveProductFavorite(product.id)}
                    okText="确认"
                    cancelText="取消"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        loading={removeLoading}
                        style={{ color: 'rgba(255, 100, 100, 0.8)' }}
                    >
                        移除收藏
                    </Button>
                </Popconfirm>
            ]}
        >
            <List.Item.Meta
                avatar={<Avatar src={product.mainImage} icon={<ShoppingOutlined />} size={64} shape="square" style={{ borderRadius: '8px' }} />}
                title={<Title level={4} style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>{product.name}</Title>}
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
                        <Paragraph ellipsis={{ rows: 2 }} style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {product.summary || product.description}
                        </Paragraph>
                    </div>
                }
            />
        </List.Item>
    );

    const glassMorphismTheme = {
        token: {
            colorText: 'rgba(255, 255, 255, 0.85)',
            colorTextHeading: 'rgba(255, 255, 255, 1)',
            colorBorderSecondary: 'rgba(255, 255, 255, 0.2)',
            colorBgElevated: 'rgba(35, 42, 62, 0.9)',
        },
        components: {
            Table: {
                colorBgContainer: 'transparent',
                headerBg: 'transparent',
                rowHoverBg: 'rgba(255, 255, 255, 0.1)',
                headerColor: 'rgba(255, 255, 255, 1)',
                headerSplitColor: 'rgba(255, 255, 255, 0.2)',
            },
            Modal: {
                contentBg: 'rgba(35, 42, 62, 0.95)',
                headerBg: 'rgba(35, 42, 62, 0.95)',
                titleColor: 'rgba(255, 255, 255, 1)',
            },
            Input: {
                colorBgContainer: 'rgba(0, 0, 0, 0.2)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
            },
        },
    };

    return (
        <ConfigProvider theme={glassMorphismTheme}>
            <div style={{
                minHeight: '100vh',
                backgroundImage: `url('/background_placeholder.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                padding: '24px'
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                            用户收藏管理
                        </h1>
                        <Input.Search
                            placeholder="搜索用户名、邮箱..."
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                            enterButton
                            allowClear
                        />
                    </div>

                    <Card style={glassCardStyle} bodyStyle={{ padding: '24px' }}>
                        <Table
                            columns={columns}
                            dataSource={users}
                            loading={loading}
                            rowKey="id"
                            pagination={false}
                        />
                        {total > 0 && (
                            <div style={{ padding: '24px 0 0', textAlign: 'center' }}>
                                <Pagination
                                    current={currentPage}
                                    total={total}
                                    pageSize={pageSize}
                                    showSizeChanger
                                    onChange={(page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size || 10);
                                    }}
                                />
                            </div>
                        )}
                    </Card>

                    <Modal
                        title={
                            <Space>
                                <HeartOutlined />
                                <span>{selectedUser?.displayName || selectedUser?.username} 的收藏管理</span>
                            </Space>
                        }
                        open={detailModalVisible}
                        onCancel={() => setDetailModalVisible(false)}
                        footer={null}
                        width={1000}
                        style={{ top: 20 }}
                    >
                        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                            <Col span={8}>
                                <Card style={glassCardStyle}>
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>收藏文章</span>}
                                        value={stats.likedArticlesCount}
                                        prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                                        valueStyle={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card style={glassCardStyle}>
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>收藏商品</span>}
                                        value={stats.favoriteProductsCount}
                                        prefix={<ShoppingOutlined style={{ color: '#52c41a' }} />}
                                        valueStyle={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card style={glassCardStyle}>
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>总交互</span>}
                                        value={stats.totalInteractions}
                                        prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                                        valueStyle={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Tabs
                            activeKey={activeTab}
                            onChange={onTabChange}
                            tabBarExtraContent={
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        if (selectedUser) {
                                            fetchUserStats(selectedUser.id);
                                            if (activeTab === 'articles') {
                                                fetchLikedArticles(selectedUser.id);
                                            } else {
                                                fetchFavoriteProducts(selectedUser.id);
                                            }
                                        }
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white'
                                    }}
                                >
                                    刷新
                                </Button>
                            }
                            items={[
                                {
                                    key: 'articles',
                                    label: (
                                        <Space>
                                            <FileTextOutlined />
                                            收藏文章 ({stats.likedArticlesCount})
                                        </Space>
                                    ),
                                    children: (
                                        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
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
                                                        description={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>该用户暂无收藏的文章</Text>}
                                                        style={{ padding: '2rem' }}
                                                    />
                                                )}
                                            </Spin>
                                        </div>
                                    )
                                },
                                {
                                    key: 'products',
                                    label: (
                                        <Space>
                                            <ShoppingOutlined />
                                            收藏商品 ({stats.favoriteProductsCount})
                                        </Space>
                                    ),
                                    children: (
                                        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
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
                                                        description={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>该用户暂无收藏的商品</Text>}
                                                        style={{ padding: '2rem' }}
                                                    />
                                                )}
                                            </Spin>
                                        </div>
                                    )
                                }
                            ]}
                            tabBarStyle={{
                                color: 'white',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                        />
                    </Modal>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default AdminUserLikeManagement;
