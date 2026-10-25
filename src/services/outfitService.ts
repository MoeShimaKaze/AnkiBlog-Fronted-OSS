/**
 * 穿搭管理 API 服务
 */
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { OutfitLog, OutfitCreateRequest, OutfitStats, CalendarData } from '@/types/outfit';

// ==================== 公开接口 ====================

/**
 * 公开接口：获取穿搭列表（分页，支持日期筛选）
 */
export const getPublicOutfits = (params: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
}): Promise<ApiResponse<PageResponse<OutfitLog>>> => {
    return api.get('/public/outfits', { params });
};

/**
 * 公开接口：获取穿搭详情
 */
export const getPublicOutfitById = (id: string): Promise<ApiResponse<OutfitLog>> => {
    return api.get(`/public/outfits/${id}`);
};

// ==================== 管理接口 ====================

/**
 * 创建穿搭记录
 */
export const createOutfit = (data: OutfitCreateRequest): Promise<ApiResponse<OutfitLog>> => {
    return api.post('/admin/outfits', data);
};

/**
 * 获取穿搭列表
 */
export const getOutfits = (params: { page?: number; size?: number }): Promise<ApiResponse<PageResponse<OutfitLog>>> => {
    return api.get('/admin/outfits', { params });
};

/**
 * 获取穿搭详情
 */
export const getOutfitById = (id: string): Promise<ApiResponse<OutfitLog>> => {
    return api.get(`/admin/outfits/${id}`);
};

/**
 * 删除穿搭记录
 */
export const deleteOutfit = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/outfits/${id}`);
};

/**
 * 获取日历数据
 */
export const getOutfitCalendar = (year: number, month: number): Promise<ApiResponse<CalendarData>> => {
    return api.get('/admin/outfits/calendar', { params: { year, month } });
};

/**
 * 获取穿搭统计
 */
export const getOutfitStats = (): Promise<ApiResponse<OutfitStats>> => {
    return api.get('/admin/outfits/stats');
};
