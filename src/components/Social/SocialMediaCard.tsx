import React from 'react';
import { Button, Tag } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import type { SocialLink } from '@/services/socialLinks';
import { recordSocialLinkClick } from '@/services/socialLinks';
import { interactiveGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

/**
 * @description 一个可复用的图标渲染组件，能处理URL、本地路径和Font Awesome类名
 * @param icon - 从后端获取的图标字符串 (URL, path, or class name)
 * @param color - 从后端获取的颜色字符串
 * @param size - 图标尺寸，默认为 16px
 */
const IconRenderer: React.FC<{ icon: string; color: string; size?: number }> = ({ icon, color, size = 16 }) => {
    // 检查是否为路径或URL
    if (icon.startsWith('/') || icon.startsWith('http')) {
        // 如果是SVG，使用CSS Mask技术来应用动态颜色
        if (icon.endsWith('.svg')) {
            return (
                <div style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    maskImage: `url(${icon})`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskImage: `url(${icon})`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                }} />
            );
        }
        // 如果是其他图片格式 (png, jpg, etc.), 直接作为图片渲染
        return <img src={icon} alt="icon" style={{ width: `${size}px`, height: `${size}px`, borderRadius: '4px' }} />;
    }
    // 否则，认为是 Font Awesome 类名
    return <i className={icon} style={{ color, fontSize: `${size}px` }} />;
};


interface SocialMediaCardProps {
    socialLink: SocialLink;
}

const SocialMediaCard: React.FC<SocialMediaCardProps> = ({ socialLink }) => {
    const handleLinkClick = async () => {
        try {
            await recordSocialLinkClick(socialLink.id);
        } catch (error) {
            console.warn('记录点击失败:', error);
        }

        let url = socialLink.url;
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
            url = 'https://' + url;
        }

        if (url.startsWith('mailto:') || url.startsWith('tel:')) {
            window.location.href = url;
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
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
        position: 'relative',
    };

    return (
        <div
            style={glassCardStyle}
            onClick={handleCardClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* 品牌色彩背景 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: socialLink.color,
                borderRadius: '16px 16px 0 0'
            }} />

            {/* 图标和标题 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${socialLink.color}20, ${socialLink.color}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    border: `2px solid ${socialLink.color}30`
                }}>
                    <IconRenderer icon={socialLink.icon} color={socialLink.color} size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                        ...primaryTextStyle,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {socialLink.title}
                    </h3>
                    <div style={{
                        ...secondaryTextStyle,
                        fontSize: '0.8rem',
                        opacity: 0.8
                    }}>
                        {socialLink.platformName}
                    </div>
                </div>
            </div>

            {/* 描述 */}
            {socialLink.description && (
                <p style={{
                    ...secondaryTextStyle,
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    margin: '0 0 16px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1
                }}>
                    {socialLink.description}
                </p>
            )}

            {/* 底部信息 */}
            <div style={{ marginTop: 'auto' }}>
                {/* 标签 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                }}>
                    {socialLink.groupName && (
                        <Tag style={{
                            background: `${socialLink.color}20`,
                            border: `1px solid ${socialLink.color}40`,
                            color: 'white',
                            fontSize: '0.75rem',
                            margin: 0
                        }}>
                            {socialLink.groupName}
                        </Tag>
                    )}
                    {socialLink.featured && (
                        <Tag color="gold" style={{ fontSize: '0.75rem', margin: 0 }}>
                            推荐
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
                        background: socialLink.color,
                        border: 'none',
                        borderRadius: '8px',
                        height: '36px',
                        fontWeight: 500,
                        boxShadow: `0 2px 8px ${socialLink.color}40`
                    }}
                >
                    访问主页
                </Button>
            </div>
        </div>
    );
};

export default SocialMediaCard;
