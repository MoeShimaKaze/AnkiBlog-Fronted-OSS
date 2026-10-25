import api from './api';
import { ApiResponse, PageResponse } from '@/types/api';
import {
    AccountingRecord,
    AccountingRecordRequest,
    AccountingImportResult,
    AccountingStats,
    AccountingFilterParams,
    ProductSelectItem,
    ProductSelectRequest,
    CategoryTreeNode,
} from '@/types/accounting';

const BASE_URL = '/admin/accounting';

// ==================== 记账管理 ====================

/**
 * 创建记账记录
 */
export const createAccountingRecord = (data: AccountingRecordRequest): Promise<ApiResponse<AccountingRecord>> => {
    return api.post(BASE_URL, data);
};

/**
 * 更新记账记录
 */
export const updateAccountingRecord = (id: string, data: AccountingRecordRequest): Promise<ApiResponse<AccountingRecord>> => {
    return api.put(`${BASE_URL}/${id}`, data);
};

/**
 * 删除记账记录
 */
export const deleteAccountingRecord = (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`${BASE_URL}/${id}`);
};

/**
 * 获取单条记账记录
 */
export const getAccountingRecord = (id: string): Promise<ApiResponse<AccountingRecord>> => {
    return api.get(`${BASE_URL}/${id}`);
};

/**
 * 分页查询记账记录
 */
export const getAccountingRecords = (params: AccountingFilterParams): Promise<ApiResponse<PageResponse<AccountingRecord>>> => {
    return api.get(BASE_URL, { params });
};

/**
 * 获取统计数据
 */
export const getAccountingStats = (startTime: string, endTime: string): Promise<ApiResponse<AccountingStats>> => {
    return api.get(`${BASE_URL}/stats`, { params: { startTime, endTime } });
};

/**
 * 获取所有分类
 */
export const getAccountingCategories = (): Promise<ApiResponse<string[]>> => {
    return api.get(`${BASE_URL}/categories`);
};

/**
 * 获取二级分类
 */
export const getAccountingSubCategories = (category: string): Promise<ApiResponse<string[]>> => {
    return api.get(`${BASE_URL}/sub-categories`, { params: { category } });
};

/**
 * 获取所有账户
 */
export const getAccountingAccounts = (): Promise<ApiResponse<string[]>> => {
    return api.get(`${BASE_URL}/accounts`);
};

// ==================== CSV导入导出 ====================

/**
 * CSV导入
 */
export const importAccountingCsv = (file: File): Promise<ApiResponse<AccountingImportResult>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`${BASE_URL}/import`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * CSV导出
 */
export const exportAccountingCsv = (startTime?: string, endTime?: string): Promise<Blob> => {
    const params: Record<string, string> = {};
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    return api.get(`${BASE_URL}/export`, {
        params,
        responseType: 'blob',
    });
};

/**
 * 下载导入模板
 */
export const downloadImportTemplate = (): Promise<Blob> => {
    return api.get(`${BASE_URL}/import/template`, {
        responseType: 'blob',
    });
};

// ==================== 商品关联选择 ====================

/**
 * 获取商品列表（用于关联选择）
 */
export const getProductsForSelect = (params: ProductSelectRequest): Promise<ApiResponse<PageResponse<ProductSelectItem>>> => {
    return api.get(`${BASE_URL}/products`, { params });
};

/**
 * 获取商品分类树
 */
export const getProductCategoryTree = (): Promise<ApiResponse<CategoryTreeNode[]>> => {
    return api.get(`${BASE_URL}/categories/tree`);
};

// ==================== 工具函数 ====================

/**
 * 下载文件
 */
export const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
