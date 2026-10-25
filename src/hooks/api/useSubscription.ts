// src/hooks/useSubscription.ts - 添加重发验证码功能
import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import * as subscriptionService from '@/services/subscriptionService';
import type {
    Subscription,
    SubscriptionType,
    SubscriptionStatus,
    SubscriptionCreateRequest,
    SubscriptionUpdateRequest,
    SubscriptionStats,
    NotificationRequest
} from '@/types/subscription';

// ==================== 用户订阅Hook ====================

export const useUserSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 重发验证码相关状态
    const [resendLoading, setResendLoading] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await subscriptionService.getUserSubscriptions();
            if (response.success) {
                setSubscriptions(response.data);
            } else {
                setError(response.message);
                message.error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const subscribe = useCallback(async (data: SubscriptionCreateRequest) => {
        setLoading(true);
        try {
            const response = await subscriptionService.subscribe(data);
            if (response.success) {
                message.success('订阅申请已提交，请查收验证邮件');
                await fetchSubscriptions(); // 刷新列表
                return response.data;
            } else {
                message.error(response.message);
                throw new Error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSubscriptions]);

    // 修复版本 - 添加 subscriptionType 参数，增加重发逻辑
    const verifyByCode = useCallback(async (
        email: string,
        code: string,
        subscriptionType: SubscriptionType
    ) => {
        setLoading(true);
        try {
            const response = await subscriptionService.verifyByCode(email, code, subscriptionType);
            if (response.success) {
                message.success('邮箱验证成功，订阅已激活');
                await fetchSubscriptions(); // 刷新列表
                // 验证成功后重置重发状态
                setCanResend(false);
                setCountdown(0);
                return response.data;
            } else {
                message.error(response.message);
                throw new Error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);

            // 验证失败后允许重发验证码
            setCanResend(true);

            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSubscriptions]);

    // 新增：重发验证码功能
    const resendVerificationCode = useCallback(async (
        email: string
    ) => {
        if (!canResend || countdown > 0) {
            message.warning('请等待冷却时间结束后再试');
            return;
        }

        setResendLoading(true);
        try {
            const response = await subscriptionService.resendSubscriptionVerificationCode(email);
            if (response.success) {
                message.success('验证码已重新发送，请查收邮件');

                // 设置120秒冷却时间
                setCanResend(false);
                setCountdown(120);

                // 启动倒计时
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setCanResend(true);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

            } else {
                message.error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);
        } finally {
            setResendLoading(false);
        }
    }, [canResend, countdown]);

    const unsubscribe = useCallback(async (unsubscribeToken: string) => {
        setLoading(true);
        try {
            const response = await subscriptionService.unsubscribeByToken(unsubscribeToken);
            if (response.success) {
                message.success('已成功取消订阅');
                await fetchSubscriptions(); // 刷新列表
            } else {
                message.error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [fetchSubscriptions]);

    const checkSubscription = useCallback(async (email: string, type: SubscriptionType) => {
        try {
            const response = await subscriptionService.checkSubscription(email, type);
            return response.success ? response.data : false;
        } catch (err) {
            console.error('检查订阅状态失败:', err);
            return false;
        }
    }, []);

    // 重置重发状态（用于弹窗关闭时）
    const resetResendState = useCallback(() => {
        setCanResend(false);
        setCountdown(0);
        setResendLoading(false);
    }, []);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    return {
        subscriptions,
        loading,
        error,
        subscribe,
        verifyByCode,
        unsubscribe,
        checkSubscription,
        refreshSubscriptions: fetchSubscriptions,

        // 新增：重发验证码相关
        resendVerificationCode,
        resendLoading,
        canResend,
        countdown,
        resetResendState
    };
};

// ==================== 管理员订阅Hook ====================

export const useAdminSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<{
        status?: SubscriptionStatus;
        type?: SubscriptionType;
        keyword?: string;
    }>({});

    const fetchSubscriptions = useCallback(async (
        page: number = currentPage,
        size: number = pageSize,
        searchFilters = filters
    ) => {
        setLoading(true);
        try {
            let response: any;

            if (searchFilters.keyword) {
                const params = subscriptionService.buildSearchParams(searchFilters.keyword, page, size);
                response = await subscriptionService.searchSubscriptions(searchFilters.keyword, params);
            } else if (searchFilters.status) {
                const params = subscriptionService.buildPageParams(page, size);
                response = await subscriptionService.getSubscriptionsByStatus(searchFilters.status, params);
            } else if (searchFilters.type) {
                const params = subscriptionService.buildPageParams(page, size);
                response = await subscriptionService.getSubscriptionsByType(searchFilters.type, params);
            } else {
                const params = subscriptionService.buildPageParams(page, size);
                response = await subscriptionService.getAllSubscriptions(params);
            }

            if (response.success) {
                setSubscriptions(response.data.content);
                setTotal(response.data.totalElements);
                setCurrentPage(page);
                setPageSize(size);
            } else {
                message.error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters]);

    const createSubscription = useCallback(async (data: SubscriptionCreateRequest) => {
        try {
            const response = await subscriptionService.adminCreateSubscription(data);
            if (response.success) {
                message.success('管理员订阅创建成功');
                await fetchSubscriptions();
                return response.data;
            } else {
                message.error(response.message);
                throw new Error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);
            throw err;
        }
    }, [fetchSubscriptions]);

    const updateSubscription = useCallback(async (
        subscriptionId: string,
        data: SubscriptionUpdateRequest
    ) => {
        try {
            const response = await subscriptionService.updateSubscription(subscriptionId, data);
            if (response.success) {
                message.success('订阅更新成功');
                await fetchSubscriptions();
                return response.data;
            } else {
                message.error(response.message);
                throw new Error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);
            throw err;
        }
    }, [fetchSubscriptions]);

    const deleteSubscription = useCallback(async (subscriptionId: string) => {
        try {
            const response = await subscriptionService.deleteSubscription(subscriptionId);
            if (response.success) {
                message.success('订阅删除成功');
                await fetchSubscriptions();
            } else {
                message.error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);
        }
    }, [fetchSubscriptions]);

    const batchUpdateStatus = useCallback(async (
        subscriptionIds: string[],
        status: SubscriptionStatus
    ) => {
        try {
            const response = await subscriptionService.batchUpdateSubscriptionStatus(subscriptionIds, status);
            if (response.success) {
                message.success('批量更新状态成功');
                await fetchSubscriptions();
            } else {
                message.error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);
        }
    }, [fetchSubscriptions]);

    const searchSubscriptions = useCallback((keyword: string) => {
        const newFilters = { ...filters, keyword };
        setFilters(newFilters);
        setCurrentPage(1);
        fetchSubscriptions(1, pageSize, newFilters);
    }, [filters, pageSize, fetchSubscriptions]);

    const filterByStatus = useCallback((status?: SubscriptionStatus) => {
        const newFilters = { ...filters, status, keyword: undefined };
        setFilters(newFilters);
        setCurrentPage(1);
        fetchSubscriptions(1, pageSize, newFilters);
    }, [filters, pageSize, fetchSubscriptions]);

    const filterByType = useCallback((type?: SubscriptionType) => {
        const newFilters = { ...filters, type, keyword: undefined };
        setFilters(newFilters);
        setCurrentPage(1);
        fetchSubscriptions(1, pageSize, newFilters);
    }, [filters, pageSize, fetchSubscriptions]);

    const clearFilters = useCallback(() => {
        setFilters({});
        setCurrentPage(1);
        fetchSubscriptions(1, pageSize, {});
    }, [pageSize, fetchSubscriptions]);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    return {
        subscriptions,
        loading,
        total,
        currentPage,
        pageSize,
        filters,
        createSubscription,
        updateSubscription,
        deleteSubscription,
        batchUpdateStatus,
        searchSubscriptions,
        filterByStatus,
        filterByType,
        clearFilters,
        setCurrentPage: (page: number) => fetchSubscriptions(page, pageSize),
        setPageSize: (size: number) => {
            setPageSize(size);
            fetchSubscriptions(1, size);
        },
        refreshSubscriptions: fetchSubscriptions
    };
};

// ==================== 订阅统计Hook ====================

export const useSubscriptionStats = () => {
    const [stats, setStats] = useState<SubscriptionStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await subscriptionService.getSubscriptionStats();
            if (response.success) {
                setStats(response.data);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refreshStats: fetchStats
    };
};

// ==================== 邮箱订阅Hook ====================

export const useEmailSubscriptions = (email?: string) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmailSubscriptions = useCallback(async (targetEmail: string) => {
        if (!targetEmail) return;

        setLoading(true);
        setError(null);
        try {
            const response = await subscriptionService.getEmailSubscriptions(targetEmail);
            if (response.success) {
                setSubscriptions(response.data);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (email) {
            fetchEmailSubscriptions(email);
        }
    }, [email, fetchEmailSubscriptions]);

    return {
        subscriptions,
        loading,
        error,
        refreshSubscriptions: (targetEmail: string) => fetchEmailSubscriptions(targetEmail)
    };
};

// ==================== 通知发送Hook ====================

export const useNotificationSender = () => {
    const [sending, setSending] = useState(false);

    const sendNotification = useCallback(async (data: NotificationRequest) => {
        setSending(true);
        try {
            const response = await subscriptionService.sendCustomNotification(data);
            if (response.success) {
                message.success('自定义通知发送任务已启动');
            } else {
                message.error(response.message);
            }
        } catch (err: any) {
            const errorMsg = subscriptionService.formatSubscriptionError(err);
            message.error(errorMsg);
        } finally {
            setSending(false);
        }
    }, []);

    return {
        sending,
        sendNotification
    };
};