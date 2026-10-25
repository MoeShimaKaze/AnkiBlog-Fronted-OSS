// src/hooks/api/useUpload.ts (修复版本)
import { useState } from 'react';
import { message } from 'antd';
import { config } from '@/config/env';
import api from '@/services/api';
import { ensureImageUploadAllowed } from '@/utils/image';

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

export interface UploadOptions {
    onProgress?: (percent: number) => void;
    onSuccess?: (url: string) => void;
    onError?: (error: Error) => void;
}

export const useUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadFile = async (
        file: File,
        type: 'image' | 'file' = 'file',
        options?: UploadOptions
    ) => {
        if (type === 'image') {
            try {
                const allowed = await ensureImageUploadAllowed(file);
                if (!allowed) {
                    return null;
                }
            } catch (error: any) {
                options?.onError?.(error);
                message.error(error.message);
                return null;
            }
        } else if (file.size > config.uploadMaxSize) {
            const error = new Error(`文件大小不能超过 ${(config.uploadMaxSize / 1024 / 1024).toFixed(1)}MB`);
            options?.onError?.(error);
            message.error(error.message);
            return null;
        }

        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('[上传开始]', { fileName: file.name, type });

            const response = await api.post<ApiResponse<string>>(
                `/admin/upload/${type}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setProgress(percent);
                            options?.onProgress?.(percent);
                        }
                    },
                }
            );

            console.log('[上传响应]', response);

            // 修复：处理拦截器返回的格式
            if (response && typeof response === 'object') {
                if ('success' in response && response.success) {
                    const url = (response as any).data;
                    console.log('[上传成功]', url);
                    options?.onSuccess?.(url);
                    return url;
                } else if (typeof response === 'string') {
                    // 兼容直接返回URL字符串的情况
                    console.log('[上传成功] 直接URL:', response);
                    options?.onSuccess?.(response);
                    return response;
                } else {
                    const errorMsg = (response as any)?.message || '上传失败';
                    console.error('[上传失败]', errorMsg);
                    throw new Error(errorMsg);
                }
            } else {
                throw new Error('响应格式错误');
            }

        } catch (error: any) {
            console.error('[上传异常]', error);

            // 提取更详细的错误信息
            let errorMessage = '上传失败';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            const finalError = new Error(errorMessage);
            options?.onError?.(finalError);
            throw finalError;
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        progress,
        uploadFile,
    };
};
