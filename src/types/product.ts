// src/types/product.ts - 更新版本
import { BaseEntity } from './api';

export interface ProductCategoryInfo {
    id: string;
    name: string;
}

// 更新：匹配实际API响应的商品类型
export interface Product extends BaseEntity {
    name: string;
    slug: string;
    description?: string;
    summary?: string;
    mainImage: string;
    brand?: string;
    price: number;
    originalPrice?: number;
    currency: string;
    status: ProductStatus;
    featured: boolean;
    categoryName?: string;  // 列表页使用
    tags: string[];         // 后端返回标签名称数组
    viewCount: number;
    clickCount: number;
    favoriteCount: number;
    hasDiscount: boolean;
    discountPercentage: number;
    purchaseUrl?: string;

    // 详情页使用
    category?: ProductCategoryInfo;
    coverImage?: string;
    images?: string[];

    // 衣橱管理字段
    isPurchased?: boolean;
    wearCount?: number;

    // 化妆品模块字段
    purchaseCount?: number;
    useCount?: number;
    lastUsedAt?: string;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface ProductCreateRequest {
    name: string;
    description?: string;
    summary?: string;
    price: number;
    originalPrice?: number;
    mainImage: string;
    images?: string[];
    categoryId: string;
    status?: ProductStatus;
    featured?: boolean;
    purchaseUrl?: string;
    tags?: string[];
    isPurchased?: boolean;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
}