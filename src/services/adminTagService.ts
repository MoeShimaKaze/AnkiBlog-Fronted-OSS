// src/services/adminTagService.ts
import api from './api';
import type { ApiResponse, PageResponse, PageRequest } from '@/types/api';

// 标签列表项的类型
export interface TagListItem {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    featured: boolean;
    articleCount: number;
    usageCount: number;
}

// 获取标签列表的请求参数
export interface GetAdminTagsParams extends PageRequest {
    keyword?: string;
}

// 创建标签的请求体
export interface TagCreateRequest {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    icon?: string;
    featured?: boolean;
}

// 更新标签的请求体
export interface TagUpdateRequest extends TagCreateRequest {}

/**
 * 获取后台标签列表（分页）
 */
export const getAdminTags = async (params: GetAdminTagsParams): Promise<ApiResponse<PageResponse<TagListItem>>> => {
    return api.get('/admin/tags', { params });
};

/**
 * 创建新标签
 */
export const createTag = async (data: TagCreateRequest): Promise<ApiResponse<TagListItem>> => {
    return api.post('/admin/tags', data);
};

/**
 * 更新标签
 */
export const updateTag = async (id: string, data: TagUpdateRequest): Promise<ApiResponse<TagListItem>> => {
    return api.put(`/admin/tags/${id}`, data);
};

/**
 * 删除标签
 */
export const deleteTag = async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`/admin/tags/${id}`);
};