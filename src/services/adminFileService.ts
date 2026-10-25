// src/services/adminFileService.ts - 完整版本
import api from './api';
import type { ApiResponse } from '@/types/api';

export interface Bucket {
    name: string;
    creationDate: string;
}

export interface MinioFile {
    objectName: string;
    size: number;
    lastModified: string;
    etag: string;
    isDir: boolean;
    url?: string | null; // 用于预览的URL，允许为null
    deleteUrl?: string | null; // 用于删除的URL标识，允许为null
}

/**
 * 获取所有存储桶
 */
export const listBuckets = (): Promise<ApiResponse<Bucket[]>> => {
    return api.get('/admin/files/buckets', {
        timeout: 30000 // 30秒超时
    });
};

/**
 * 获取指定存储桶中的文件列表
 */
export const listFiles = (bucketName: string): Promise<ApiResponse<MinioFile[]>> => {
    return api.get('/admin/files/list', {
        params: { bucketName },
        timeout: 45000 // 45秒超时（文件列表可能较大）
    });
};

/**
 * 删除文件 (通过文件的完整URL或路径)
 */
export const deleteFileByUrl = (fileUrl: string): Promise<ApiResponse<null>> => {
    console.log('[删除文件] 通过URL删除:', fileUrl);
    return api.delete('/admin/files/delete', {
        params: { fileUrl },
        timeout: 60000 // 60秒超时
    });
};

/**
 * 直接删除文件 (通过存储桶和对象名称)
 */
export const deleteFileDirect = (bucketName: string, objectName: string): Promise<ApiResponse<null>> => {
    console.log('[删除文件] 直接删除:', { bucketName, objectName });
    return api.delete('/admin/files/delete-direct', {
        params: { bucketName, objectName },
        timeout: 60000 // 60秒超时
    });
};

/**
 * 批量删除文件
 */
export const deleteFilesBatch = (fileUrls: string[]): Promise<ApiResponse<null>> => {
    console.log('[批量删除] 文件数量:', fileUrls.length);
    return api.post('/admin/files/delete-batch', fileUrls, {
        timeout: 120000 // 2分钟超时（批量操作）
    });
};

/**
 * 获取文件的预签名URL
 */
export const getFileUrl = (bucketName: string, objectName: string): Promise<ApiResponse<string>> => {
    return api.get('/admin/files/url', {
        params: { bucketName, objectName },
        timeout: 30000 // 30秒超时
    });
};

/**
 * 上传文件到指定存储桶 (主要方法) - 支持进度回调和延长超时
 * @param bucketName 存储桶名称
 * @param file 要上传的文件
 * @param onProgress 进度回调函数
 * @returns 文件URL
 */
export const uploadFileToBucket = (
    bucketName: string,
    file: File,
    onProgress?: (progressEvent: { loaded: number; total: number; percent: number }) => void
): Promise<ApiResponse<string>> => {
    const formData = new FormData();

    // 关键修改：直接传递存储桶名称作为 type 参数
    formData.append('type', bucketName);
    formData.append('file', file);

    console.log(`[上传文件] 存储桶: ${bucketName}, 文件名: ${file.name}, 大小: ${(file.size / 1024).toFixed(2)}KB`);

    // 根据文件大小动态计算超时时间
    const fileSize = file.size;
    let timeout = 60000; // 默认60秒

    if (fileSize > 50 * 1024 * 1024) { // 大于50MB
        timeout = 600000; // 10分钟
    } else if (fileSize > 10 * 1024 * 1024) { // 大于10MB
        timeout = 300000; // 5分钟
    } else if (fileSize > 1024 * 1024) { // 大于1MB
        timeout = 120000; // 2分钟
    }

    console.log(`[上传配置] 文件大小: ${(fileSize / 1024 / 1024).toFixed(2)}MB, 超时时间: ${timeout / 1000}秒`);

    return api.post('/admin/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: timeout, // 动态超时时间
        // 添加上传进度监听
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`[上传进度] ${file.name}: ${percent}% (${progressEvent.loaded}/${progressEvent.total})`);
                onProgress({
                    loaded: progressEvent.loaded,
                    total: progressEvent.total,
                    percent
                });
            }
        }
    });
};

/**
 * 上传文件到指定存储桶 (使用新的专用接口) - 支持进度回调
 * @param bucketName 存储桶名称
 * @param file 要上传的文件
 * @param onProgress 进度回调函数
 * @returns 文件URL
 */
export const uploadFileToBucketDirect = (
    bucketName: string,
    file: File,
    onProgress?: (progressEvent: { loaded: number; total: number; percent: number }) => void
): Promise<ApiResponse<string>> => {
    const formData = new FormData();

    formData.append('bucket', bucketName);
    formData.append('file', file);

    console.log(`[直接上传] 存储桶: ${bucketName}, 文件名: ${file.name}`);

    // 动态超时时间
    const fileSize = file.size;
    const timeout = Math.max(60000, Math.min(600000, fileSize / 1024 * 2)); // 最少60秒，最多10分钟

    return api.post('/admin/upload/to-bucket', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: timeout,
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`[直接上传进度] ${file.name}: ${percent}%`);
                onProgress({
                    loaded: progressEvent.loaded,
                    total: progressEvent.total,
                    percent
                });
            }
        }
    });
};

/**
 * 上传文件到预定义类型的存储桶
 * @param type 文件类型 (avatar, article, product, document, system, temp, general)
 * @param file 要上传的文件
 * @returns 文件URL
 */
export const uploadFileByType = (type: string, file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();

    formData.append('type', type);
    formData.append('file', file);

    console.log(`[按类型上传] 类型: ${type}, 文件名: ${file.name}`);

    // 动态超时
    const timeout = Math.max(60000, Math.min(300000, file.size / 1024 * 2));

    return api.post('/admin/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: timeout
    });
};

/**
 * 通用文件上传 (使用默认存储桶)
 * @param file 要上传的文件
 * @returns 文件URL
 */
export const uploadFile = (file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', file);

    console.log(`[通用上传] 文件名: ${file.name}`);

    // 动态超时
    const timeout = Math.max(60000, Math.min(300000, file.size / 1024 * 2));

    return api.post('/admin/upload/file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: timeout
    });
};

// ============ 便捷方法 ============

/**
 * 上传头像
 */
export const uploadAvatar = (file: File): Promise<ApiResponse<string>> => {
    return uploadFileByType('avatar', file);
};

/**
 * 上传文章图片
 */
export const uploadArticleImage = (file: File): Promise<ApiResponse<string>> => {
    return uploadFileByType('article', file);
};

/**
 * 上传产品图片
 */
export const uploadProductImage = (file: File): Promise<ApiResponse<string>> => {
    return uploadFileByType('product', file);
};

/**
 * 上传文档
 */
export const uploadDocument = (file: File): Promise<ApiResponse<string>> => {
    return uploadFileByType('document', file);
};

/**
 * 上传系统文件
 */
export const uploadSystemFile = (file: File): Promise<ApiResponse<string>> => {
    return uploadFileByType('system', file);
};