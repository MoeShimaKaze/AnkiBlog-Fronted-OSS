import api from './api';
import type { ApiResponse } from '@/types/api';
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '@/types/product';

// 商品筛选参数
export interface PublicProductFilterParams {
    page?: number;
    size?: number;
    sort?: string;
    keyword?: string;
    featured?: boolean;
    isPurchased?: boolean;
    categoryId?: string;
    tags?: string[];
    createdAtStart?: string;
    createdAtEnd?: string;
    minPrice?: number;
    maxPrice?: number;
}

// 分类响应
export interface CategoryTreeItem {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    parentId?: string;
    level: number;
    productCount: number;
    children?: CategoryTreeItem[];
}

// 标签响应
export interface TagItem {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    articleCount: number;
    usageCount: number;
}

// 获取商品列表（支持高级筛选）
export const getProducts = (params: PublicProductFilterParams): Promise<ApiResponse> => api.get('/public/products', { params });
export const getProductBySlug = (slug: string): Promise<ApiResponse<Product>> => api.get(`/public/products/${slug}`);

// 获取商品分类树（公开接口）
export const getProductCategoryTree = (): Promise<ApiResponse<CategoryTreeItem[]>> => api.get('/public/products/categories/tree');

// 获取商品标签（公开接口）
export const getProductTags = (): Promise<ApiResponse<TagItem[]>> => api.get('/public/products/tags');

// 新增/更新的函数
export const getProductById = (id: string): Promise<ApiResponse<Product>> => {
    return api.get(`/admin/products/${id}`);
};
export const createProduct = (data: ProductCreateRequest): Promise<ApiResponse<Product>> => {
    return api.post('/admin/products', data);
};
export const updateProduct = (id: string, data: ProductUpdateRequest): Promise<ApiResponse<Product>> => {
    return api.put(`/admin/products/${id}`, data);
};
export const clickProduct = (id: string): Promise<ApiResponse<null>> => {
    return api.post(`/public/products/${id}/click`);
};