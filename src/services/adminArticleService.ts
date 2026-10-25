import api from './api';
import type { ApiResponse, PageResponse, PageRequest } from '@/types/api';
import type { ArticleStatus, ArticleVisibility } from '@/constants/article';
import type { ArticleTag } from '@/types/article';

// 匹配后端 ArticleListResponse.java
export interface ArticleListItem {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    status: ArticleStatus;
    visibility: ArticleVisibility;
    featured: boolean;
    pinned: boolean;
    authorName: string;
    tags: string[]; // 后端在列表响应中返回字符串数组
    viewCount: number;
    likeCount: number;
    commentCount: number;
    readingTime: number;
    publishedAt: string | null;
    createdAt: string;
}

// 匹配后端 ArticleDetailResponse.java
export interface ArticleDetail {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    renderedContent?: string;
    coverImage?: string;
    status: ArticleStatus;
    visibility: ArticleVisibility;
    featured: boolean;
    pinned: boolean;
    commentsEnabled: boolean;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    tags: ArticleTag[]; // 详情响应中返回对象数组
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount?: number;
    readingTime: number;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
}

// 匹配后端 ArticleCreateRequest.java
export interface ArticleCreateRequest {
    title: string;
    content: string;
    slug?: string;
    excerpt?: string;
    coverImage?: string;
    useAutoCover?: boolean;
    visibility?: ArticleVisibility;
    status?: ArticleStatus;
    featured?: boolean;
    pinned?: boolean;
    commentsEnabled?: boolean;
    tags?: string[];
    scheduledAt?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
}

// 匹配后端 ArticleUpdateRequest.java
export interface ArticleUpdateRequest {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    useAutoCover?: boolean;
    status?: ArticleStatus;
    visibility?: ArticleVisibility;
    featured?: boolean;
    pinned?: boolean;
    commentsEnabled?: boolean;
    tags?: string[];
    scheduledAt?: string | null;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
}

export interface ArticleSnapshot {
    id: string;
    articleId: string;
    version: number;
    content: string;
    description: string;
    createdAt: string;
    creatorId: string;
    isDraft: boolean;
}

// API 服务函数
export const getAdminArticles = (params: PageRequest & { keyword?: string }): Promise<ApiResponse<PageResponse<ArticleListItem>>> => {
    return api.get('/admin/articles', { params });
};

export const createArticle = (data: ArticleCreateRequest): Promise<ApiResponse<ArticleDetail>> => {
    return api.post('/admin/articles', data);
};

export const updateArticle = (articleId: string, data: ArticleUpdateRequest): Promise<ApiResponse<ArticleDetail>> => {
    return api.put(`/admin/articles/${articleId}`, data);
};

export const getArticleById = (articleId: string): Promise<ApiResponse<ArticleDetail>> => {
    return api.get(`/admin/articles/${articleId}`);
};

export const sendDeleteArticleCode = (articleId: string): Promise<ApiResponse<string>> => {
    return api.post(`/admin/articles/${articleId}/send-delete-code`);
};

export const deleteArticle = (articleId: string, verificationCode: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/articles/${articleId}`, { data: { verificationCode } });
};

export const publishArticle = (articleId: string): Promise<ApiResponse<ArticleDetail>> => {
    return api.post(`/admin/articles/${articleId}/publish`);
};

export const unpublishArticle = (articleId: string): Promise<ApiResponse<ArticleDetail>> => {
    return api.post(`/admin/articles/${articleId}/unpublish`);
};

export const getArticleSnapshots = (articleId: string, params: PageRequest): Promise<ApiResponse<PageResponse<ArticleSnapshot>>> => {
    return api.get(`/admin/articles/${articleId}/snapshots`, { params });
};

export const createManualSnapshot = (articleId: string, description: string): Promise<ApiResponse<ArticleSnapshot>> => {
    return api.post(`/admin/articles/${articleId}/snapshots`, { description });
};

export const restoreFromSnapshot = (articleId: string, versionNumber: number): Promise<ApiResponse<ArticleDetail>> => {
    return api.post(`/admin/articles/${articleId}/snapshots/restore/${versionNumber}`);
};