/**
 * 购买记录 API 服务
 */
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { PurchaseRecord, PurchaseRecordRequest, PurchaseStats } from '@/types/makeup';

/**
 * 添加购买记录
 */
export const addPurchaseRecord = (data: PurchaseRecordRequest): Promise<ApiResponse<PurchaseRecord>> => {
    return api.post('/admin/purchases', data);
};

/**
 * 获取商品购买历史
 */
export const getProductPurchaseHistory = (productId: string): Promise<ApiResponse<PurchaseRecord[]>> => {
    return api.get(`/admin/purchases/product/${productId}`);
};

/**
 * 获取商品购买历史（分页）
 */
export const getProductPurchaseHistoryPaged = (
    productId: string,
    params: { page?: number; size?: number } = {}
): Promise<ApiResponse<PageResponse<PurchaseRecord>>> => {
    return api.get(`/admin/purchases/product/${productId}/page`, { params });
};

/**
 * 获取用户购买记录（分页）
 */
export const getUserPurchaseRecords = (
    params: { page?: number; size?: number } = {}
): Promise<ApiResponse<PageResponse<PurchaseRecord>>> => {
    return api.get('/admin/purchases', { params });
};

/**
 * 获取购买记录详情
 */
export const getPurchaseRecordById = (id: string): Promise<ApiResponse<PurchaseRecord>> => {
    return api.get(`/admin/purchases/${id}`);
};

/**
 * 删除购买记录
 */
export const deletePurchaseRecord = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/purchases/${id}`);
};

/**
 * 获取购买统计
 */
export const getPurchaseStats = (): Promise<ApiResponse<PurchaseStats>> => {
    return api.get('/admin/purchases/stats');
};

/**
 * 按色号搜索购买记录
 */
export const searchByColorCode = (productId: string, colorCode: string): Promise<ApiResponse<PurchaseRecord[]>> => {
    return api.get(`/admin/purchases/product/${productId}/search`, { params: { colorCode } });
};
