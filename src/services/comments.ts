// src/services/comments.ts
import api from './api';
import type { Comment, CommentCreateRequest, CommentStatus } from '@/types/comment';
import type { ApiResponse, PageResponse } from '@/types/api';

// === 已有方法 ===
export const getArticleComments = async (articleId: string): Promise<ApiResponse<Comment[]>> => {
    return api.get(`/public/comments/article/${articleId}`);
};

export const createComment = async (
    articleId: string,
    data: CommentCreateRequest
): Promise<ApiResponse<Comment>> => {
    return api.post(`/public/comments/article/${articleId}`, data);
};


// === 新增部分 ===

// 定义用户个人评论的数据结构，与后端 CommentByUserResponse 对应
export interface UserComment {
    id: string;
    content: string;
    articleId: string;
    articleTitle: string;
    articleSlug: string;
    status: CommentStatus;
    createdAt: string;
}

// 定义分页请求参数
export interface GetUserCommentsParams {
    page?: number;
    size?: number;
    sort?: string;
}

/**
 * 获取当前登录用户的评论列表（分页）
 * @param params 分页参数
 */
export const getUserComments = async (
    params: GetUserCommentsParams
): Promise<ApiResponse<PageResponse<UserComment>>> => {
    // 调用我们为用户功能创建的新后端接口
    return api.get('/user/comments', { params });
};