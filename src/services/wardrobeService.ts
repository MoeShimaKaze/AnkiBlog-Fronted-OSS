/**
 * 衣橱管理 API 服务
 */
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { Product } from '@/types/product';
import type { StyleStat, WardrobeOverview } from '@/types/outfit';

/**
 * 衣橱商品筛选参数
 */
export interface WardrobeFilterParams {
    page?: number;
    size?: number;
    categoryIds?: string[];
    onlyPurchased?: boolean;
    useDefaultSettings?: boolean;
    keyword?: string;
}

/**
 * 获取已购买商品列表（支持筛选和关键词搜索）
 * @param params 筛选参数
 */
export const getPurchasedProducts = (params: WardrobeFilterParams = {}): Promise<ApiResponse<PageResponse<Product>>> => {
    const { categoryIds, keyword, ...restParams } = params;
    const queryParams: any = { ...restParams };
    if (categoryIds && categoryIds.length > 0) {
        queryParams.categoryIds = categoryIds;
    }
    if (keyword && keyword.trim()) {
        queryParams.keyword = keyword.trim();
    }
    return api.get('/admin/wardrobe', {
        params: queryParams,
        paramsSerializer: {
            serialize: (params) => {
                const searchParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        // Spring Boot expects repeated parameter names: categoryIds=v1&categoryIds=v2
                        value.forEach(v => searchParams.append(key, v));
                    } else if (value !== undefined && value !== null) {
                        searchParams.append(key, String(value));
                    }
                });
                return searchParams.toString();
            }
        }
    });
};

/**
 * 获取闲置物品
 * @param days 闲置天数阈值（可选，不传则使用系统设置默认值）
 */
export const getIdleItems = (days?: number, params: { page?: number; size?: number } = {}): Promise<ApiResponse<PageResponse<Product>>> => {
    const queryParams: any = { ...params };
    if (days !== undefined) {
        queryParams.days = days;
    }
    return api.get('/admin/wardrobe/idle', { params: queryParams });
};

/**
 * 获取风格统计
 */
export const getStyleStats = (): Promise<ApiResponse<StyleStat[]>> => {
    return api.get('/admin/wardrobe/style-stats');
};

/**
 * 获取最常穿商品
 */
export const getMostWornProducts = (): Promise<ApiResponse<Product[]>> => {
    return api.get('/admin/wardrobe/most-worn');
};

/**
 * 获取衣橱概览
 */
export const getWardrobeOverview = (): Promise<ApiResponse<WardrobeOverview>> => {
    return api.get('/admin/wardrobe/overview');
};

/**
 * 标记商品为已购买（公开页面使用）
 */
export const markProductPurchased = (productId: string, purchased: boolean = true): Promise<ApiResponse<Product>> => {
    return api.post(`/public/products/${productId}/purchase-mark`, null, { params: { purchased } });
};
