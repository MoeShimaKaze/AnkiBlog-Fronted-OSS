// src/services/subscriptionService.ts - 添加重发验证码功能
import api from './api';
import type { ApiResponse, PageResponse, PageRequest } from '@/types/api';
import {
    Subscription,
    SubscriptionType,
    SubscriptionStatus,
    SubscriptionCreateRequest,
    SubscriptionUpdateRequest,
    UnsubscribeRequest,
    NotificationRequest,
    SubscriptionStats
} from '@/types/subscription';

// ==================== 用户订阅API ====================

/**
 * 用户订阅
 */
export const subscribe = (data: SubscriptionCreateRequest): Promise<ApiResponse<Subscription>> => {
    return api.post('/user/subscriptions/subscribe', data);
};

/**
 * 通过验证码验证订阅（修复版本 - 添加订阅类型参数）
 */
export const verifyByCode = (
    email: string,
    code: string,
    subscriptionType: SubscriptionType
): Promise<ApiResponse<Subscription>> => {
    return api.post('/user/subscriptions/verify-code', null, {
        params: { email, code, subscriptionType }
    });
};

/**
 * 重新发送订阅验证码（新增功能）
 */
export const resendSubscriptionVerificationCode = (
    email: string
): Promise<ApiResponse<string>> => {
    return api.post('/email/send-code', {
        email: email,
        codeType: 'SUBSCRIBE'
    });
};

/**
 * 验证邮箱并激活订阅（保留兼容性）
 */
export const verifySubscription = (token: string): Promise<ApiResponse<Subscription>> => {
    return api.post('/user/subscriptions/verify', null, { params: { token } });
};

/**
 * 取消订阅
 */
export const unsubscribe = (data: UnsubscribeRequest): Promise<ApiResponse<string>> => {
    return api.post('/user/subscriptions/unsubscribe', data);
};

/**
 * 通过URL参数取消订阅
 */
export const unsubscribeByToken = (token: string): Promise<ApiResponse<string>> => {
    return api.get('/user/subscriptions/unsubscribe', { params: { token } });
};

/**
 * 获取当前用户的订阅列表
 */
export const getUserSubscriptions = (): Promise<ApiResponse<Subscription[]>> => {
    return api.get('/user/subscriptions/my');
};

/**
 * 检查订阅状态
 */
export const checkSubscription = (email: string, type: SubscriptionType): Promise<ApiResponse<boolean>> => {
    return api.get('/user/subscriptions/check', {
        params: { email, type }
    });
};

/**
 * 获取用户可订阅的类型
 */
export const getUserSubscriptionTypes = (): Promise<ApiResponse<SubscriptionType[]>> => {
    return api.get('/user/subscriptions/types');
};

// ==================== 管理员订阅API ====================

/**
 * 管理员创建订阅
 */
export const adminCreateSubscription = (data: SubscriptionCreateRequest): Promise<ApiResponse<Subscription>> => {
    return api.post('/admin/subscriptions', data);
};

/**
 * 获取所有订阅（分页）
 */
export const getAllSubscriptions = (params: PageRequest): Promise<ApiResponse<PageResponse<Subscription>>> => {
    return api.get('/admin/subscriptions', { params });
};

/**
 * 按状态查询订阅
 */
export const getSubscriptionsByStatus = (
    status: SubscriptionStatus,
    params: PageRequest
): Promise<ApiResponse<PageResponse<Subscription>>> => {
    return api.get(`/admin/subscriptions/status/${status}`, { params });
};

/**
 * 按类型查询订阅
 */
export const getSubscriptionsByType = (
    type: SubscriptionType,
    params: PageRequest
): Promise<ApiResponse<PageResponse<Subscription>>> => {
    return api.get(`/admin/subscriptions/type/${type}`, { params });
};

/**
 * 搜索订阅
 */
export const searchSubscriptions = (
    keyword: string,
    params: PageRequest
): Promise<ApiResponse<PageResponse<Subscription>>> => {
    return api.get('/admin/subscriptions/search', {
        params: { ...params, keyword }
    });
};

/**
 * 更新订阅
 */
export const updateSubscription = (
    subscriptionId: string,
    data: SubscriptionUpdateRequest
): Promise<ApiResponse<Subscription>> => {
    return api.put(`/admin/subscriptions/${subscriptionId}`, data);
};

/**
 * 删除订阅
 */
export const deleteSubscription = (subscriptionId: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/subscriptions/${subscriptionId}`);
};

/**
 * 批量更新订阅状态
 */
export const batchUpdateSubscriptionStatus = (
    subscriptionIds: string[],
    status: SubscriptionStatus
): Promise<ApiResponse<string>> => {
    return api.put('/admin/subscriptions/batch-status', null, {
        params: { subscriptionIds: subscriptionIds.join(','), status }
    });
};

/**
 * 获取订阅统计信息
 */
export const getSubscriptionStats = (): Promise<ApiResponse<SubscriptionStats>> => {
    return api.get('/admin/subscriptions/stats');
};

/**
 * 发送自定义通知
 */
export const sendCustomNotification = (data: NotificationRequest): Promise<ApiResponse<string>> => {
    return api.post('/admin/subscriptions/notify', data);
};

/**
 * 获取管理员可订阅的类型
 */
export const getAdminSubscriptionTypes = (): Promise<ApiResponse<SubscriptionType[]>> => {
    return api.get('/admin/subscriptions/types');
};

/**
 * 获取邮箱的订阅列表
 */
export const getEmailSubscriptions = (email: string): Promise<ApiResponse<Subscription[]>> => {
    return api.get(`/admin/subscriptions/email/${email}`);
};

/**
 * 获取指定类型的活跃订阅邮箱列表
 */
export const getActiveEmailsByType = (type: SubscriptionType): Promise<ApiResponse<string[]>> => {
    return api.get(`/admin/subscriptions/active-emails/${type}`);
};

// ==================== 辅助函数 ====================

/**
 * 构建分页查询参数
 */
export const buildPageParams = (
    page: number = 1,
    size: number = 10,
    sort: string = 'createdAt,desc'
): PageRequest => ({
    page: page - 1, // 后端使用0基页码
    size,
    sort
});

/**
 * 构建搜索参数
 */
export const buildSearchParams = (
    keyword: string,
    page: number = 1,
    size: number = 10
): PageRequest & { keyword: string } => ({
    ...buildPageParams(page, size),
    keyword
});

/**
 * 格式化错误消息
 */
export const formatSubscriptionError = (error: any): string => {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    if (error?.message) {
        return error.message;
    }

    return '操作失败，请稍后重试';
};

/**
 * 检查是否可以订阅
 */
export const canSubscribe = (
    subscriptions: Subscription[],
    type: SubscriptionType
): boolean => {
    return !subscriptions.some(sub =>
        sub.subscriptionType === type &&
        sub.status === SubscriptionStatus.ACTIVE
    );
};

/**
 * 获取订阅数量统计
 */
export const getSubscriptionCounts = (subscriptions: Subscription[]) => {
    return subscriptions.reduce((counts, sub) => {
        counts.total++;
        counts[sub.status] = (counts[sub.status] || 0) + 1;
        return counts;
    }, {
        total: 0,
        [SubscriptionStatus.ACTIVE]: 0,
        [SubscriptionStatus.PENDING]: 0,
        [SubscriptionStatus.PAUSED]: 0,
        [SubscriptionStatus.UNSUBSCRIBED]: 0
    });
};

/**
 * 过滤订阅列表
 */
export const filterSubscriptions = (
    subscriptions: Subscription[],
    filters: {
        status?: SubscriptionStatus;
        type?: SubscriptionType;
        category?: 'admin' | 'user';
        keyword?: string;
    }
): Subscription[] => {
    return subscriptions.filter(sub => {
        if (filters.status && sub.status !== filters.status) {
            return false;
        }

        if (filters.type && sub.subscriptionType !== filters.type) {
            return false;
        }

        if (filters.category) {
            const isAdminType = sub.subscriptionType.startsWith('ADMIN_');
            if (filters.category === 'admin' && !isAdminType) {
                return false;
            }
            if (filters.category === 'user' && isAdminType) {
                return false;
            }
        }

        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            return (
                sub.email.toLowerCase().includes(keyword) ||
                (sub.subscriberName && sub.subscriberName.toLowerCase().includes(keyword))
            );
        }

        return true;
    });
};