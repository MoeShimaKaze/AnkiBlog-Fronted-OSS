// src/types/article.ts
import { BaseEntity } from './api';
import { ArticleVisibility, ArticleStatus } from '@/constants/article';

export interface ArticleTag {
    id: string;
    name: string;
}

// 与后端 ArticleDetailResponse 对齐
export interface Article extends BaseEntity {
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
    tags: ArticleTag[]; // 对象数组，匹配后端 TagResponse
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount?: number;
    readingTime: number; // 匹配后端字段名
    publishedAt: string | null;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
}

// 创建请求类型，tags 为字符串数组
export interface ArticleCreateRequest {
    title: string;
    content: string;
    slug?: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
    visibility?: ArticleVisibility;
    status?: ArticleStatus;
    commentsEnabled?: boolean;
    featured?: boolean;
    pinned?: boolean;
}

export interface ArticleUpdateRequest extends Partial<ArticleCreateRequest> {
    status?: ArticleStatus;
    featured?: boolean;
    pinned?: boolean;
}