import api from './api';
import type { ApiResponse, PageResponse, PageRequest } from '@/types/api';

// --- 类型定义 (精确匹配后端 DTO) ---

type Currency = 'CNY' | 'USD' | 'EUR';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'DISCONTINUED';
type SnapshotType = 'MANUAL' | 'AUTO' | 'DRAFT_SAVE' | 'STATUS_CHANGE';

/**
 * 商品筛选参数
 */
export interface ProductFilterParams extends PageRequest {
    keyword?: string;
    status?: ProductStatus;
    featured?: boolean;
    isPurchased?: boolean;
    categoryId?: string;
    tags?: string[];
    createdAtStart?: string;  // ISO 8601 格式
    createdAtEnd?: string;
    updatedAtStart?: string;
    updatedAtEnd?: string;
    minPrice?: number;
    maxPrice?: number;
}

/**
 * 对应 ProductListResponse.java
 */
export interface ProductListItem {
    id: string;
    name: string;
    slug: string;
    summary: string;
    mainImage: string;
    brand: string;
    price: number;
    originalPrice?: number;
    currency: Currency;
    status: ProductStatus;
    featured: boolean;
    categoryName: string;
    tags: string[];
    viewCount: number;
    clickCount: number;
    favoriteCount: number;
    createdAt: string;
    hasDiscount: boolean;
    discountPercentage: number;
    isPurchased?: boolean;
    wearCount?: number;
}

/**
 * 对应 ProductDetailResponse.java
 */
export interface ProductDetail {
    id: string;
    name: string;
    slug: string;
    summary: string;
    description: string;
    renderedDescription: string;
    mainImage: string;
    images: string[];
    brand: string;
    model: string;
    price: number;
    originalPrice?: number;
    currency: Currency;
    status: ProductStatus;
    featured: boolean;
    category?: { id: string; name: string };
    tags: string[];
    purchaseUrl: string;
    affiliateUrl: string;
    sourcePlatform: string;
    viewCount: number;
    clickCount: number;
    favoriteCount: number;
    shareCount: number;
    createdAt: string;
    updatedAt: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    specifications: string;
    attributes: string;
    notes: string;
    hasDiscount: boolean;
    discountAmount: number;
    discountPercentage: number;
}

/**
 * 对应 ProductCreateRequest.java
 */
export interface ProductCreateRequest {
    name: string;
    slug?: string;
    summary?: string;
    description?: string;
    mainImage?: string;
    images?: string[];
    brand?: string;
    model?: string;
    price: number;
    originalPrice?: number;
    currency?: Currency;
    categoryId?: string;
    tags?: string[];
    purchaseUrl?: string;
    affiliateUrl?: string;
    sourcePlatform?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    notes?: string;
}

/**
 * 对应 ProductUpdateRequest.java
 */
export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
    status?: ProductStatus;
    featured?: boolean;
}

/**
 * 对应 ProductSnapshotResponse.java
 */
export interface ProductSnapshotResponse {
    id: string;
    productId: string;
    name: string;
    versionNumber: number;
    snapshotDescription: string;
    createdById: string;
    createdByName: string;
    createdAt: string;
    snapshotType: SnapshotType;
    // ... other snapshot fields
}


// --- 商品管理 API (对应 AdminProductController) ---

/**
 * 获取后台商品列表（支持高级筛选）
 */
export const getAdminProducts = (params: ProductFilterParams): Promise<ApiResponse<PageResponse<ProductListItem>>> => {
    return api.get('/admin/products', { params });
};

/**
 * 获取单个商品详情
 */
export const getAdminProduct = (id: string): Promise<ApiResponse<ProductDetail>> => {
    return api.get(`/admin/products/${id}`);
}

/**
 * 创建新商品
 */
export const createProduct = (data: ProductCreateRequest): Promise<ApiResponse<ProductDetail>> => {
    return api.post('/admin/products', data);
};

/**
 * 更新商品
 */
export const updateProduct = (productId: string, data: ProductUpdateRequest): Promise<ApiResponse<ProductDetail>> => {
    return api.put(`/admin/products/${productId}`, data);
};

/**
 * 更新商品状态
 */
export const updateProductStatus = (productId: string, status: ProductStatus): Promise<ApiResponse<ProductDetail>> => {
    return api.patch(`/admin/products/${productId}/status`, null, { params: { status } });
};

/**
 * 切换商品的精选状态
 */
export const toggleFeaturedProduct = (productId: string): Promise<ApiResponse<ProductDetail>> => {
    return api.patch(`/admin/products/${productId}/featured`);
};

/**
 * 发送删除商品的验证码
 */
export const sendDeleteProductCode = (productId: string): Promise<ApiResponse<string>> => {
    return api.post(`/admin/products/${productId}/send-delete-code`);
};

/**
 * 删除商品
 */
export const deleteProduct = (productId: string, verificationCode: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/products/${productId}`, { data: { verificationCode } });
};