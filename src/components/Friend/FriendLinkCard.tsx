// src/components/Friend/FriendLinkCard.tsx - 修复跳转问题
import React from 'react';
import { Button, Tag } from 'antd';
import { LinkOutlined, UserOutlined } from '@ant-design/icons';
import type { FriendLink } from '@/services/friendLinkService';
import { recordFriendLinkClick } from '@/services/friendLinkService';
import { interactiveGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

interface FriendLinkCardProps {
    friendLink: FriendLink;
}

const FriendLinkCard: React.FC<FriendLinkCardProps> = ({ friendLink }) => {
    // 处理链接点击 - 修复版本
    const handleLinkClick = async () => {
        // 先尝试记录点击，但不阻塞跳转
        try {
            await recordFriendLinkClick(friendLink.id);
        } catch (error) {
            console.warn('记录点击失败:', error);
            // 即使记录失败也继续跳转
        }

        // 确保URL格式正确
        let url = friendLink.siteUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // 跳转到新窗口
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // 处理卡片点击
    const handleCardClick = (e: React.MouseEvent) => {
        // 如果点击的是按钮，不触发卡片点击
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        handleLinkClick();
    };

    const glassCardStyle: React.CSSProperties = {
        ...interactiveGlassCardStyle,
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    };

    return (
        <div
            style={glassCardStyle}
            onClick={handleCardClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* 头像和基本信息 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    {friendLink.avatarUrl ? (
                        <img
                            src={friendLink.avatarUrl}
                            alt={friendLink.siteName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                // 头像加载失败时显示默认图标
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.innerHTML = `<span style="font-size: 24px; color: rgba(255, 255, 255, 0.6);">👤</span>`;
                                }
                            }}
                        />
                    ) : (
                        <UserOutlined style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.6)' }} />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                        ...primaryTextStyle,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        margin: '0 0 4px 0',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {friendLink.siteName}
                    </h3>
                    {friendLink.ownerName && (
                        <p style={{
                            ...secondaryTextStyle,
                            fontSize: '0.85rem',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            by {friendLink.ownerName}
                        </p>
                    )}
                </div>
            </div>

            {/* 描述 */}
            {friendLink.description && (
                <p style={{
                    ...secondaryTextStyle,
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    margin: '0 0 12px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1
                }}>
                    {friendLink.description}
                </p>
            )}

            {/* 底部信息和按钮 */}
            <div style={{ marginTop: 'auto' }}>
                {/* 标签 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <Tag color="blue" style={{ fontSize: '0.75rem', margin: 0 }}>
                        {friendLink.category}
                    </Tag>
                    {friendLink.reciprocal && (
                        <Tag color="green" style={{ fontSize: '0.75rem', margin: 0 }}>
                            互换友链
                        </Tag>
                    )}
                </div>

                {/* 访问按钮 */}
                <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    size="small"
                    block
                    onClick={(e) => {
                        e.stopPropagation();
                        handleLinkClick();
                    }}
                    style={{
                        background: 'rgba(24, 144, 255, 0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        height: '36px',
                        fontWeight: 500
                    }}
                >
                    访问站点
                </Button>
            </div>
        </div>
    );
};

export default FriendLinkCard;
