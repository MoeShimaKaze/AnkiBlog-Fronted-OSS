import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { Article, ArticleCreateRequest, ArticleUpdateRequest } from '@/types/article';

// 公共文章接口
export const getArticles = (params: any): Promise<ApiResponse<PageResponse<Article>>> => {
    // 处理排序数组参数
    if (params._sortArray && Array.isArray(params._sortArray)) {
        // 手动构建查询字符串
        const queryParts: string[] = [];

        // 添加非排序参数
        Object.keys(params).forEach(key => {
            if (key !== '_sortArray' && params[key] !== undefined && params[key] !== null) {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
            }
        });

        // 添加多个sort参数
        params._sortArray.forEach((sortValue: string) => {
            queryParts.push(`sort=${encodeURIComponent(sortValue)}`);
        });

        const queryString = queryParts.join('&');
        return api.get(`/public/articles?${queryString}`);
    }

    return api.get('/public/articles', { params });
};

export const getArticleBySlug = (slug: string): Promise<ApiResponse<Article>> =>
    api.get(`/public/articles/${slug}`);

// 管理员文章接口
export const getArticleById = (id: string): Promise<ApiResponse<Article>> =>
    api.get(`/admin/articles/${id}`);

export const createArticle = (data: ArticleCreateRequest): Promise<ApiResponse<Article>> =>
    api.post('/admin/articles', data);

export const updateArticle = (id: string, data: ArticleUpdateRequest): Promise<ApiResponse<Article>> =>
    api.put(`/admin/articles/${id}`, data);