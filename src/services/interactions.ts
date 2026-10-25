// src/services/interactions.ts - 匹配现有后端API
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { Article } from '@/types/article';
import type { Product } from '@/types/product';

export interface UserInteractionResponse {
    liked?: boolean;
    favorited?: boolean;
    likeCount?: number;
    favoriteCount?: number;
    message?: string;
}

// 文章点赞API
export const toggleArticleLike = (articleId: string): Promise<ApiResponse<UserInteractionResponse>> =>
    api.post(`/user/interactions/articles/${articleId}/like`);

export const getArticleLikeStatus = (articleId: string): Promise<ApiResponse<UserInteractionResponse>> =>
    api.get(`/user/interactions/articles/${articleId}/like-status`);

export const getMyLikedArticles = (params?: any): Promise<ApiResponse<PageResponse<Article>>> =>
    api.get('/user/interactions/my-liked-articles', { params });

// 商品收藏API
export const toggleProductFavorite = (productId: string): Promise<ApiResponse<UserInteractionResponse>> =>
    api.post(`/user/interactions/products/${productId}/favorite`);

export const getProductFavoriteStatus = (productId: string): Promise<ApiResponse<UserInteractionResponse>> =>
    api.get(`/user/interactions/products/${productId}/favorite-status`);

export const getMyFavoriteProducts = (params?: any): Promise<ApiResponse<PageResponse<Product>>> =>
    api.get('/user/interactions/my-favorite-products', { params });

// 批量状态检查
export const getBatchArticleLikeStatus = (articleIds: string[]): Promise<ApiResponse<string[]>> =>
    api.post('/user/interactions/articles/batch-like-status', articleIds);

export const getBatchProductFavoriteStatus = (productIds: string[]): Promise<ApiResponse<string[]>> =>
    api.post('/user/interactions/products/batch-favorite-status', productIds);

// 管理员API
export const getAdminUserLikedArticles = (userId: string, params?: any): Promise<ApiResponse<PageResponse<Article>>> =>
    api.get(`/admin/user-interactions/${userId}/liked-articles`, { params });

export const getAdminUserFavoriteProducts = (userId: string, params?: any): Promise<ApiResponse<PageResponse<Product>>> =>
    api.get(`/admin/user-interactions/${userId}/favorite-products`, { params });

export const removeUserArticleLike = (userId: string, articleId: string): Promise<ApiResponse<string>> =>
    api.delete(`/admin/user-interactions/${userId}/liked-articles/${articleId}`);

export const removeUserProductFavorite = (userId: string, productId: string): Promise<ApiResponse<string>> =>
    api.delete(`/admin/user-interactions/${userId}/favorite-products/${productId}`);

export const getUserInteractionStats = (userId: string): Promise<ApiResponse<{
    likedArticlesCount: number;
    favoriteProductsCount: number;
    totalInteractions: number;
}>> =>
    api.get(`/admin/user-interactions/${userId}/stats`);