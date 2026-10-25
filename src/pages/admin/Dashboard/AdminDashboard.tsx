// src/pages/admin/Dashboard/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Avatar, Button, Spin, Alert } from 'antd';
import {
    FileTextOutlined,
    ShoppingOutlined,
    UserOutlined,
    MessageOutlined,
    EyeOutlined,
    EditOutlined,
    PlusOutlined,
    SettingOutlined,
    SkinOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useAdminDashboard } from '@/hooks/dashboard/useAdminDashboard';
import { useAuth } from '@/hooks/auth/useAuth';
import { RecentArticle, RecentComment } from '@/services/dashboard';
import { format, parseISO } from 'date-fns';
import { usePageTitle } from "@/hooks/business/usePageTitle.ts";
import * as wardrobeService from '@/services/wardrobeService';
import * as outfitService from '@/services/outfitService';
import type { WardrobeOverview, OutfitStats } from '@/types/outfit';

// 简单日期格式化工具
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'yyyy-MM-dd HH:mm');
    } catch (error) {
        return dateString;
    }
};

const AdminDashboard: React.FC = () => {
    usePageTitle('管理看板', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    });

    const { data: dashboardData, loading, error } = useAdminDashboard();
    const { user, userAvatarUrl, userName } = useAuth();

    // 衣橱和穿搭数据状态
    const [wardrobeData, setWardrobeData] = useState<WardrobeOverview | null>(null);
    const [outfitData, setOutfitData] = useState<OutfitStats | null>(null);

    // 加载衣橱和穿搭数据
    useEffect(() => {
        const loadExtraData = async () => {
            try {
                const [wardrobeRes, outfitRes] = await Promise.all([
                    wardrobeService.getWardrobeOverview(),
                    outfitService.getOutfitStats()
                ]);
                if (wardrobeRes.success) {
                    setWardrobeData(wardrobeRes.data);
                }
                if (outfitRes.success) {
                    setOutfitData(outfitRes.data);
                }
            } catch (err) {
                console.error('加载衣橱/穿搭数据失败:', err);
            }
        };
        loadExtraData();
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '50px' }}>
                <Alert
                    message="数据加载失败"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            {/* 头部区域 */}
            <div style={{
                textAlign: 'center',
                marginBottom: '32px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Avatar
                        size={64}
                        src={userAvatarUrl}
                        icon={!userAvatarUrl && <UserOutlined />}
                        style={{
                            background: userAvatarUrl ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            marginRight: '16px',
                            border: '3px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                    />
                    <div>
                        <h1 style={{
                            color: 'white',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            margin: 0,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                        }}>
                            管理控制中心
                        </h1>
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '16px',
                            margin: '8px 0 0 0',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
                        }}>
                            欢迎回来，{userName || user?.displayName || '管理员'}
                        </p>
                    </div>
                </div>
                <div style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
                }}>
                    系统管理员身份 · {user?.email} · 角色: {user?.role}
                </div>
            </div>

            {/* 统计卡片区域 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                <Col xs={12} sm={8} lg={4}>
                    <Card className="glass-effect border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
                        <Statistic
                            title={<span className="text-white/90 font-medium text-xs">文章总数</span>}
                            value={dashboardData?.totalArticles ?? 0}
                            prefix={<FileTextOutlined className="text-blue-400" />}
                            valueStyle={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card className="glass-effect border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
                        <Statistic
                            title={<span className="text-white/90 font-medium text-xs">商品总数</span>}
                            value={dashboardData?.totalProducts ?? 0}
                            prefix={<ShoppingOutlined className="text-green-400" />}
                            valueStyle={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card className="glass-effect border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
                        <Statistic
                            title={<span className="text-white/90 font-medium text-xs">用户总数</span>}
                            value={dashboardData?.totalUsers ?? 0}
                            prefix={<UserOutlined className="text-orange-400" />}
                            valueStyle={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card className="glass-effect border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
                        <Statistic
                            title={<span className="text-white/90 font-medium text-xs">待审评论</span>}
                            value={dashboardData?.pendingComments ?? 0}
                            prefix={<MessageOutlined className="text-purple-400" />}
                            valueStyle={{ color: dashboardData?.pendingComments ? '#faad14' : '#ffffff', fontSize: '24px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card className="glass-effect border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
                        <Statistic
                            title={<span className="text-white/90 font-medium text-xs">衣橱单品</span>}
                            value={wardrobeData?.totalItems ?? 0}
                            prefix={<SkinOutlined className="text-pink-400" />}
                            valueStyle={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}
                            suffix={wardrobeData?.idleItemCount ? <span className="text-yellow-400 text-xs ml-1">({wardrobeData.idleItemCount}闲置)</span> : null}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card className="glass-effect border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" styles={{ body: { padding: '16px', textAlign: 'center' } }}>
                        <Statistic
                            title={<span className="text-white/90 font-medium text-xs">穿搭记录</span>}
                            value={outfitData?.totalOutfits ?? 0}
                            prefix={<CalendarOutlined className="text-cyan-400" />}
                            valueStyle={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}
                            suffix={outfitData?.thisMonthOutfits ? <span className="text-green-400 text-xs ml-1">(本月{outfitData.thisMonthOutfits})</span> : null}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 快捷操作区域 */}
            <div style={{
                textAlign: 'center',
                marginBottom: '32px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <h3 style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '24px',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
                }}>
                    快捷操作
                </h3>
                <Row gutter={[16, 16]} justify="center">
                    <Col>
                        <Button type="primary" size="large" icon={<EditOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)', height: '48px', padding: '0 24px' }} onClick={() => window.location.href = '/admin/editor/new'}>
                            创建文章发布新内容
                        </Button>
                    </Col>
                    <Col>
                        <Button type="primary" size="large" icon={<PlusOutlined />} style={{ background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)', border: 'none', boxShadow: '0 4px 15px rgba(54, 209, 220, 0.4)', height: '48px', padding: '0 24px' }} onClick={() => window.location.href = '/admin/products/new'}>
                            添加商品管理新商品
                        </Button>
                    </Col>
                    <Col>
                        <Button type="primary" size="large" icon={<SettingOutlined />} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none', boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)', height: '48px', padding: '0 24px' }} onClick={() => window.location.href = '/admin/settings/site'}>
                            系统设置配置管理
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* 最新内容区域 */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card
                        className="glass-effect border-0 shadow-lg h-full"
                        title={<div style={{ textAlign: 'center' }}><span className="text-white font-semibold text-lg">最近活动和最新文章动态</span></div>}
                        extra={<Button type="link" className="text-blue-300 hover:text-blue-200 p-0" onClick={() => window.location.href = '/admin/articles'}>查看全部</Button>}
                        styles={{ body: { padding: '16px 24px 24px' } }}
                    >
                        <List
                            dataSource={dashboardData?.recentArticles ?? []}
                            renderItem={(article: RecentArticle) => (
                                <List.Item className="border-b border-white/10 py-3 last:border-0">
                                    <List.Item.Meta
                                        avatar={<Avatar src={article.coverImage} className="bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white/20" icon={<FileTextOutlined />} />}
                                        title={<a href={`/article/${article.slug}`} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-blue-300 cursor-pointer">{article.title}</a>}
                                        description={
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-white/60 text-sm">{formatDate(article.publishedAt)}</span>
                                                <div className="flex items-center text-white/60 text-sm">
                                                    <EyeOutlined className="mr-1" />
                                                    <span>{article.viewCount} 次浏览</span>
                                                </div>
                                            </div>
                                        }
                                    />
                                    <Button type="link" className="text-blue-300 hover:text-blue-200" onClick={() => window.location.href = `/admin/articles/${article.id}/edit`}>
                                        编辑
                                    </Button>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        className="glass-effect border-0 shadow-lg h-full"
                        title={<div style={{ textAlign: 'center' }}><span className="text-white font-semibold text-lg">最新用户互动动态</span></div>}
                        extra={<Button type="link" className="text-blue-300 hover:text-blue-200 p-0" onClick={() => window.location.href = '/admin/comments'}>管理评论</Button>}
                        styles={{ body: { padding: '16px 24px 24px', maxHeight: '400px', overflowY: 'auto' } }}
                    >
                        <List
                            dataSource={dashboardData?.recentComments ?? []}
                            renderItem={(comment: RecentComment) => (
                                <List.Item className="border-b border-white/10 py-3 last:border-0">
                                    <List.Item.Meta
                                        avatar={<Avatar src={comment.authorAvatar} className="bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white/20">{comment.authorName.charAt(0)}</Avatar>}
                                        title={
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-white font-medium">{comment.authorName}</span>
                                                <a href={`/articles/${comment.articleId}`} target="_blank" rel="noopener noreferrer" className="text-blue-300 text-sm">在《{comment.articleTitle}》中评论</a>
                                            </div>
                                        }
                                        description={
                                            <div className="mt-2">
                                                <p className="text-white/80 text-sm line-clamp-2 mb-2">{comment.content}</p>
                                                <span className="text-white/60 text-xs">{formatDate(comment.createdAt)}</span>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;