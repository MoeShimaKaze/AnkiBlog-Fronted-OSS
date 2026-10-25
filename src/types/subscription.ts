// src/types/subscription.ts - 修复版本
import type { BaseEntity } from './api';

export interface Subscription extends BaseEntity {
    email: string;
    userId?: string;
    subscriptionType: SubscriptionType;
    status: SubscriptionStatus;
    subscriberName?: string;
    preferences?: string;
    verifiedAt?: string;
    lastNotificationAt?: string;
    notificationCount: number;
    source: string;
    verificationToken?: string;
    unsubscribeToken?: string;
}

export enum SubscriptionType {
    ADMIN_NEW_USER = 'ADMIN_NEW_USER',
    ADMIN_NEW_COMMENT = 'ADMIN_NEW_COMMENT',
    ADMIN_NEW_ARTICLE = 'ADMIN_NEW_ARTICLE',
    ADMIN_NEW_PRODUCT = 'ADMIN_NEW_PRODUCT',
    USER_NEW_ARTICLE = 'USER_NEW_ARTICLE',
    USER_NEW_PRODUCT = 'USER_NEW_PRODUCT',
    USER_COMMENT_REPLY = 'USER_COMMENT_REPLY'
}

export enum SubscriptionStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    UNSUBSCRIBED = 'UNSUBSCRIBED'
}

export interface SubscriptionTypeInfo {
    type: SubscriptionType;
    code: string;
    description: string;
    category: 'admin' | 'user';
    icon: string;
    color: string;
}

export const SUBSCRIPTION_TYPE_CONFIG: Record<SubscriptionType, SubscriptionTypeInfo> = {
    [SubscriptionType.ADMIN_NEW_USER]: {
        type: SubscriptionType.ADMIN_NEW_USER,
        code: 'admin_new_user',
        description: '新用户注册通知',
        category: 'admin',
        icon: '👤',
        color: '#1890ff'
    },
    [SubscriptionType.ADMIN_NEW_COMMENT]: {
        type: SubscriptionType.ADMIN_NEW_COMMENT,
        code: 'admin_new_comment',
        description: '新评论通知',
        category: 'admin',
        icon: '💬',
        color: '#52c41a'
    },
    [SubscriptionType.ADMIN_NEW_ARTICLE]: {
        type: SubscriptionType.ADMIN_NEW_ARTICLE,
        code: 'admin_new_article',
        description: '新文章发布通知',
        category: 'admin',
        icon: '📝',
        color: '#722ed1'
    },
    [SubscriptionType.ADMIN_NEW_PRODUCT]: {
        type: SubscriptionType.ADMIN_NEW_PRODUCT,
        code: 'admin_new_product',
        description: '新商品上架通知',
        category: 'admin',
        icon: '🛍️',
        color: '#fa541c'
    },
    [SubscriptionType.USER_NEW_ARTICLE]: {
        type: SubscriptionType.USER_NEW_ARTICLE,
        code: 'user_new_article',
        description: '新文章发布订阅',
        category: 'user',
        icon: '📰',
        color: '#13c2c2'
    },
    [SubscriptionType.USER_NEW_PRODUCT]: {
        type: SubscriptionType.USER_NEW_PRODUCT,
        code: 'user_new_product',
        description: '新商品上架订阅',
        category: 'user',
        icon: '🎯',
        color: '#eb2f96'
    },
    [SubscriptionType.USER_COMMENT_REPLY]: {
        type: SubscriptionType.USER_COMMENT_REPLY,
        code: 'user_comment_reply',
        description: '评论回复通知',
        category: 'user',
        icon: '🔔',
        color: '#faad14'
    }
};

export interface SubscriptionCreateRequest {
    email: string;
    subscriptionType: SubscriptionType;
    subscriberName?: string;
    preferences?: string;
}

export interface SubscriptionUpdateRequest {
    status?: SubscriptionStatus;
    subscriberName?: string;
    preferences?: string;
}

export interface UnsubscribeRequest {
    unsubscribeToken: string;
}

export interface NotificationRequest {
    notificationType: SubscriptionType;
    title: string;
    content: string;
    templateVariables?: Record<string, unknown>;
    targetUrl?: string;
    contentId?: string;
}

export interface SubscriptionStats {
    totalSubscriptions: number;
    activeSubscriptions: number;
    pendingSubscriptions: number;
    unsubscribedCount: number;
    subscriptionsByType: Record<string, number>;
    subscriptionsByStatus: Record<string, number>;
    recentSubscriptions: number;
}

// 工具函数
export const getSubscriptionTypeInfo = (type: SubscriptionType): SubscriptionTypeInfo => {
    return SUBSCRIPTION_TYPE_CONFIG[type];
};

export const getAdminSubscriptionTypes = (): SubscriptionType[] => {
    return Object.values(SubscriptionType).filter(type =>
        SUBSCRIPTION_TYPE_CONFIG[type].category === 'admin'
    );
};

export const getUserSubscriptionTypes = (): SubscriptionType[] => {
    return Object.values(SubscriptionType).filter(type =>
        SUBSCRIPTION_TYPE_CONFIG[type].category === 'user'
    );
};

export const getSubscriptionStatusText = (status: SubscriptionStatus): string => {
    const statusMap: Record<SubscriptionStatus, string> = {
        [SubscriptionStatus.PENDING]: '待验证',
        [SubscriptionStatus.ACTIVE]: '已激活',
        [SubscriptionStatus.PAUSED]: '已暂停',
        [SubscriptionStatus.UNSUBSCRIBED]: '已取消'
    };
    return statusMap[status] || status;
};

export const getSubscriptionStatusColor = (status: SubscriptionStatus): string => {
    const colorMap: Record<SubscriptionStatus, string> = {
        [SubscriptionStatus.PENDING]: 'orange',
        [SubscriptionStatus.ACTIVE]: 'green',
        [SubscriptionStatus.PAUSED]: 'blue',
        [SubscriptionStatus.UNSUBSCRIBED]: 'red'
    };
    return colorMap[status] || 'default';
};