// src/components/CustomPage/CustomPageCard.tsx
import React from 'react';
import { Card, Tag, Tooltip } from 'antd';
import { EyeOutlined, ShareAltOutlined, StarFilled, MenuOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { CustomPage } from '@/types/customPage';
import { formatNumber } from '@/utils/format';
import { getPageTypeInfo } from '@/utils/customPageUtils';
import {
    interactiveGlassCardStyle,
    mutedTextStyle,
    primaryTextStyle,
    secondaryTextStyle,
} from '@/constants/styles';
import dayjs from 'dayjs';

interface CustomPageCardProps {
    page: CustomPage;
    showAdmin?: boolean;
    onClick?: (page: CustomPage) => void;
}

const CustomPageCard: React.FC<CustomPageCardProps> = ({
                                                           page,
                                                           showAdmin = false,
                                                           onClick
                                                       }) => {
    const typeInfo = getPageTypeInfo(page.pageType);

    const cardStyle: React.CSSProperties = {
        ...interactiveGlassCardStyle,
        height: '100%'
    };

    const handleCardClick = () => {
        if (onClick) {
            onClick(page);
        }
    };

    const CardContent = () => (
        <Card
            style={cardStyle}
            bodyStyle={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}
            hoverable
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onClick={handleCardClick}
        >
            {/* 页面头部 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    {page.pageIcon && (
                        <span style={{ fontSize: '1.5rem' }}>{page.pageIcon}</span>
                    )}
                    <h3 style={{
                        ...primaryTextStyle,
                        margin: 0,
                        fontSize: '1.25rem',
                        lineHeight: '1.4',
                        wordBreak: 'break-word'
                    }}>
                        {page.title}
                    </h3>
                </div>

                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                    {page.featured && (
                        <Tooltip title="推荐页面">
                            <StarFilled style={{ color: '#faad14' }} />
                        </Tooltip>
                    )}
                    {page.showInMenu && (
                        <Tooltip title="显示在菜单">
                            <MenuOutlined style={{ color: '#52c41a' }} />
                        </Tooltip>
                    )}
                    {page.hasCustomCode && (
                        <Tooltip title="包含自定义代码">
                            <SettingOutlined style={{ color: '#1890ff' }} />
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* 页面副标题 */}
            {page.subtitle && (
                <p style={{
                    ...secondaryTextStyle,
                    margin: '0 0 1rem 0',
                    lineHeight: '1.5',
                    fontSize: '0.9rem'
                }}>
                    {page.subtitle}
                </p>
            )}

            {/* 页面类型标签 */}
            <div style={{ marginBottom: '1rem' }}>
                <Tag
                    color={typeInfo.color}
                    style={{
                        borderRadius: '12px',
                        fontWeight: '500',
                        fontSize: '0.85rem'
                    }}
                >
                    {typeInfo.icon} {typeInfo.name}
                </Tag>
                {!page.published && (
                    <Tag color="processing" style={{ marginLeft: '4px' }}>
                        草稿
                    </Tag>
                )}
            </div>

            {/* 页面摘要 */}
            {page.summary && (
                <p style={{
                    ...mutedTextStyle,
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    margin: '0 0 1rem 0',
                    flex: 1,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {page.summary}
                </p>
            )}

            {/* 页面统计和日期 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                ...secondaryTextStyle,
                marginTop: 'auto'
            }}>
                <span>
                    {dayjs(page.updatedAt).format('YYYY-MM-DD')}
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <EyeOutlined />
                        {formatNumber(page.viewCount)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShareAltOutlined />
                        {formatNumber(page.shareCount)}
                    </span>
                </div>
            </div>
        </Card>
    );

    return showAdmin ? (
        <CardContent />
    ) : (
        <Link to={page.fullPath} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
            <CardContent />
        </Link>
    );
};

export default CustomPageCard;
