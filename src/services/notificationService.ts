/**
 * 通知推送服务API
 */
import api from './api';
import { ApiResponse } from '@/types/api';
import {
    DingtalkConfig,
    DingtalkConfigRequest,
    NotificationChannelConfig,
    ChannelConfigUpdateRequest,
    BatchChannelUpdateRequest,
    NotificationSendLog,
    NotificationStats,
    NotificationType,
} from '@/types/notification';

// ==================== 钉钉配置 ====================

/**
 * 获取钉钉配置
 */
export const getDingtalkConfig = (): Promise<ApiResponse<DingtalkConfig | null>> => {
    return api.get('/admin/notification/dingtalk/config');
};

/**
 * 更新钉钉配置
 */
export const updateDingtalkConfig = (data: DingtalkConfigRequest): Promise<ApiResponse<DingtalkConfig>> => {
    return api.put('/admin/notification/dingtalk/config', data);
};

/**
 * 测试钉钉连接
 */
export const testDingtalkConnection = (): Promise<ApiResponse<boolean>> => {
    return api.post('/admin/notification/dingtalk/test');
};

// ==================== 渠道配置 ====================

/**
 * 获取所有渠道配置
 */
export const getAllChannelConfigs = (): Promise<ApiResponse<NotificationChannelConfig[]>> => {
    return api.get('/admin/notification/channels');
};

/**
 * 获取指定类型的渠道配置
 */
export const getChannelConfig = (type: NotificationType): Promise<ApiResponse<NotificationChannelConfig>> => {
    return api.get(`/admin/notification/channels/${type}`);
};

/**
 * 更新指定类型的渠道配置
 */
export const updateChannelConfig = (
    type: NotificationType | string,
    data: ChannelConfigUpdateRequest
): Promise<ApiResponse<NotificationChannelConfig>> => {
    return api.put(`/admin/notification/channels/${type}`, data);
};

/**
 * 批量更新渠道配置
 */
export const batchUpdateChannelConfigs = (
    data: BatchChannelUpdateRequest
): Promise<ApiResponse<NotificationChannelConfig[]>> => {
    return api.put('/admin/notification/channels/batch', data);
};

// ==================== 发送日志 ====================

/**
 * 分页查询发送日志
 */
export const getNotificationLogs = (params: {
    type?: NotificationType;
    channel?: 'EMAIL' | 'DINGTALK';
    status?: 'PENDING' | 'SUCCESS' | 'FAILED';
    page?: number;
    size?: number;
}): Promise<ApiResponse<{
    content: NotificationSendLog[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}>> => {
    return api.get('/admin/notification/logs', { params });
};

/**
 * 获取发送统计
 */
export const getNotificationStats = (): Promise<ApiResponse<NotificationStats>> => {
    return api.get('/admin/notification/logs/stats');
};

/**
 * 删除日志记录
 */
export const deleteNotificationLog = (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/admin/notification/logs/${id}`);
};

/**
 * 清理历史日志
 */
export const cleanupNotificationLogs = (daysToKeep: number = 30): Promise<ApiResponse<number>> => {
    return api.delete('/admin/notification/logs/cleanup', { params: { daysToKeep } });
};

// 导出默认对象
const notificationService = {
    // 钉钉配置
    getDingtalkConfig,
    updateDingtalkConfig,
    testDingtalkConnection,
    // 渠道配置
    getAllChannelConfigs,
    getChannelConfig,
    updateChannelConfig,
    batchUpdateChannelConfigs,
    // 发送日志
    getNotificationLogs,
    getNotificationStats,
    deleteNotificationLog,
    cleanupNotificationLogs,
};

export default notificationService;
