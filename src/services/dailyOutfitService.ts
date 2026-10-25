/**
 * 今天穿什么 API 服务
 */
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
    DailyOutfitSuggestion,
    DailyOutfitPublicResponse,
    DailyOutfitGenerateRequest,
    DailyOutfitAcceptRequest,
    SuggestionStatus
} from '@/types/outfit';

// ==================== 管理端接口 ====================

/**
 * 生成今日穿搭建议
 */
export const generateSuggestion = (data?: DailyOutfitGenerateRequest): Promise<ApiResponse<DailyOutfitSuggestion>> => {
    return api.post('/admin/daily-outfit/generate', data || {});
};

/**
 * 重新生成建议（保留旧记录）
 */
export const regenerateSuggestion = (data?: DailyOutfitGenerateRequest): Promise<ApiResponse<DailyOutfitSuggestion>> => {
    return api.post('/admin/daily-outfit/regenerate', data || {});
};

/**
 * 接受建议（自动创建穿搭记录）
 */
export const acceptSuggestion = (id: string, data?: DailyOutfitAcceptRequest): Promise<ApiResponse<DailyOutfitSuggestion>> => {
    return api.post(`/admin/daily-outfit/${id}/accept`, data || {});
};

/**
 * 拒绝建议
 */
export const rejectSuggestion = (id: string): Promise<ApiResponse<DailyOutfitSuggestion>> => {
    return api.post(`/admin/daily-outfit/${id}/reject`);
};

/**
 * 获取建议列表
 */
export const getSuggestions = (params: {
    page?: number;
    size?: number;
    status?: SuggestionStatus;
}): Promise<ApiResponse<PageResponse<DailyOutfitSuggestion>>> => {
    return api.get('/admin/daily-outfit', { params });
};

/**
 * 获取建议详情
 */
export const getSuggestionById = (id: string): Promise<ApiResponse<DailyOutfitSuggestion>> => {
    return api.get(`/admin/daily-outfit/${id}`);
};

/**
 * 删除建议
 */
export const deleteSuggestion = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/daily-outfit/${id}`);
};

// ==================== 公开接口 ====================

/**
 * 获取最近的公开建议
 */
export const getPublicRecentSuggestions = (limit: number = 10): Promise<ApiResponse<DailyOutfitPublicResponse[]>> => {
    return api.get('/public/daily-outfit/recent', { params: { limit } });
};

/**
 * 获取单条公开建议详情
 */
export const getPublicSuggestionById = (id: string): Promise<ApiResponse<DailyOutfitPublicResponse>> => {
    return api.get(`/public/daily-outfit/${id}`);
};
