import { BaseEntity } from './api';

// 记账类型枚举
export type AccountingType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'REFUND';

// 记账类型显示信息
export const AccountingTypeInfo: Record<AccountingType, { label: string; color: string }> = {
    INCOME: { label: '收入', color: '#52c41a' },
    EXPENSE: { label: '支出', color: '#ff4d4f' },
    TRANSFER: { label: '转账', color: '#1890ff' },
    REFUND: { label: '退款', color: '#faad14' },
};

// 商品选择响应（参考ProductCard）
export interface ProductSelectItem {
    id: string;
    name: string;
    mainImage?: string;
    price?: number;
    originalPrice?: number;
    categoryId?: string;
    categoryName?: string;
    isPurchased?: boolean;
    featured?: boolean;
    tags?: string[];
    viewCount?: number;
    summary?: string;
}

// 记账记录
export interface AccountingRecord extends BaseEntity {
    recordTime: string;
    category: string;
    subCategory?: string;
    type: AccountingType;
    typeDisplayName: string;
    typeColor: string;
    amount: number;
    currency: string;
    formattedAmount: string;
    account1?: string;
    account2?: string;
    remark?: string;
    isReimbursed: boolean;
    fee?: number;
    coupon?: number;
    recorder?: string;
    billMark?: string;
    tags?: string[];
    billImages?: string[];
    linkedBillId?: string;
    linkedProductId?: string;
    linkedProduct?: ProductSelectItem;
}

// 创建/更新记账请求
export interface AccountingRecordRequest {
    recordTime: string;
    category: string;
    subCategory?: string;
    type: AccountingType;
    amount: number;
    currency?: string;
    account1?: string;
    account2?: string;
    remark?: string;
    isReimbursed?: boolean;
    fee?: number;
    coupon?: number;
    recorder?: string;
    billMark?: string;
    tags?: string[];
    billImages?: string[];
    linkedBillId?: string;
    linkedProductId?: string;
}

// CSV导入结果
export interface AccountingImportResult {
    totalCount: number;
    insertedCount: number;
    updatedCount: number;
    skippedCount: number;
    errorCount: number;
    errors: string[];
    warnings: string[];
}

// 统计数据
export interface AccountingStats {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    expenseByCategory: [string, number][];
    incomeByCategory: [string, number][];
}

// 分类树节点
export interface CategoryTreeNode {
    id: string;
    name: string;
    level: number;
    productCount: number;
    children?: CategoryTreeNode[];
}

// 商品筛选请求
export interface ProductSelectRequest {
    categoryId?: string;
    includeChildren?: boolean;
    keyword?: string;
    page?: number;
    size?: number;
}

// 记账筛选参数
export interface AccountingFilterParams {
    category?: string;
    subCategory?: string;
    type?: AccountingType;
    startTime?: string;
    endTime?: string;
    keyword?: string;
    page?: number;
    size?: number;
}
