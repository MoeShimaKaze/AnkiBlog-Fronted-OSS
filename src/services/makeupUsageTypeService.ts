/**
 * 化妆品使用类型 API 服务
 */
import api from './api';
import type { ApiResponse } from '@/types/api';
import type { MakeupUsageType, MakeupUsageTypeRequest, UsageTypeSortRequest } from '@/types/makeup';

/**
 * 获取所有使用类型
 */
export const getAllUsageTypes = (includeCount: boolean = false): Promise<ApiResponse<MakeupUsageType[]>> => {
    return api.get('/admin/makeup-usage-types', { params: { includeCount } });
};

/**
 * 获取单个使用类型
 */
export const getUsageTypeById = (id: string): Promise<ApiResponse<MakeupUsageType>> => {
    return api.get(`/admin/makeup-usage-types/${id}`);
};

/**
 * 创建使用类型
 */
export const createUsageType = (data: MakeupUsageTypeRequest): Promise<ApiResponse<MakeupUsageType>> => {
    return api.post('/admin/makeup-usage-types', data);
};

/**
 * 更新使用类型
 */
export const updateUsageType = (id: string, data: MakeupUsageTypeRequest): Promise<ApiResponse<MakeupUsageType>> => {
    return api.put(`/admin/makeup-usage-types/${id}`, data);
};

/**
 * 删除使用类型
 */
export const deleteUsageType = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/makeup-usage-types/${id}`);
};

/**
 * 批量更新排序
 */
export const updateSortOrders = (data: UsageTypeSortRequest): Promise<ApiResponse<string>> => {
    return api.put('/admin/makeup-usage-types/sort', data);
};

/**
 * 初始化默认使用类型
 */
export const initDefaultUsageTypes = (): Promise<ApiResponse<string>> => {
    return api.post('/admin/makeup-usage-types/init-defaults');
};
