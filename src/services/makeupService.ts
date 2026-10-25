/**
 * 化妆记录 API 服务
 */
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { MakeupLog, MakeupCreateRequest, MakeupStats, MakeupCalendarData } from '@/types/makeup';

// ==================== 公开接口 ====================

/**
 * 公开接口：获取化妆记录列表（分页，支持日期筛选）
 */
export const getPublicMakeups = (params: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
}): Promise<ApiResponse<PageResponse<MakeupLog>>> => {
    return api.get('/public/makeups', { params });
};

/**
 * 公开接口：搜索化妆记录（按妆面名称）
 */
export const searchPublicMakeups = (params: { keyword: string; page?: number; size?: number }): Promise<ApiResponse<PageResponse<MakeupLog>>> => {
    return api.get('/public/makeups/search', { params });
};

/**
 * 公开接口：获取化妆记录详情
 */
export const getPublicMakeupById = (id: string): Promise<ApiResponse<MakeupLog>> => {
    return api.get(`/public/makeups/${id}`);
};

// ==================== 管理接口 ====================

/**
 * 创建化妆记录
 */
export const createMakeup = (data: MakeupCreateRequest): Promise<ApiResponse<MakeupLog>> => {
    return api.post('/admin/makeups', data);
};

/**
 * 获取化妆记录列表（分页）
 */
export const getMakeups = (params: { page?: number; size?: number } = {}): Promise<ApiResponse<PageResponse<MakeupLog>>> => {
    return api.get('/admin/makeups', { params });
};

/**
 * 获取化妆记录详情
 */
export const getMakeupById = (id: string): Promise<ApiResponse<MakeupLog>> => {
    return api.get(`/admin/makeups/${id}`);
};

/**
 * 删除化妆记录
 */
export const deleteMakeup = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/makeups/${id}`);
};

/**
 * 获取日历数据
 */
export const getMakeupCalendar = (year: number, month: number): Promise<ApiResponse<MakeupCalendarData[]>> => {
    return api.get('/admin/makeups/calendar', { params: { year, month } });
};

/**
 * 获取化妆统计
 */
export const getMakeupStats = (): Promise<ApiResponse<MakeupStats>> => {
    return api.get('/admin/makeups/stats');
};

/**
 * 搜索化妆记录（按妆面名称）
 */
export const searchMakeupByLookName = (keyword: string): Promise<ApiResponse<MakeupLog[]>> => {
    return api.get('/admin/makeups/search', { params: { keyword } });
};

/**
 * 获取有参考网页的化妆记录
 */
export const getMakeupsWithReferenceUrl = (): Promise<ApiResponse<MakeupLog[]>> => {
    return api.get('/admin/makeups/with-reference');
};
