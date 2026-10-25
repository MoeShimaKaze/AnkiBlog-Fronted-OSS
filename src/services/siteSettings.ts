// src/services/siteSettings.ts - 完整更新版本
import api from './api';
import { ApiResponse } from '@/types/api';

// 对应后端的 SiteProfileResponse.java - 完整版本
export interface SiteProfile {
    id: string;
    siteName: string;
    siteTagline?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    templateName?: string;
    templateDescription?: string;
    isActiveTemplate?: boolean;
    domain?: string;
    siteUrl: string;
    siteDescription: string;
    siteKeywords?: string;
    siteLanguage?: string;
    timezone?: string;
    logoUrl?: string;
    faviconUrl?: string;
    defaultShareImage?: string;
    themeColor?: string;
    ownerName?: string;
    ownerAvatar?: string;
    ownerBio?: string;
    ownerProfession?: string;
    ownerCompany?: string;
    ownerLocation?: string;
    contactEmail: string;
    contactPhone?: string;
    contactAddress?: string;
    titleFormat?: string;
    defaultSeoDescription?: string;
    baiduVerification?: string;
    googleVerification?: string;
    googleAnalyticsId?: string;
    baiduTongjiId?: string;
    wechatQrCode?: string;
    qqNumber?: string;
    weiboUsername?: string;
    commentsEnabled?: boolean;
    commentModeration?: string;
    allowGuestComments?: boolean;
    rssFeedCount?: number;
    homepagePostCount?: number;
    excerptLength?: number;
    customConfig?: string;
    customCss?: string;
    customJs?: string;
    customHeadCode?: string;
    customFooterCode?: string;
    configVersion?: number;
    lastModifiedField?: string;
    maxArticleSnapshots?: number;
    maxProductSnapshots?: number;
    autoSnapshotEnabled?: boolean;
    snapshotOnStatusChange?: boolean;
    enableBackgroundApi?: boolean;
    defaultBackgroundApiUrl?: string;
    backgroundApiRefreshInterval?: number;
    defaultPageTitle?: string;
    pageTitleTemplates?: any;

    // 订阅功能相关字段
    enableSubscriptionService?: boolean;
    enableUserSubscriptions?: boolean;
    enableGuestSubscriptions?: boolean;
    requireEmailVerification?: boolean;
    maxSubscriptionsPerEmail?: number;
    subscriptionCooldownMinutes?: number;
    subscriptionRateLimit?: number;

    // 管理员订阅类型开关
    adminSubscriptionNewUser?: boolean;
    adminSubscriptionNewComment?: boolean;
    adminSubscriptionNewArticle?: boolean;
    adminSubscriptionNewProduct?: boolean;

    // 用户订阅类型开关
    userSubscriptionNewArticle?: boolean;
    userSubscriptionNewProduct?: boolean;
    userSubscriptionCommentReply?: boolean;

    // ========== 衣橱功能设置 ==========
    wardrobeCategoryIds?: string[];
    wardrobeOnlyPurchased?: boolean;
    wardrobeIdleDays?: number;

    // 只读字段
    createdAt?: string;
    updatedAt?: string;
}

// 对应后端的 SiteProfileUpdateRequest.java
export interface SiteProfileUpdateRequest extends Partial<Omit<SiteProfile, 'id' | 'createdAt' | 'updatedAt' | 'configVersion'>> {
    verificationCode: string;
}

// 模板创建请求
export interface SiteTemplateCreateRequest extends Partial<Omit<SiteProfile, 'id' | 'createdAt' | 'updatedAt' | 'configVersion'>> {
    verificationCode: string;
}

/**
 * 获取站点配置
 */
export const getSiteProfile = (): Promise<ApiResponse<SiteProfile>> => {
    return api.get('/admin/site/profile');
};

/**
 * 发送更新配置所需的验证码
 */
export const sendUpdateCode = (): Promise<ApiResponse<string>> => {
    return api.post('/admin/site/send-update-code');
};

/**
 * 更新站点配置
 */
export const updateSiteProfile = (data: SiteProfileUpdateRequest): Promise<ApiResponse<SiteProfile>> => {
    return api.put('/admin/site/profile', data);
};

// ========== 模板管理API ==========

/**
 * 获取所有站点模板
 */
export const getAllSiteTemplates = (): Promise<ApiResponse<SiteProfile[]>> => {
    return api.get('/admin/site/templates');
};

/**
 * 根据ID获取站点模板
 */
export const getSiteTemplateById = (id: string): Promise<ApiResponse<SiteProfile>> => {
    return api.get(`/admin/site/templates/${id}`);
};

/**
 * 创建站点模板
 */
export const createSiteTemplate = (data: SiteTemplateCreateRequest): Promise<ApiResponse<SiteProfile>> => {
    return api.post('/admin/site/templates', data);
};

/**
 * 更新站点模板
 */
export const updateSiteTemplate = (id: string, data: SiteProfileUpdateRequest): Promise<ApiResponse<SiteProfile>> => {
    return api.put(`/admin/site/templates/${id}`, data);
};

/**
 * 激活站点模板
 */
export const activateSiteTemplate = (id: string): Promise<ApiResponse<SiteProfile>> => {
    return api.post(`/admin/site/templates/${id}/activate`);
};

/**
 * 删除站点模板
 */
export const deleteSiteTemplate = (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/admin/site/templates/${id}`);
};

/**
 * 复制站点模板
 */
export const duplicateSiteTemplate = (id: string, newTemplateName: string): Promise<ApiResponse<SiteProfile>> => {
    return api.post(`/admin/site/templates/${id}/duplicate`, {
        newTemplateName
    });
};