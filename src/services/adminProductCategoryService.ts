// src/services/adminProductCategoryService.ts
import api from './api';
import type { ApiResponse } from '@/types/api';

// 后台分类列表项的类型（支持树形）
export interface AdminCategoryListItem {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
    parentName?: string;
    description?: string;
    icon?: string;
    coverImage?: string;
    color?: string;
    level: number;
    path: string;
    sortOrder: number;
    active: boolean;
    featured: boolean;
    showInMenu: boolean;
    showOnHomepage: boolean;
    productCount: number;
    directProductCount: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    children?: AdminCategoryListItem[];
}

// 创建分类的请求体
export interface CategoryCreateRequest {
    name: string;
    parentId?: string;
    slug?: string;
    description?: string;
    icon?: string;
    coverImage?: string;
    sortOrder?: number;
    active?: boolean;
    featured?: boolean;
    showInMenu?: boolean;
}

// 更新分类的请求体
export type CategoryUpdateRequest = Partial<CategoryCreateRequest>;

/**
 * 获取产品分类树
 */
export const getCategoryTree = async (): Promise<ApiResponse<AdminCategoryListItem[]>> => {
    return api.get('/admin/product-categories/tree');
};

/**
 * 创建新分类
 */
export const createCategory = async (data: CategoryCreateRequest): Promise<ApiResponse<AdminCategoryListItem>> => {
    return api.post('/admin/product-categories', data);
};

/**
 * 更新分类
 */
export const updateCategory = async (id: string, data: CategoryUpdateRequest): Promise<ApiResponse<AdminCategoryListItem>> => {
    return api.put(`/admin/product-categories/${id}`, data);
};

/**
 * 删除分类
 */
export const deleteCategory = async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`/admin/product-categories/${id}`);
};

/**
 * 获取可用作父分类的分类列表
 */
export const getAvailableParents = async (): Promise<ApiResponse<AdminCategoryListItem[]>> => {
    return api.get('/admin/product-categories/available-parents');
};