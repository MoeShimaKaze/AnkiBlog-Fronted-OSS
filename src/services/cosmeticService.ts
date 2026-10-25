/**
 * 化妆品管理 API 服务
 */
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { Product } from '@/types/product';
import type { CosmeticOverview, StyleStat, CosmeticFilterParams } from '@/types/makeup';

/**
 * 序列化查询参数（支持数组参数）
 */
const serializeParams = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
        } else if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
};

/**
 * 获取化妆品列表（支持筛选）
 */
export const getCosmetics = (params: CosmeticFilterParams = {}): Promise<ApiResponse<PageResponse<Product>>> => {
    const { categoryIds, ...restParams } = params;
    const queryParams: any = { ...restParams };
    if (categoryIds && categoryIds.length > 0) {
        queryParams.categoryIds = categoryIds;
    }
    return api.get('/admin/cosmetics', {
        params: queryParams,
        paramsSerializer: { serialize: serializeParams }
    });
};

/**
 * 获取闲置化妆品
 */
export const getIdleCosmetics = (params: CosmeticFilterParams = {}): Promise<ApiResponse<PageResponse<Product>>> => {
    const { categoryIds, ...restParams } = params;
    const queryParams: any = { ...restParams };
    if (categoryIds && categoryIds.length > 0) {
        queryParams.categoryIds = categoryIds;
    }
    return api.get('/admin/cosmetics/idle', {
        params: queryParams,
        paramsSerializer: { serialize: serializeParams }
    });
};

/**
 * 获取最常用的化妆品
 */
export const getMostUsedCosmetics = (params: {
    categoryIds?: string[];
    onlyPurchased?: boolean;
    useDefaultSettings?: boolean;
} = {}): Promise<ApiResponse<Product[]>> => {
    const { categoryIds, ...restParams } = params;
    const queryParams: any = { ...restParams };
    if (categoryIds && categoryIds.length > 0) {
        queryParams.categoryIds = categoryIds;
    }
    return api.get('/admin/cosmetics/most-used', {
        params: queryParams,
        paramsSerializer: { serialize: serializeParams }
    });
};

/**
 * 获取风格统计
 */
export const getCosmeticStyleStats = (params: {
    categoryIds?: string[];
    onlyPurchased?: boolean;
    useDefaultSettings?: boolean;
} = {}): Promise<ApiResponse<StyleStat[]>> => {
    const { categoryIds, ...restParams } = params;
    const queryParams: any = { ...restParams };
    if (categoryIds && categoryIds.length > 0) {
        queryParams.categoryIds = categoryIds;
    }
    return api.get('/admin/cosmetics/style-stats', {
        params: queryParams,
        paramsSerializer: { serialize: serializeParams }
    });
};

/**
 * 获取化妆品概览统计
 */
export const getCosmeticOverview = (params: {
    categoryIds?: string[];
    onlyPurchased?: boolean;
    useDefaultSettings?: boolean;
} = {}): Promise<ApiResponse<CosmeticOverview>> => {
    const { categoryIds, ...restParams } = params;
    const queryParams: any = { ...restParams };
    if (categoryIds && categoryIds.length > 0) {
        queryParams.categoryIds = categoryIds;
    }
    return api.get('/admin/cosmetics/overview', {
        params: queryParams,
        paramsSerializer: { serialize: serializeParams }
    });
};
