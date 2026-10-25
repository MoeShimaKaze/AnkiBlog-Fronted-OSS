import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Pagination, Spin, Typography, Tag, Button } from 'antd';
import { ShoppingOutlined, AppstoreOutlined, UnorderedListOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Common/Navbar';
import PublicProductFilterBar from '@/components/Product/PublicProductFilterBar';
import { getProducts, type PublicProductFilterParams } from '@/services/products';
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";
import { interactiveGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

const { Title, Text } = Typography;

// 与后端响应匹配的数据结构
interface Product {
    id: string;
    name: string;
    summary?: string;
    price: number;
    originalPrice?: number;
    mainImage: string;
    slug: string;
    categoryName: string;
    featured: boolean;
    clickCount: number;
    viewCount?: number;
    hasDiscount?: boolean;
    isPurchased?: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface ProductsResponse {
    content: Product[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
}

type ViewType = 'grid' | 'list';

const ProductListPage: React.FC = () => {
    usePageTitle('商品列表', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(12);
    const [filters, setFilters] = useState<Partial<PublicProductFilterParams>>({
        sort: 'createdAt,desc'
    });
    const [viewType, setViewType] = useState<ViewType>('grid');

    const fetchProducts = useCallback(async (page = 1, currentFilters = filters) => {
        setLoading(true);
        try {
            const params: PublicProductFilterParams = {
                page: page - 1,
                size: pageSize,
                ...currentFilters,
            };
            const response: ApiResponse<ProductsResponse> = await getProducts(params);
            if (response && response.success && response.data) {
                setProducts(response.data.content || []);
                setTotal(response.data.totalElements || 0);
            } else {
                setProducts([]);
                setTotal(0);
            }
        } catch (error: any) {
            console.error('获取衣橱失败:', error);
            setProducts([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [pageSize, filters]);

    useEffect(() => {
        fetchProducts(current, filters);
    }, [current, filters]);

    const handleFilterChange = (newFilters: Partial<PublicProductFilterParams>) => {
        setFilters(newFilters);
        setCurrent(1);
    };

    const handlePageChange = (page: number) => setCurrent(page);
    const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

    const handleBuyClick = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        fetch(`/api/public/products/${product.id}/click`, { method: 'POST' }).catch(err => console.warn('记录点击统计失败:', err));
        window.open('#', '_blank');
    };

    const glassCardStyle: React.CSSProperties = {
        ...interactiveGlassCardStyle,
        height: '100%'
    };

    const renderGridView = () => (
        <Row gutter={[24, 24]}>
            {products.map(product => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                    <Link to={`/products/${product.slug}`} style={{ height: '100%', display: 'block' }}>
                        <div
                            style={{
                                ...glassCardStyle,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '420px' // 设置统一的最小高度
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ position: 'relative', height: '200px', flexShrink: 0 }}>
                                <img
                                    src={product.mainImage || '/placeholder-product.jpg'}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                                    {product.isPurchased && <Tag color="green" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>已购买</Tag>}
                                    {product.featured && <Tag color="orange" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>推荐</Tag>}
                                    {product.hasDiscount && <Tag color="red" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>优惠</Tag>}
                                </div>
                            </div>

                            <div style={{
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        ...primaryTextStyle,
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        margin: '0 0 8px 0',
                                        lineHeight: '1.4',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        minHeight: '2.8rem' // 标题固定高度
                                    }}>
                                        {product.name}
                                    </h3>
                                    <p style={{
                                        ...secondaryTextStyle,
                                        fontSize: '0.85rem',
                                        lineHeight: '1.5',
                                        margin: '0 0 12px 0',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        minHeight: '2.6rem' // 描述固定高度
                                    }}>
                                        {product.summary || '暂无描述'}
                                    </p>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ef4444' }}>{formatPrice(product.price)}</span>
                                            {product.originalPrice && <span style={{ ...secondaryTextStyle, fontSize: '0.8rem', textDecoration: 'line-through', marginLeft: '8px' }}>{formatPrice(product.originalPrice)}</span>}
                                        </div>
                                        <Button type="primary" size="small" onClick={(e) => handleBuyClick(e, product)}>购买</Button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', ...secondaryTextStyle }}>
                                        <Tag color="blue" style={{ fontSize: '0.7rem' }}>{product.categoryName || '未分类'}</Tag>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <EyeOutlined />
                                            <span>{product.viewCount || product.clickCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </Col>
            ))}
        </Row>
    );

    const renderListView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {products.map(product => (
                <Link key={product.id} to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                        style={{ ...glassCardStyle, padding: '1.5rem' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0, position: 'relative' }}>
                                <img src={product.mainImage || '/placeholder-product.jpg'} alt={product.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ position: 'absolute', top: '4px', left: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {product.isPurchased && <Tag color="green" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>已购买</Tag>}
                                    {product.featured && <Tag color="orange" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>推荐</Tag>}
                                    {product.hasDiscount && <Tag color="red" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>优惠</Tag>}
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ ...primaryTextStyle, fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.75rem 0', lineHeight: '1.4' }}>
                                    {product.name}
                                </h3>
                                <p style={{ ...secondaryTextStyle, margin: '0 0 1rem 0', lineHeight: '1.6', fontSize: '0.9rem' }}>
                                    {product.summary || '暂无描述'}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{formatPrice(product.price)}</span>
                                            {product.originalPrice && <span style={{ ...secondaryTextStyle, fontSize: '1rem', textDecoration: 'line-through', marginLeft: '8px' }}>{formatPrice(product.originalPrice)}</span>}
                                        </div>
                                        <Tag color="blue">{product.categoryName || '未分类'}</Tag>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ ...secondaryTextStyle, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                            <EyeOutlined /><span>{product.viewCount || product.clickCount || 0}</span>
                                        </div>
                                        <Button type="primary" onClick={(e) => handleBuyClick(e, product)}>立即购买</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundImage: `url('/background_placeholder.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(2px)', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 10 }}> <Navbar /> </div>
            <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', paddingBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title level={1} style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontSize: '2.5rem', margin: 0 }}>
                        衣橱列表
                    </Title>
                </div>

                {/* 筛选区域 */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '100%', maxWidth: '1200px', padding: '0 1rem' }}>
                        <PublicProductFilterBar
                            onFilterChange={handleFilterChange}
                            initialFilters={filters}
                            showSearch={true}
                            showFeatured={true}
                            showPurchased={true}
                            showCategory={true}
                            showTags={true}
                            showDateRange={false}
                            showPriceRange={true}
                            showSort={true}
                            defaultCollapsed={true}
                        />
                        {/* 视图切换按钮 */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
                            <Button
                                type={viewType === 'grid' ? 'primary' : 'default'}
                                icon={<AppstoreOutlined />}
                                onClick={() => setViewType('grid')}
                            >
                                网格视图
                            </Button>
                            <Button
                                type={viewType === 'list' ? 'primary' : 'default'}
                                icon={<UnorderedListOutlined />}
                                onClick={() => setViewType('list')}
                            >
                                列表视图
                            </Button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: viewType === 'grid' ? '1200px' : '800px', padding: '0 1rem' }}>
                        {loading ? (
                            <div style={{ ...glassCardStyle, padding: '3rem', textAlign: 'center' }}>
                                <Spin size="large" />
                                <div style={{ marginTop: '1rem', color: 'white' }}>正在加载衣橱...</div>
                            </div>
                        ) : products.length === 0 ? (
                            <div style={{ ...glassCardStyle, padding: '3rem', textAlign: 'center' }}>
                                <ShoppingOutlined style={{ fontSize: '3rem', color: 'white', opacity: 0.6, marginBottom: '1rem' }} />
                                <Title level={3} style={{ color: 'white', margin: '0 0 1rem 0' }}>{filters.keyword ? '没有找到相关衣橱' : '暂无衣橱内容'}</Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {filters.keyword ? `搜索 "${filters.keyword}" 没有找到匹配的衣橱，请尝试其他关键词` : '还没有上架衣橱，请稍后再来看看吧'}
                                </Text>
                            </div>
                        ) : (
                            <div>
                                {viewType === 'grid' ? renderGridView() : renderListView()}
                                {total > pageSize && (
                                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                        <div style={{...glassCardStyle, padding: '1rem', display: 'inline-block' }}>
                                            <Pagination current={current} total={total} pageSize={pageSize} onChange={handlePageChange} showSizeChanger={false} showQuickJumper
                                                        showTotal={(total, range) => <span style={{ color: 'white' }}>第 {range[0]}-{range[1]} 条，共 {total} 条</span>}
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

export default ProductListPage;
