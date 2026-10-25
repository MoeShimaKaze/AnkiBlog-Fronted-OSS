// src/services/snapshotService.ts
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
    ArticleSnapshot,
    ProductSnapshot,
    SnapshotCreateRequest,
    SnapshotListParams
} from '@/types/snapshot';

// 文章快照服务
export const articleSnapshotService = {
    // 获取文章快照列表
    getSnapshots: (articleId: string, params?: SnapshotListParams): Promise<ApiResponse<PageResponse<ArticleSnapshot>>> => {
        return api.get(`/admin/articles/${articleId}/snapshots`, { params });
    },

    // 创建手动快照
    createSnapshot: (articleId: string, data: SnapshotCreateRequest): Promise<ApiResponse<ArticleSnapshot>> => {
        return api.post(`/admin/articles/${articleId}/snapshots`, data);
    },

    // 获取特定版本快照
    getSnapshot: (articleId: string, versionNumber: number): Promise<ApiResponse<ArticleSnapshot>> => {
        return api.get(`/admin/articles/${articleId}/snapshots/${versionNumber}`);
    },

    // 删除快照
    deleteSnapshot: (articleId: string, snapshotId: string): Promise<ApiResponse<string>> => {
        return api.delete(`/admin/articles/${articleId}/snapshots/${snapshotId}`);
    },

    // 获取草稿快照
    getDraftSnapshots: (articleId: string): Promise<ApiResponse<ArticleSnapshot[]>> => {
        return api.get(`/admin/articles/${articleId}/snapshots/drafts`);
    }
};

// 商品快照服务
export const productSnapshotService = {
    // 获取商品快照列表
    getSnapshots: (productId: string, params?: SnapshotListParams): Promise<ApiResponse<PageResponse<ProductSnapshot>>> => {
        return api.get(`/admin/products/${productId}/snapshots`, { params });
    },

    // 创建手动快照
    createSnapshot: (productId: string, data: SnapshotCreateRequest): Promise<ApiResponse<ProductSnapshot>> => {
        return api.post(`/admin/products/${productId}/snapshots`, data);
    },

    // 获取特定版本快照
    getSnapshot: (productId: string, versionNumber: number): Promise<ApiResponse<ProductSnapshot>> => {
        return api.get(`/admin/products/${productId}/snapshots/${versionNumber}`);
    },

    // 删除快照
    deleteSnapshot: (productId: string, snapshotId: string): Promise<ApiResponse<string>> => {
        return api.delete(`/admin/products/${productId}/snapshots/${snapshotId}`);
    },

    // 获取草稿快照
    getDraftSnapshots: (productId: string): Promise<ApiResponse<ProductSnapshot[]>> => {
        return api.get(`/admin/products/${productId}/snapshots/drafts`);
    }
};