// 1. 友链API服务 - friendLinkService.ts
import api from './api';
import type { ApiResponse } from '@/types/api';

export interface FriendLink {
    id: string;
    siteName: string;
    siteUrl: string;
    description?: string;
    avatarUrl?: string;
    ownerName?: string;
    ownerEmail?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
    sortOrder: number;
    clickCount: number;
    category: string;
    reciprocal: boolean;
    rssUrl?: string;
    adminNote?: string;
    createdAt: string;
    updatedAt: string;
}

export interface FriendLinkCreateRequest {
    siteName: string;
    siteUrl: string;
    description?: string;
    avatarUrl?: string;
    ownerName?: string;
    ownerEmail?: string;
    sortOrder?: number;
    category?: string;
    reciprocal?: boolean;
    rssUrl?: string;
}

export interface FriendLinkUpdateRequest {
    siteName?: string;
    siteUrl?: string;
    description?: string;
    avatarUrl?: string;
    ownerName?: string;
    ownerEmail?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
    sortOrder?: number;
    category?: string;
    reciprocal?: boolean;
    rssUrl?: string;
    adminNote?: string;
}

// 管理员API
export const createFriendLink = (data: FriendLinkCreateRequest): Promise<ApiResponse<FriendLink>> =>
    api.post('/admin/friend-links', data);

export const getAllFriendLinks = (): Promise<ApiResponse<FriendLink[]>> =>
    api.get('/admin/friend-links');

export const updateFriendLink = (id: string, data: FriendLinkUpdateRequest): Promise<ApiResponse<FriendLink>> =>
    api.put(`/admin/friend-links/${id}`, data);

export const approveFriendLink = (id: string): Promise<ApiResponse<void>> =>
    api.post(`/admin/friend-links/${id}/approve`);

export const rejectFriendLink = (id: string): Promise<ApiResponse<void>> =>
    api.post(`/admin/friend-links/${id}/reject`);

export const deleteFriendLink = (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/friend-links/${id}`);

// 公开API
export const getApprovedFriendLinks = (): Promise<ApiResponse<FriendLink[]>> =>
    api.get('/public/friend-links');

export const recordFriendLinkClick = (id: string): Promise<ApiResponse<void>> =>
    api.post(`/public/friend-links/${id}/click`);

export const applyFriendLink = (data: FriendLinkCreateRequest): Promise<ApiResponse<FriendLink>> =>
    api.post('/public/friend-links/apply', data);