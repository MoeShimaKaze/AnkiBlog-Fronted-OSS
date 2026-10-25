// src/utils/uploadUtils.ts - 上传工具函数
import { message } from 'antd';

export interface FileWithPreview extends File {
    uid: string;
    preview?: string;
    cropped?: boolean;
}

export interface UploadProgress {
    fileName: string;
    percent: number;
    loaded: number;
    total: number;
}

export interface UploadResult {
    success: boolean;
    urls: string[];
    errors: string[];
}

/**
 * 批量上传文件的工具函数
 * @param files 待上传的文件列表
 * @param uploadFn 单个文件上传函数
 * @param onProgress 进度回调
 * @returns 上传结果
 */
export const batchUploadFiles = async (
    files: FileWithPreview[],
    uploadFn: (file: File, type: string, options?: any) => Promise<string>,
    onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
    if (files.length === 0) {
        return { success: true, urls: [], errors: [] };
    }

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
            // 更新进度
            onProgress?.({
                fileName: file.name,
                percent: (i / files.length) * 100,
                loaded: i,
                total: files.length
            });

            const url = await uploadFn(file, 'image', {
                onProgress: (percent: number) => {
                    const baseProgress = (i / files.length) * 100;
                    const currentFileProgress = (percent / 100) * (100 / files.length);
                    onProgress?.({
                        fileName: file.name,
                        percent: baseProgress + currentFileProgress,
                        loaded: i,
                        total: files.length
                    });
                }
            });

            if (url) {
                uploadedUrls.push(url);
                message.success(`${file.name} 上传成功`);
            } else {
                throw new Error('上传失败，未返回URL');
            }
        } catch (error: any) {
            const errorMsg = `${file.name} 上传失败: ${error.message}`;
            errors.push(errorMsg);
            message.error(errorMsg);

            // 如果是关键错误，停止后续上传
            if (error.code === 'NETWORK_ERROR' || error.status >= 500) {
                break;
            }
        }
    }

    // 最终进度
    onProgress?.({
        fileName: '',
        percent: 100,
        loaded: files.length,
        total: files.length
    });

    return {
        success: errors.length === 0,
        urls: uploadedUrls,
        errors
    };
};

/**
 * 清理文件预览URLs
 * @param files 文件列表
 */
export const cleanupPreviewUrls = (files: FileWithPreview[]): void => {
    files.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
            URL.revokeObjectURL(file.preview);
        }
    });
};

/**
 * 创建文件预览URL
 * @param file 文件对象
 * @returns 预览URL
 */
export const createPreviewUrl = (file: File): string => {
    const fileWithPreview = file as FileWithPreview;
    if (fileWithPreview.preview) {
        return fileWithPreview.preview;
    }

    const url = URL.createObjectURL(file);
    fileWithPreview.preview = url;
    return url;
};

/**
 * 验证上传文件
 * @param files 文件列表
 * @param maxCount 最大数量
 * @param maxSize 最大文件大小（字节）
 * @returns 验证结果
 */
export const validateUploadFiles = (
    files: File[],
    maxCount: number = 10,
    maxSize: number = 10 * 1024 * 1024 // 10MB
): { valid: boolean; message?: string } => {
    if (files.length === 0) {
        return { valid: false, message: '请选择要上传的文件' };
    }

    if (files.length > maxCount) {
        return { valid: false, message: `最多只能上传${maxCount}个文件` };
    }

    for (const file of files) {
        if (file.size > maxSize) {
            const sizeMB = (maxSize / 1024 / 1024).toFixed(1);
            return {
                valid: false,
                message: `文件 "${file.name}" 超过大小限制（${sizeMB}MB）`
            };
        }
    }

    return { valid: true };
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化的大小字符串
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * 生成唯一的文件ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export const generateFileId = (prefix: string = 'file'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 检查文件是否为图片
 * @param file 文件对象或文件名
 * @returns 是否为图片
 */
export const isImageFile = (file: File | string): boolean => {
    if (typeof file === 'string') {
        return /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(file);
    }
    return file.type.startsWith('image/');
};

/**
 * 上传状态管理器
 */
export class UploadStateManager {
    private files: FileWithPreview[] = [];
    private existingUrls: string[] = [];
    private onChangeCallback?: (files: FileWithPreview[], urls: string[]) => void;

    constructor(
        initialUrls: string[] = [],
        onChange?: (files: FileWithPreview[], urls: string[]) => void
    ) {
        this.existingUrls = [...initialUrls];
        this.onChangeCallback = onChange;
    }

    addFiles(newFiles: FileWithPreview[]): void {
        this.files = [...this.files, ...newFiles];
        this.triggerChange();
    }

    removeFile(fileId: string): void {
        const file = this.files.find(f => f.uid === fileId);
        if (file?.preview) {
            URL.revokeObjectURL(file.preview);
        }
        this.files = this.files.filter(f => f.uid !== fileId);
        this.triggerChange();
    }

    removeUrl(url: string): void {
        this.existingUrls = this.existingUrls.filter(u => u !== url);
        this.triggerChange();
    }

    reorderItems(sourceIndex: number, destinationIndex: number): void {
        const allItems = [...this.existingUrls, ...this.files];
        const [removed] = allItems.splice(sourceIndex, 1);
        allItems.splice(destinationIndex, 0, removed);

        // 重新分离URLs和文件
        this.existingUrls = [];
        this.files = [];

        allItems.forEach(item => {
            if (typeof item === 'string') {
                this.existingUrls.push(item);
            } else {
                this.files.push(item);
            }
        });

        this.triggerChange();
    }

    clearPendingFiles(): void {
        // 清理预览URLs
        cleanupPreviewUrls(this.files);
        this.files = [];
        this.triggerChange();
    }

    getAllItems(): Array<{ type: 'url' | 'file'; data: string | FileWithPreview }> {
        const items: Array<{ type: 'url' | 'file'; data: string | FileWithPreview }> = [];

        this.existingUrls.forEach(url => {
            items.push({ type: 'url', data: url });
        });

        this.files.forEach(file => {
            items.push({ type: 'file', data: file });
        });

        return items;
    }

    getPendingFiles(): FileWithPreview[] {
        return [...this.files];
    }

    getExistingUrls(): string[] {
        return [...this.existingUrls];
    }

    private triggerChange(): void {
        this.onChangeCallback?.(this.files, this.existingUrls);
    }
}

export default {
    batchUploadFiles,
    cleanupPreviewUrls,
    createPreviewUrl,
    validateUploadFiles,
    formatFileSize,
    generateFileId,
    isImageFile,
    UploadStateManager
};