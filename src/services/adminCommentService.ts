// src/services/adminCommentService.ts (已更正)
import api from './api';
// 修正：将 PagedResponse 修改为 PageResponse
import type { ApiResponse, PageResponse } from '@/types/api';

// 评论状态的枚举，与后端 Comment.CommentStatus 对应
export enum CommentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SPAM = 'SPAM',
    DELETED = 'DELETED',
}

// 后台评论列表项的类型
export interface CommentAdminListItem {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    articleId: string;
    articleTitle: string;
    articleSlug: string;
    status: CommentStatus;
    ipAddress: string;
    userAgent: string;
    likeCount: number;
    replyCount: number;
    createdAt: string;
    reviewerName?: string;
    reviewedAt?: string;
}

// 获取评论列表的请求参数
export interface GetAdminCommentsParams {
    page?: number;
    size?: number;
    sort?: string;
    status?: CommentStatus;
    keyword?: string;
}

/**
 * 获取后台评论列表（分页）
 */
export const getAdminComments = async (
    params: GetAdminCommentsParams
    // 修正：将 PagedResponse 修改为 PageResponse
): Promise<ApiResponse<PageResponse<CommentAdminListItem>>> => {
    return api.get('/admin/comments', { params });
};

/**
 * 批准评论
 */
export const approveComment = async (commentId: string): Promise<ApiResponse<null>> => {
    return api.post(`/admin/comments/${commentId}/approve`);
};

/**
 * 拒绝评论
 */
export const rejectComment = async (commentId: string, reason?: string): Promise<ApiResponse<null>> => {
    return api.post(`/admin/comments/${commentId}/reject`, reason, {
        headers: { 'Content-Type': 'text/plain' }
    });
};

/**
 * 标记为垃圾评论
 */
export const markAsSpam = async (commentId: string): Promise<ApiResponse<null>> => {
    return api.post(`/admin/comments/${commentId}/spam`);
};

/**
 * 软删除评论
 */
export const deleteComment = async (commentId: string): Promise<ApiResponse<null>> => {
    return api.delete(`/admin/comments/${commentId}`);
};