// src/hooks/api/useAvatarUpload.ts - 修复版本
import { useState } from 'react';
import api from '@/services/api';
import type { ApiResponse } from '@/types/api';

interface UserInfoResponse {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    website?: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    updatedAt: string;
}

export const useAvatarUpload = () => {
    const [uploading, setUploading] = useState(false);

    const uploadAvatar = async (file: File): Promise<UserInfoResponse> => {
        setUploading(true);

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            console.log('[头像上传开始]', { fileName: file.name });

            // 修复：拦截器已返回 response.data，直接接收业务响应
            const response = await api.post(
                '/user/avatar/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            ) as ApiResponse<UserInfoResponse>;

            console.log('[头像上传响应]', response);

            // 处理业务响应
            if (response && response.success) {
                console.log('[头像上传成功]', response.data);
                return response.data;
            } else {
                const errorMsg = response?.message || '头像上传失败';
                console.error('[头像上传失败]', errorMsg);
                throw new Error(errorMsg);
            }

        } catch (error: any) {
            console.error('[头像上传异常]', error);

            // 提取更详细的错误信息
            let errorMessage = '头像上传失败';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        uploadAvatar,
    };
};