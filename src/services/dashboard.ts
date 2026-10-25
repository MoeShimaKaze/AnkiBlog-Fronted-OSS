// src/services/dashboard.ts
import api from './api';
import { ApiResponse } from '@/types/api';
import { ArticleStatus } from '@/constants/article';

// 对应 RecentArticleResponse.java
export interface RecentArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    status: ArticleStatus;
    viewCount: number;
    commentCount: number;
    likeCount: number;
    publishedAt: string; // ISO 8601 格式的日期字符串
    createdAt: string;
}

// 对应 RecentCommentResponse.java
export interface RecentComment {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    articleId: string;
    articleTitle: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approved: boolean;
    createdAt: string;
}

// 对应 RecentUserResponse.java
export interface RecentUser {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    role: 'USER' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt: string;
}

// 对应 PopularArticleResponse.java
export interface PopularArticle {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    viewCount: number;
    commentCount: number;
    likeCount: number;
    popularityScore: number;
    publishedAt: string;
}

// 对应 PopularProductResponse.java
export interface PopularProduct {
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    brand: string;
    price: number;
    currency: string;
    viewCount: number;
    clickCount: number;
    favoriteCount: number;
    popularityScore: number;
    createdAt: string;
}

// 对应 UserActivityResponse.java
export interface UserActivity {
    id: string;
    type: 'COMMENT' | 'LIKE' | 'FAVORITE' | 'VIEW';
    description: string;
    targetId: string;
    targetTitle: string;
    targetType: 'ARTICLE' | 'PRODUCT' | 'COMMENT';
    createdAt: string;
}

// 对应 RecommendedArticleResponse.java
export interface RecommendedArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    tags: string[];
    viewCount: number;
    likeCount: number;
    readingTime: number;
    publishedAt: string;
    recommendReason: string;
}

// 对应 RecommendedProductResponse.java
export interface RecommendedProduct {
    id: string;
    name: string;
    slug: string;
    summary: string;
    mainImage: string;
    brand: string;
    price: number;
    originalPrice?: number;
    currency: string;
    hasDiscount: boolean;
    discountPercentage?: number;
    categoryName?: string;
    viewCount: number;
    favoriteCount: number;
    createdAt: string;
    recommendReason: string;
}

// 对应 UserDashboardResponse.java
export interface UserDashboardData {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    email: string;
    lastLoginAt?: string;
    joinedAt: string;
    myCommentsCount: number;
    likedArticlesCount: number;
    favoriteProductsCount: number;
    totalReadingTime: number;
    recentActivities: UserActivity[];
    recommendedArticles: RecommendedArticle[];
    recommendedProducts: RecommendedProduct[];
}

// 对应 DashboardOverviewResponse.java
export interface DashboardOverviewData {
    totalArticles: number;
    totalProducts: number;
    totalUsers: number;
    totalComments: number;
    totalViews: number;
    todayViews: number;
    activeUsers: number;
    pendingComments: number;
    recentArticles: RecentArticle[];
    recentComments: RecentComment[];
    recentUsers: RecentUser[];
    popularArticles: PopularArticle[];
    popularProducts: PopularProduct[];
}

/**
 * 获取用户个人看板数据
 */
export const getUserDashboard = (): Promise<ApiResponse<UserDashboardData>> =>
    api.get('/dashboard/user');

/**
 * 获取指定用户的看板数据（管理员功能）
 */
export const getUserDashboardById = (userId: string): Promise<ApiResponse<UserDashboardData>> =>
    api.get(`/dashboard/user/${userId}`);

/**
 * 获取管理员总览看板
 */
export const getOverviewDashboard = (): Promise<ApiResponse<DashboardOverviewData>> =>
    api.get('/dashboard/overview');

/**
 * 获取网站整体统计数据
 */
export const getSiteStats = (): Promise<ApiResponse<Record<string, any>>> =>
    api.get('/dashboard/stats/site');

/**
 * 获取内容统计数据
 */
export const getContentStats = (): Promise<ApiResponse<Record<string, any>>> =>
    api.get('/dashboard/stats/content');

/**
 * 获取用户统计数据
 */
export const getUserStats = (): Promise<ApiResponse<Record<string, any>>> =>
    api.get('/dashboard/stats/users');

/**
 * 获取趋势统计数据
 */
export const getTrendStats = (days: number = 30): Promise<ApiResponse<Record<string, any>>> =>
    api.get('/dashboard/stats/trends', { params: { days } });

/**
 * 手动刷新看板缓存
 */
export const refreshDashboardCache = (): Promise<ApiResponse<string>> =>
    api.post('/dashboard/cache/refresh');

/**
 * 清除指定用户的缓存
 */
export const clearUserCache = (userId: string): Promise<ApiResponse<string>> =>
    api.delete(`/dashboard/cache/user/${userId}`);

/**
 * 检查缓存健康状态
 */
export const checkCacheHealth = (): Promise<ApiResponse<Record<string, any>>> =>
    api.get('/dashboard/cache/health');