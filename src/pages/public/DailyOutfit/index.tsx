/**
 * 今天穿什么 - 公开页面
 * 展示最近的公开穿搭建议
 * 管理员用户可直接在此页面抽取穿搭建议
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Tag, Image, Typography } from 'antd';
import {
    ThunderboltOutlined,
    CalendarOutlined,
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';

import Navbar from '@/components/Common/Navbar';
import DailyOutfitGenerator from '@/components/Outfit/DailyOutfitGenerator';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import { useAuth } from '@/hooks/auth/useAuth';
import type { DailyOutfitPublicResponse, SuggestionStatus } from '@/types/outfit';
import * as dailyOutfitService from '@/services/dailyOutfitService';
import { Link } from 'react-router-dom';
import { interactiveGlassCardStyle, secondaryTextStyle } from '@/constants/styles';

const { Title, Text } = Typography;

const statusConfig: Record<SuggestionStatus, { color: string; icon: React.ReactNode; text: string }> = {
    PENDING: { color: 'gold', icon: <ClockCircleOutlined />, text: '待决定' },
    ACCEPTED: { color: 'green', icon: <CheckOutlined />, text: '已接受' },
    REJECTED: { color: 'default', icon: <CloseOutlined />, text: '已拒绝' },
};

// 响应式样式
const responsiveStyles = `
    /* 桌面端卡片样式 */
    .daily-outfit-card .card-image-container {
        height: 180px;
    }
    .daily-outfit-card .item-thumbnail {
        width: 48px;
        height: 48px;
    }

    /* 竖屏移动端样式 (max-width: 576px) */
    @media (max-width: 576px) {
        .daily-outfit-card {
            flex-direction: row !important;
            min-height: auto !important;
        }
        .daily-outfit-card .card-image-container {
            width: 120px !important;
            height: 120px !important;
            border-radius: 12px 0 0 12px !important;
        }
        .daily-outfit-card .card-content {
            padding: 10px !important;
        }
        .daily-outfit-card .item-thumbnail {
            width: 32px !important;
            height: 32px !important;
        }
    }
`;

const PublicDailyOutfitPage: React.FC = () => {
    usePageTitle('今天穿什么', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki的歇脚处'
    });

    const { user, isAuthenticated } = useAuth();
    const isAdmin = isAuthenticated && user?.role === 'ADMIN';

    const [suggestions, setSuggestions] = useState<DailyOutfitPublicResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        setLoading(true);
        try {
            const res = await dailyOutfitService.getPublicRecentSuggestions(12);
            if (res.success) {
                setSuggestions(res.data || []);
            }
        } catch (error) {
            console.error('加载建议列表失败:', error);
        } finally {
            setLoading(false);
        }
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
            {/* 响应式样式 */}
            <style>{responsiveStyles}</style>

            {/* 遮罩层 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 0
                }}
            />

            {/* 导航栏 */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <Navbar />
            </div>

            {/* 主内容区域 */}
            <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', paddingBottom: '4rem' }}>
                {/* 页面标题 */}
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
                        <ThunderboltOutlined style={{ marginRight: '12px', color: '#ffc107' }} />
                        今天穿什么
                    </Title>
                    <Text
                        style={{
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontSize: '1rem',
                            display: 'block',
                            marginTop: '12px',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                        }}
                    >
                        {isAdmin ? '抽取今日穿搭，查看历史记录' : '查看最近的穿搭推荐记录'}
                    </Text>
                </div>

                {/* 内容区域 */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '1200px', padding: '0 1rem' }}>
                        {/* 管理员：显示抽取组件 */}
                        {isAdmin && (
                            <div style={{ marginBottom: '2rem' }}>
                                <DailyOutfitGenerator onSuccess={loadSuggestions} />
                            </div>
                        )}

                        {/* 历史记录标题 */}
                        {isAdmin && suggestions.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <Title
                                    level={3}
                                    style={{
                                        color: 'white',
                                        textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                                        margin: 0
                                    }}
                                >
                                    历史记录
                                </Title>
                            </div>
                        )}

                        {/* 建议列表 */}
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
                                <div style={{ marginTop: '1rem', color: 'white' }}>正在加载穿搭建议...</div>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div
                                style={{
                                    ...glassCardStyle,
                                    padding: '3rem',
                                    textAlign: 'center',
                                    cursor: 'default'
                                }}
                            >
                                <ThunderboltOutlined style={{ fontSize: '3rem', color: 'white', opacity: 0.6, marginBottom: '1rem' }} />
                                <Title level={3} style={{ color: 'white', margin: '0 0 1rem 0' }}>
                                    暂无穿搭建议
                                </Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {isAdmin ? '点击上方按钮抽取今日穿搭' : '还没有公开的穿搭建议，请稍后再来看看吧'}
                                </Text>
                            </div>
                        ) : (
                            <Row gutter={[16, 16]}>
                                {suggestions.map((suggestion) => {
                                    const status = statusConfig[suggestion.status];
                                    // 根据状态过滤要显示的商品
                                    const displayItems = suggestion.status === 'ACCEPTED'
                                        ? suggestion.items.filter(item => item.accepted === true)
                                        : suggestion.items;
                                    const acceptedCount = suggestion.items.filter(item => item.accepted === true).length;
                                    const rejectedCount = suggestion.items.filter(item => item.accepted === false).length;
                                    const displayImage = displayItems[0]?.productMainImage || '/placeholder-outfit.jpg';

                                    return (
                                        <Col key={suggestion.id} xs={24} sm={12} md={8} lg={6}>
                                            <div
                                                style={{
                                                    ...glassCardStyle,
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                                className="daily-outfit-card"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                {/* 图片区域 - 移动端横向布局 */}
                                                <div className="card-image-container" style={{ position: 'relative', flexShrink: 0 }}>
                                                    <Image
                                                        src={displayImage}
                                                        alt="穿搭建议"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        preview={false}
                                                    />
                                                    {/* 日期标签 */}
                                                    <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                                                        <Tag color="blue" style={{ fontSize: '0.75rem' }}>
                                                            <CalendarOutlined /> {dayjs(suggestion.suggestionDate).format('MM/DD')}
                                                        </Tag>
                                                    </div>
                                                    {/* 状态标签 */}
                                                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                                        <Tag color={status.color} style={{ fontSize: '0.75rem' }}>
                                                            {status.icon} {status.text}
                                                        </Tag>
                                                    </div>
                                                </div>

                                                {/* 内容区域 */}
                                                <div className="card-content" style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    {/* ACCEPTED状态显示统计信息 */}
                                                    {suggestion.status === 'ACCEPTED' && (
                                                        <div style={{
                                                            marginBottom: '8px',
                                                            padding: '4px 8px',
                                                            background: 'rgba(82, 196, 26, 0.15)',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            color: 'rgba(255, 255, 255, 0.85)'
                                                        }}>
                                                            接受 <span style={{ color: '#52c41a', fontWeight: 500 }}>{acceptedCount}</span> 件
                                                            {rejectedCount > 0 && (
                                                                <>，放弃 <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{rejectedCount}</span> 件</>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* 商品缩略图 - 使用过滤后的displayItems */}
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '6px',
                                                        flexWrap: 'wrap',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {displayItems.map((item, index) => (
                                                            <Link
                                                                key={index}
                                                                to={`/products/${item.productSlug || item.productId}`}
                                                                style={{ textDecoration: 'none' }}
                                                            >
                                                                <div
                                                                    className="item-thumbnail"
                                                                    style={{
                                                                        borderRadius: '6px',
                                                                        overflow: 'hidden',
                                                                        border: suggestion.status === 'ACCEPTED'
                                                                            ? '2px solid rgba(82, 196, 26, 0.6)'
                                                                            : '1px solid rgba(255, 255, 255, 0.2)',
                                                                        flexShrink: 0,
                                                                        position: 'relative',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    title={`${item.productName}${item.brand ? ` - ${item.brand}` : ''}${suggestion.status === 'ACCEPTED' ? ' (已接受)' : ''}`}
                                                                >
                                                                    <Image
                                                                        src={item.productMainImage}
                                                                        alt={item.productName}
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                        preview={false}
                                                                    />
                                                                    {suggestion.status === 'ACCEPTED' && (
                                                                        <CheckCircleFilled style={{
                                                                            position: 'absolute',
                                                                            top: '-4px',
                                                                            right: '-4px',
                                                                            color: '#52c41a',
                                                                            fontSize: '12px',
                                                                            background: 'rgba(35,35,35,0.9)',
                                                                            borderRadius: '50%'
                                                                        }} />
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>

                                                    {/* 商品名称列表 - 使用过滤后的displayItems */}
                                                    <div style={{
                                                        ...secondaryTextStyle,
                                                        fontSize: '0.8rem',
                                                        lineHeight: '1.4',
                                                        flex: 1,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {displayItems.map((item, index) => (
                                                            <span key={index}>
                                                                {item.productName}
                                                                {index < displayItems.length - 1 && ' · '}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* 时间 */}
                                                    <div style={{
                                                        marginTop: '8px',
                                                        fontSize: '0.7rem',
                                                        ...secondaryTextStyle,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <ClockCircleOutlined />
                                                        {dayjs(suggestion.createdAt).format('MM-DD HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicDailyOutfitPage;
