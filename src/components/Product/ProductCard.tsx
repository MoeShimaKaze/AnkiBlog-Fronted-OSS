// ProductCard.tsx - 确保标签正确显示
import React from 'react';
import { Button, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import type { Product } from '@/types/product';
import { interactiveGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

const ProductCard: React.FC<{ product: Product; viewType?: 'grid' | 'list' }> = ({
                                                                                     product                                                                                 }) => {
    const handleBuyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fetch(`/api/public/products/${product.id}/click`, { method: 'POST' });
        window.open(product.purchaseUrl || '#', '_blank');
    };

    const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

    const productName = product.name;
    const productDesc = product.description || product.summary || '暂无描述';
    const productImage = product.mainImage || product.coverImage || '/placeholder-product.jpg';
    const productCategory = product.category?.name || product.categoryName || '未分类';
    const productViews = product.clickCount || 0;

    // ✅ 直接使用后端返回的标签数组
    const productTags = Array.isArray(product.tags) ? product.tags : [];

    const glassCardStyle = interactiveGlassCardStyle;

    return (
        <Link to={`/products/${product.slug}`}>
            <div
                style={glassCardStyle}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <div style={{ position: 'relative', height: '200px' }}>
                    <img
                        src={productImage}
                        alt={productName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                        {product.isPurchased && <Tag color="green" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>已购买</Tag>}
                        {product.featured && <Tag color="orange" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>推荐</Tag>}
                        {product.originalPrice && product.originalPrice > product.price && <Tag color="red" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>优惠</Tag>}
                    </div>
                </div>

                <div style={{ padding: '16px' }}>
                    <h3 style={{
                        ...primaryTextStyle,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        margin: '0 0 8px 0',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {productName}
                    </h3>

                    <p style={{
                        ...secondaryTextStyle,
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        margin: '0 0 12px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {productDesc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ef4444' }}>{formatPrice(product.price)}</span>
                            {product.originalPrice && <span style={{ ...secondaryTextStyle, fontSize: '0.8rem', textDecoration: 'line-through', marginLeft: '8px' }}>{formatPrice(product.originalPrice)}</span>}
                        </div>
                        <Button type="primary" size="small" onClick={handleBuyClick}>购买</Button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', ...secondaryTextStyle }}>
                        <Tag color="blue" style={{ fontSize: '0.7rem' }}>{productCategory}</Tag>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <EyeOutlined />
                            <span>{productViews}</span>
                        </div>
                    </div>

                    {productTags.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {productTags.slice(0, 3).map((tagName, index) => (
                                <Tag
                                    key={index}
                                    style={{
                                        fontSize: '0.65rem',
                                        margin: 0,
                                        background: 'rgba(108, 99, 255, 0.2)',
                                        border: '1px solid rgba(108, 99, 255, 0.4)',
                                        color: 'white'
                                    }}
                                >
                                    {tagName}
                                </Tag>
                            ))}
                            {productTags.length > 3 && (
                                <span style={{ ...secondaryTextStyle, fontSize: '0.65rem' }}>
                +{productTags.length - 3}
            </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
