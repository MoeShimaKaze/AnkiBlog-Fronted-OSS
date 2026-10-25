// 1. socialLinks.ts - 完整的社交链接服务
import api from './api';
import type { ApiResponse } from '@/types/api';

// 与后端PlatformType枚举对应的类型定义
export type PlatformType =
    | 'WECHAT' | 'WEIBO' | 'QQ'
    | 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'YOUTUBE' | 'TIKTOK'
    | 'GITHUB' | 'GITLAB' | 'STACKOVERFLOW'
    | 'DRIBBBLE' | 'BEHANCE' | 'FIGMA'
    | 'ZHIHU' | 'JUEJIN' | 'CSDN' | 'JIANSHU' | 'SEGMENTFAULT'
    | 'MEDIUM' | 'DEVTO' | 'HASHNODE'
    | 'BILIBILI' | 'DOUYIN'
    | 'TAOBAO' | 'XIAOHONGSHU'
    | 'TELEGRAM' | 'DISCORD' | 'SLACK'
    | 'PINTEREST' | 'REDDIT' | 'SPOTIFY'
    | 'WEBSITE' | 'BLOG' | 'EMAIL' | 'PHONE' | 'CUSTOM';

// 平台类型配置信息
export const platformTypes: Record<PlatformType, {
    displayName: string;
    iconClass: string;
    brandColor: string;
    baseUrl: string;
}> = {
    // 中国主流社交媒体
    WECHAT: { displayName: '微信', iconClass: 'fab fa-weixin', brandColor: '#07c160', baseUrl: 'https://weixin.qq.com/' },
    WEIBO: { displayName: '微博', iconClass: 'fab fa-weibo', brandColor: '#e6162d', baseUrl: 'https://weibo.com/' },
    QQ: { displayName: 'QQ', iconClass: 'fab fa-qq', brandColor: '#12b7f5', baseUrl: 'https://im.qq.com/' },

    // 国际主流社交媒体
    TWITTER: { displayName: 'Twitter', iconClass: 'fab fa-twitter', brandColor: '#1da1f2', baseUrl: 'https://twitter.com/' },
    FACEBOOK: { displayName: 'Facebook', iconClass: 'fab fa-facebook', brandColor: '#4267b2', baseUrl: 'https://facebook.com/' },
    INSTAGRAM: { displayName: 'Instagram', iconClass: 'fab fa-instagram', brandColor: '#e4405f', baseUrl: 'https://instagram.com/' },
    LINKEDIN: { displayName: 'LinkedIn', iconClass: 'fab fa-linkedin', brandColor: '#0077b5', baseUrl: 'https://linkedin.com/' },
    YOUTUBE: { displayName: 'YouTube', iconClass: 'fab fa-youtube', brandColor: '#ff0000', baseUrl: 'https://youtube.com/' },
    TIKTOK: { displayName: 'TikTok', iconClass: 'fab fa-tiktok', brandColor: '#000000', baseUrl: 'https://tiktok.com/' },

    // 专业开发平台
    GITHUB: { displayName: 'GitHub', iconClass: 'fab fa-github', brandColor: '#333333', baseUrl: 'https://github.com/' },
    GITLAB: { displayName: 'GitLab', iconClass: 'fab fa-gitlab', brandColor: '#fc6d26', baseUrl: 'https://gitlab.com/' },
    STACKOVERFLOW: { displayName: 'Stack Overflow', iconClass: 'fab fa-stack-overflow', brandColor: '#f58025', baseUrl: 'https://stackoverflow.com/' },

    // 设计创意平台
    DRIBBBLE: { displayName: 'Dribbble', iconClass: 'fab fa-dribbble', brandColor: '#ea4c89', baseUrl: 'https://dribbble.com/' },
    BEHANCE: { displayName: 'Behance', iconClass: 'fab fa-behance', brandColor: '#1769ff', baseUrl: 'https://behance.net/' },
    FIGMA: { displayName: 'Figma', iconClass: 'fab fa-figma', brandColor: '#f24e1e', baseUrl: 'https://figma.com/' },

    // 中文技术社区
    ZHIHU: { displayName: '知乎', iconClass: 'fas fa-comment-dots', brandColor: '#0084ff', baseUrl: 'https://zhihu.com/' },
    JUEJIN: { displayName: '掘金', iconClass: 'fas fa-gem', brandColor: '#007fff', baseUrl: 'https://juejin.cn/' },
    CSDN: { displayName: 'CSDN', iconClass: 'fas fa-code', brandColor: '#fc5531', baseUrl: 'https://csdn.net/' },
    JIANSHU: { displayName: '简书', iconClass: 'fas fa-pen-fancy', brandColor: '#ea6f5a', baseUrl: 'https://jianshu.com/' },
    SEGMENTFAULT: { displayName: 'SegmentFault', iconClass: 'fas fa-bug', brandColor: '#009a61', baseUrl: 'https://segmentfault.com/' },

    // 国际内容平台
    MEDIUM: { displayName: 'Medium', iconClass: 'fab fa-medium', brandColor: '#00ab6c', baseUrl: 'https://medium.com/' },
    DEVTO: { displayName: 'Dev.to', iconClass: 'fab fa-dev', brandColor: '#0a0a0a', baseUrl: 'https://dev.to/' },
    HASHNODE: { displayName: 'Hashnode', iconClass: 'fas fa-hashtag', brandColor: '#2962ff', baseUrl: 'https://hashnode.com/' },

    // 视频内容平台
    BILIBILI: { displayName: '哔哩哔哩', iconClass: 'fas fa-play-circle', brandColor: '#00a1d6', baseUrl: 'https://bilibili.com/' },
    DOUYIN: { displayName: '抖音', iconClass: 'fas fa-music', brandColor: '#fe2c55', baseUrl: 'https://douyin.com/' },

    // 电商和生活方式
    TAOBAO: { displayName: '淘宝', iconClass: 'fas fa-shopping-cart', brandColor: '#ff4400', baseUrl: 'https://taobao.com/' },
    XIAOHONGSHU: { displayName: '小红书', iconClass: 'fas fa-heart', brandColor: '#fe2c55', baseUrl: 'https://xiaohongshu.com/' },

    // 通讯工具
    TELEGRAM: { displayName: 'Telegram', iconClass: 'fab fa-telegram', brandColor: '#0088cc', baseUrl: 'https://telegram.org/' },
    DISCORD: { displayName: 'Discord', iconClass: 'fab fa-discord', brandColor: '#7289da', baseUrl: 'https://discord.com/' },
    SLACK: { displayName: 'Slack', iconClass: 'fab fa-slack', brandColor: '#4a154b', baseUrl: 'https://slack.com/' },

    // 其他平台
    PINTEREST: { displayName: 'Pinterest', iconClass: 'fab fa-pinterest', brandColor: '#bd081c', baseUrl: 'https://pinterest.com/' },
    REDDIT: { displayName: 'Reddit', iconClass: 'fab fa-reddit', brandColor: '#ff4500', baseUrl: 'https://reddit.com/' },
    SPOTIFY: { displayName: 'Spotify', iconClass: 'fab fa-spotify', brandColor: '#1db954', baseUrl: 'https://spotify.com/' },

    // 自定义平台
    WEBSITE: { displayName: '个人网站', iconClass: 'fas fa-globe', brandColor: '#6c757d', baseUrl: '' },
    BLOG: { displayName: '博客', iconClass: 'fas fa-blog', brandColor: '#6c757d', baseUrl: '' },
    EMAIL: { displayName: '邮箱', iconClass: 'fas fa-envelope', brandColor: '#6c757d', baseUrl: 'mailto:' },
    PHONE: { displayName: '电话', iconClass: 'fas fa-phone', brandColor: '#6c757d', baseUrl: 'tel:' },
    CUSTOM: { displayName: '自定义', iconClass: 'fas fa-link', brandColor: '#6c757d', baseUrl: '' }
};

// 与后端SocialLinkResponse对应的类型
export interface SocialLink {
    id: string;
    platform: string;
    platformName?: string;
    url: string;
    title: string;
    description?: string;
    icon: string;
    color: string;
    active: boolean;
    openInNewTab: boolean;
    featured: boolean;
    sortOrder: number;
    groupName?: string;
}

// 与后端SocialLinkCreateRequest对应的类型
export interface SocialLinkCreateRequest {
    platform: PlatformType;
    url: string;
    title?: string;
    description?: string;
    groupName?: string;
    active?: boolean;
    sortOrder?: number;
}

// 与后端SocialLinkUpdateRequest对应的类型
export interface SocialLinkUpdateRequest {
    platform?: PlatformType;
    url?: string;
    title?: string;
    description?: string;
    groupName?: string;
    active?: boolean;
    openInNewTab?: boolean;
    featured?: boolean;
    sortOrder?: number;
}

// 管理员API
export const createSocialLink = (data: SocialLinkCreateRequest): Promise<ApiResponse<SocialLink>> =>
    api.post('/admin/social-links', data);

export const getAllSocialLinks = (): Promise<ApiResponse<SocialLink[]>> =>
    api.get('/admin/social-links');

export const updateSocialLink = (id: string, data: SocialLinkUpdateRequest): Promise<ApiResponse<SocialLink>> =>
    api.put(`/admin/social-links/${id}`, data);

export const deleteSocialLink = (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/social-links/${id}`);

// 公开API
export const getActivePublicLinks = (): Promise<ApiResponse<SocialLink[]>> =>
    api.get('/public/social-links');

export const recordSocialLinkClick = (id: string): Promise<ApiResponse<void>> =>
    api.post(`/public/social-links/${id}/click`);