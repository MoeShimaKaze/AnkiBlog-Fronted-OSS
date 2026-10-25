// src/pages/public/Product/ProductDetailPage.tsx - 增强收藏功能版
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Button,
    Typography,
    Space,
    Tag,
    message,
    BackTop,
    Row,
    Col,
    Statistic,
    Spin
} from 'antd';
import {
    ArrowLeftOutlined,
    ShoppingCartOutlined,
    EyeOutlined,
    ShareAltOutlined,
    HeartOutlined,
    HeartFilled,
    TagOutlined,
    DollarOutlined,
    MoreOutlined,
    CheckCircleOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import { getProductBySlug, clickProduct } from '@/services/products';
import * as wardrobeService from '@/services/wardrobeService';
import { useProductFavorite } from '@/hooks/api/useInteractions';
import { useAuth } from '@/hooks/auth/useAuth';
import ProductImageGallery from '@/components/Product/ProductImageGallery';
import ProductRecommendations from '@/components/Product/ProductRecommendations';
import { formatPrice, formatNumber } from '@/utils/format';
import Navbar from '../../../components/Common/Navbar';
import type { Product } from '@/types/product';
import type { ApiResponse } from '@/types/api';
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";
import { primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPurchased, setIsPurchased] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState(false);

    // 判断是否为管理员
    const isAdmin = user?.role === 'ADMIN';

    // 收藏功能Hook
    const { isFavorited, favoriteCount, loading: favoriteLoading, toggle: toggleFavorite } = useProductFavorite(product?.id || '');

    usePageTitle(
        product?.name,
        product ? {
            category: product.categoryName || product.category?.name,
            tags: product.tags?.join(', ')
        } : undefined
    );

    useEffect(() => {
        if (slug) {
            fetchProduct(slug);
        }
    }, [slug]);

    const fetchProduct = async (productSlug: string) => {
        setLoading(true);
        try {
            const response: ApiResponse<Product> = await getProductBySlug(productSlug);
            setProduct(response.data);
            setIsPurchased(response.data.isPurchased || false);
        } catch (error) {
            console.error('获取商品详情失败:', error);
            message.error('商品不存在或已下架');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePurchased = async () => {
        if (!product) return;
        setPurchaseLoading(true);
        try {
            const newStatus = !isPurchased;
            const res = await wardrobeService.markProductPurchased(product.id, newStatus);
            if (res.success) {
                setIsPurchased(newStatus);
                message.success(newStatus ? '已标记为已购买' : '已取消购买标记');
            }
        } catch (error) {
            console.error('更新购买状态失败:', error);
            message.error('操作失败');
        } finally {
            setPurchaseLoading(false);
        }
    };

    const handleBuyClick = async () => {
        if (!product) return;
        try {
            await clickProduct(product.id);
            const buyUrl = product.purchaseUrl;
            if (buyUrl) window.open(buyUrl, '_blank');
            else message.warning('购买链接暂未配置');
        } catch (error) {
            console.error('记录点击失败:', error);
            const buyUrl = product.purchaseUrl;
            if (buyUrl) window.open(buyUrl, '_blank');
        }
    };

    const handleShare = () => {
        const shareData = {
            title: product?.name,
            text: product?.summary || product?.description,
            url: window.location.href,
        };
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(window.location.href);
            message.success('链接已复制到剪贴板');
        }
    };

    const handleFavorite = () => {
        if (!user) {
            message.warning('请先登录后再收藏');
            navigate('/auth/login?return=' + encodeURIComponent(window.location.pathname));
            return;
        }
        toggleFavorite();
    };

    // --- 统一样式定义 ---
    const mainGlassContainerStyle: React.CSSProperties = {
        background: 'rgba(15, 15, 15, 0.25)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        overflow: 'hidden'
    };

    const glassCardStyle: React.CSSProperties = {
        background: 'rgba(35, 35, 35, 0.45)',
        backdropFilter: 'saturate(160%) blur(12px)',
        WebkitBackdropFilter: 'saturate(160%) blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 6px 24px rgba(0,0,0,0.25)'
    };

    const labelTextStyle: React.CSSProperties = { ...secondaryTextStyle, fontWeight: 500 };

    const PageBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div style={{
            minHeight: '100vh',
            backgroundImage: `url('/background_placeholder.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
        }}>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(3px)', zIndex: 0 }} />
            {children}
            <BackTop />
        </div>
    );

    if (loading) {
        return (
            <PageBackground>
                <div style={{ position: 'relative', zIndex: 10 }}> <Navbar /> </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                    <Spin size="large" tip={<span style={{ color: 'white', marginTop: '1rem' }}>加载中...</span>} />
                </div>
            </PageBackground>
        );
    }

    if (!product) {
        return (
            <PageBackground>
                <div style={{ position: 'relative', zIndex: 10 }}> <Navbar /> </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: 'white', fontSize: '1.2rem' }}>
                    商品不存在
                </div>
            </PageBackground>
        );
    }

    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
    const allImages = [product.mainImage, ...(product.images || [])].filter(Boolean);

    return (
        <PageBackground>
            <div style={{ position: 'relative', zIndex: 10 }}>
                <Navbar />
            </div>

            <div style={{ position: 'relative', zIndex: 10, padding: '2rem 1rem 4rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={mainGlassContainerStyle}>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate('/products')}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        borderRadius: '25px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
                                    }}
                                    size="large"
                                >
                                    返回商品列表
                                </Button>
                            </div>

                            <Row gutter={[32, 32]} style={{ marginBottom: '2rem' }}>
                                <Col xs={24} lg={12}>
                                    <div style={{...glassCardStyle, padding: '1rem' }}>
                                        <ProductImageGallery images={allImages} title={product.name} />
                                    </div>
                                </Col>
                                <Col xs={24} lg={12}>
                                    <div style={{...glassCardStyle, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            {product.featured && <Tag color="blue">推荐</Tag>}
                                            <Tag color="default">{product.category?.name || product.categoryName || '未分类'}</Tag>
                                        </div>
                                        <Title level={2} style={{ ...primaryTextStyle, margin: '0 0 1.5rem 0', fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: '1.3' }}>
                                            {product.name}
                                        </Title>

                                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                                                <Text style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 'bold', color: '#ef4444' }}>
                                                    {formatPrice(product.price)}
                                                </Text>
                                                {product.originalPrice && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Text delete style={{ ...secondaryTextStyle, fontSize: '1.1rem' }}>
                                                            {formatPrice(product.originalPrice)}
                                                        </Text>
                                                        {discount > 0 && <Tag color="red">省{discount}%</Tag>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Title level={5} style={{ ...labelTextStyle, marginBottom: '0.75rem' }}>商品介绍</Title>
                                        <Paragraph style={{ ...secondaryTextStyle, lineHeight: '1.7', flex: 1 }}>
                                            {product.description || product.summary || '暂无详细描述'}
                                        </Paragraph>

                                        {product.tags && product.tags.length > 0 && (
                                            <div style={{ marginTop: '1.5rem' }}>
                                                <Title level={5} style={{ ...labelTextStyle, marginBottom: '0.75rem' }}>
                                                    <TagOutlined style={{ marginRight: '0.5rem' }} />
                                                    商品标签
                                                </Title>
                                                <Space wrap>
                                                    {product.tags.map((tagName, index) => (
                                                        <Tag
                                                            key={index}
                                                            style={{
                                                                background: 'rgba(108, 99, 255, 0.2)',
                                                                border: '1px solid rgba(108, 99, 255, 0.4)',
                                                                color: 'white',
                                                                borderRadius: '12px'
                                                            }}
                                                        >
                                                            {tagName}
                                                        </Tag>
                                                    ))}
                                                </Space>
                                            </div>
                                        )}

                                        <Row gutter={16} style={{ marginTop: '1.5rem' }}>
                                            <Col span={6}>
                                                <Statistic
                                                    title={<span style={labelTextStyle}>浏览次数</span>}
                                                    valueStyle={primaryTextStyle}
                                                    value={product.viewCount || 0}
                                                    prefix={<EyeOutlined />}
                                                    formatter={(value) => formatNumber(Number(value))}
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <Statistic
                                                    title={<span style={labelTextStyle}>点击次数</span>}
                                                    valueStyle={primaryTextStyle}
                                                    value={product.clickCount || 0}
                                                    prefix={<MoreOutlined />}
                                                    formatter={(value) => formatNumber(Number(value))}
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <Statistic
                                                    title={<span style={labelTextStyle}>收藏次数</span>}
                                                    valueStyle={primaryTextStyle}
                                                    value={favoriteCount}
                                                    prefix={<HeartOutlined />}
                                                    formatter={(value) => formatNumber(Number(value))}
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <Statistic
                                                    title={<span style={labelTextStyle}>商品分类</span>}
                                                    valueStyle={primaryTextStyle}
                                                    value={product.category?.name || product.categoryName || '未分类'}
                                                    prefix={<TagOutlined />}
                                                />
                                            </Col>
                                        </Row>

                                        <div style={{ marginTop: '2rem' }}>
                                            <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={handleBuyClick} style={{ width: '100%', height: '50px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '25px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
                                                立即购买
                                            </Button>
                                            <Row gutter={12} style={{ marginTop: '1rem' }}>
                                                <Col span={isAdmin ? 8 : 12}>
                                                    <Button
                                                        icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
                                                        onClick={handleFavorite}
                                                        loading={favoriteLoading}
                                                        block
                                                        style={{
                                                            height: '40px',
                                                            background: isFavorited
                                                                ? 'linear-gradient(135deg, #ff6b8a 0%, #ff416c 100%)'
                                                                : 'rgba(255,255,255,0.1)',
                                                            border: isFavorited
                                                                ? 'none'
                                                                : '1px solid rgba(255,255,255,0.2)',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {isFavorited ? '已收藏' : '收藏'} ({formatNumber(favoriteCount)})
                                                    </Button>
                                                </Col>
                                                <Col span={isAdmin ? 8 : 12}><Button icon={<ShareAltOutlined />} onClick={handleShare} block style={{ height: '40px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>分享</Button></Col>
                                                {isAdmin && (
                                                    <Col span={8}>
                                                        <Button
                                                            icon={isPurchased ? <CheckCircleOutlined /> : <ShoppingOutlined />}
                                                            onClick={handleTogglePurchased}
                                                            loading={purchaseLoading}
                                                            block
                                                            style={{
                                                                height: '40px',
                                                                background: isPurchased
                                                                    ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                                                                    : 'rgba(255,255,255,0.1)',
                                                                border: isPurchased
                                                                    ? 'none'
                                                                    : '1px solid rgba(255,255,255,0.2)',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {isPurchased ? '已购买' : '标记购买'}
                                                        </Button>
                                                    </Col>
                                                )}
                                            </Row>
                                            <Text style={{ ...secondaryTextStyle, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}><DollarOutlined style={{ marginRight: '0.5rem' }} />点击"立即购买"将跳转到商品官方页面</Text>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={glassCardStyle}>
                                    <Title level={3} style={{ ...primaryTextStyle, marginBottom: '1.5rem' }}>商品详情</Title>
                                    <Paragraph style={{ ...secondaryTextStyle, lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                        {product.description || product.summary || '暂无详细描述'}
                                    </Paragraph>
                                </div>
                            </div>

                            <div>
                                <div style={glassCardStyle}>
                                    <ProductRecommendations currentProductId={product.id} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageBackground>
    );
};

export default ProductDetailPage;
