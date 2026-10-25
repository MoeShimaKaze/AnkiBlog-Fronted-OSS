// 2. SocialMediaPage.tsx - 社媒展示页面（标签页版本）
import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Space, Tabs } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';
import SocialMediaCard from '@/components/Social/SocialMediaCard';
import Navbar from '@/components/Common/Navbar';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import { getActivePublicLinks } from '@/services/socialLinks';
import type { SocialLink } from '@/services/socialLinks';
import { brightShadowedSecondaryTextStyle, primaryTextStyle, shadowedGlassCardStyle } from '@/constants/styles';

const { Title, Paragraph } = Typography;

const SocialMediaPage: React.FC = () => {
    usePageTitle('社交媒体');

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('');

    // 按分组整理社交链接
    const groupedLinks = socialLinks.reduce((groups, link) => {
        const group = link.groupName || '其他平台';
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(link);
        return groups;
    }, {} as Record<string, SocialLink[]>);

    // 根据项目数量计算容器宽度
    const getContainerWidth = (count: number) => {
        if (count <= 3) return '800px';
        if (count <= 6) return '1200px';
        return '1400px';
    };

    const loadSocialLinks = async () => {
        try {
            setLoading(true);
            const response = await getActivePublicLinks();
            if (response.success) {
                setSocialLinks(response.data);
            }
        } catch (error) {
            console.error('加载社交媒体失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSocialLinks();
    }, []);

    // 设置默认激活标签
    useEffect(() => {
        if (Object.keys(groupedLinks).length > 0 && !activeTab) {
            setActiveTab(Object.keys(groupedLinks)[0]);
        }
    }, [groupedLinks, activeTab]);

    const secondaryTextStyle = brightShadowedSecondaryTextStyle;

    const glassCardStyle: React.CSSProperties = {
        ...shadowedGlassCardStyle,
    };

    // 创建标签页项目
    const tabItems = Object.entries(groupedLinks).map(([groupName, links]) => ({
        key: groupName,
        label: `${groupName} (${links.length})`,
        children: (
            <div style={{ padding: '32px' }}>
                <Row gutter={[24, 24]} justify={links.length <= 3 ? 'center' : 'start'}>
                    {links.map(socialLink => (
                        <Col key={socialLink.id} style={{ minWidth: '280px', maxWidth: '320px' }}>
                            <SocialMediaCard socialLink={socialLink} />
                        </Col>
                    ))}
                </Row>
            </div>
        )
    }));

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
            {/* 背景遮罩层 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(102, 126, 234, 0.4)',
                    backdropFilter: 'blur(1px)',
                    zIndex: -1
                }}
            />

            {/* 导航栏 */}
            <Navbar />

            {/* 主内容区域 */}
            <div style={{ padding: '40px 24px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {/* 页面标题区域 */}
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <div style={{
                            ...glassCardStyle,
                            padding: '40px 32px',
                            margin: '0 auto',
                            maxWidth: '800px'
                        }}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <ShareAltOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                                <Title level={1} style={{
                                    ...primaryTextStyle,
                                    fontSize: '2.5rem',
                                    margin: 0,
                                    fontWeight: 700
                                }}>
                                    我的社交媒体
                                </Title>
                                <Paragraph style={{
                                    ...secondaryTextStyle,
                                    fontSize: '1.1rem',
                                    margin: 0,
                                    lineHeight: 1.6
                                }}>
                                    在这里找到我在各个平台的身影，欢迎关注和交流。
                                    <br />
                                    让我们在数字世界中保持连接，分享生活的点点滴滴。
                                </Paragraph>
                            </Space>
                        </div>
                    </div>

                    {/* 社交媒体展示区域 */}
                    {loading ? (
                        <div style={{
                            ...glassCardStyle,
                            padding: '4rem',
                            textAlign: 'center'
                        }}>
                            <Spin size="large" />
                            <div style={{ marginTop: '1rem', ...primaryTextStyle }}>
                                正在加载社交媒体...
                            </div>
                        </div>
                    ) : socialLinks.length > 0 ? (
                        <div style={{
                            ...glassCardStyle,
                            maxWidth: getContainerWidth(groupedLinks[activeTab]?.length || 0),
                            margin: '0 auto',
                            transition: 'all 0.3s ease'
                        }}>
                            <style>{`
                                .seamless-tabs .ant-tabs-tab {
                                    border: none !important;
                                    background: transparent !important;
                                    transition: all 0.3s ease !important;
                                    border-radius: 12px !important;
                                    margin: 0 4px !important;
                                    padding: 12px 20px !important;
                                    color: rgba(255, 255, 255, 0.7) !important;
                                    font-weight: 500 !important;
                                }
                                .seamless-tabs .ant-tabs-tab:hover {
                                    background: rgba(255, 255, 255, 0.05) !important;
                                    color: rgba(255, 255, 255, 0.9) !important;
                                    transform: translateY(-2px) !important;
                                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
                                }
                                .seamless-tabs .ant-tabs-tab-active {
                                    background: rgba(24, 144, 255, 0.15) !important;
                                    color: rgba(255, 255, 255, 1) !important;
                                    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15) !important;
                                    transform: translateY(-2px) !important;
                                    font-weight: 600 !important;
                                }
                                .seamless-tabs .ant-tabs-nav {
                                    margin-bottom: 0 !important;
                                }
                                .seamless-tabs .ant-tabs-nav::before {
                                    display: none !important;
                                }
                                .seamless-tabs .ant-tabs-ink-bar {
                                    display: none !important;
                                }
                            `}</style>
                            <Tabs
                                className="seamless-tabs"
                                items={tabItems}
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                size="large"
                                tabBarStyle={{
                                    margin: 0,
                                    padding: '24px 32px 0',
                                    borderBottom: 'none',
                                    background: 'transparent'
                                }}
                                tabBarGutter={0}
                            />
                        </div>
                    ) : (
                        <div style={{
                            ...glassCardStyle,
                            padding: '4rem',
                            textAlign: 'center'
                        }}>
                            <Title level={4} style={primaryTextStyle}>
                                暂无社交媒体
                            </Title>
                            <Paragraph style={secondaryTextStyle}>
                                还没有添加任何社交媒体链接
                            </Paragraph>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialMediaPage;
