/**
 * 化妆品模块相关类型定义
 */

// ==================== 使用类型 ====================

/**
 * 化妆品使用类型
 */
export interface MakeupUsageType {
    id: string;
    name: string;
    sortOrder: number;
    icon?: string;
    color?: string;
    createdAt: string;
    usageCount?: number;
}

/**
 * 创建/更新使用类型请求
 */
export interface MakeupUsageTypeRequest {
    name: string;
    sortOrder?: number;
    icon?: string;
    color?: string;
}

/**
 * 排序更新请求
 */
export interface UsageTypeSortRequest {
    sortOrders?: Record<string, number>;
    orderedIds?: string[];
}

// ==================== 模块设置 ====================

/**
 * 化妆品模块设置
 */
export interface MakeupSettings {
    id: string;
    categoryIds: string[];
    idleThresholdDays: number;
    expiryReminderEnabled: boolean;
    expiryReminderDays: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * 更新设置请求
 */
export interface MakeupSettingsRequest {
    categoryIds?: string[];
    idleThresholdDays?: number;
    expiryReminderEnabled?: boolean;
    expiryReminderDays?: number;
}

// ==================== 购买记录 ====================

/**
 * 购买记录
 */
export interface PurchaseRecord {
    id: string;
    productId: string;
    productName?: string;
    productMainImage?: string;
    brand?: string;
    purchaseDate: string;
    quantity: number;
    price?: number;
    colorCode?: string;
    purchaseChannel?: string;
    note?: string;
    totalPrice?: number;
    createdAt: string;
}

/**
 * 创建购买记录请求
 */
export interface PurchaseRecordRequest {
    productId: string;
    purchaseDate?: string;
    quantity?: number;
    price?: number;
    colorCode?: string;
    purchaseChannel?: string;
    note?: string;
}

/**
 * 购买统计
 */
export interface PurchaseStats {
    totalPurchaseCount: number;
    monthlyPurchaseCount: number;
    totalAmount: number;
    monthlyAmount: number;
    uniqueProductCount: number;
}

// ==================== 化妆记录 ====================

/**
 * 化妆品物品
 */
export interface MakeupItem {
    productId: string;
    productSlug?: string;
    productName: string;
    productMainImage?: string;
    brand?: string;
    usageTypeId?: string;
    usageTypeName?: string;
    usageTypeColor?: string;
}

/**
 * 化妆日志
 */
export interface MakeupLog {
    id: string;
    makeupDate: string;
    lookName?: string;
    referenceUrl?: string;
    makeupImage?: string;
    note?: string;
    items: MakeupItem[];
    createdAt: string;
}

/**
 * 创建化妆记录请求
 */
export interface MakeupCreateRequest {
    makeupDate?: string;
    lookName?: string;
    referenceUrl?: string;
    productIds: string[];
    usageTypes?: Record<string, string>;
    makeupImage?: string;
    note?: string;
}

/**
 * 化妆统计
 */
export interface MakeupStats {
    totalMakeupCount: number;
    monthlyMakeupCount: number;
    uniqueProductCount: number;
    averageItemsPerMakeup: number;
    referenceUrlCount: number;
}

/**
 * 化妆日历数据
 */
export interface MakeupCalendarData {
    date: string;
    count: number;
    makeups: MakeupSummary[];
}

/**
 * 化妆记录摘要
 */
export interface MakeupSummary {
    id: string;
    lookName?: string;
    makeupImage?: string;
    firstProductImage?: string;
    itemCount: number;
}

// ==================== 化妆品管理 ====================

/**
 * 化妆品概览统计
 */
export interface CosmeticOverview {
    totalCount: number;
    purchasedCount: number;
    totalValue: number;
    totalUseCount: number;
    idleCount: number;
    monthlyPurchaseCount: number;
    monthlyPurchaseAmount: number;
    monthlyMakeupCount: number;
}

/**
 * 风格统计
 */
export interface StyleStat {
    name: string;
    count: number;
    percentage?: number;
}

/**
 * 化妆品筛选参数
 */
export interface CosmeticFilterParams {
    page?: number;
    size?: number;
    categoryIds?: string[];
    onlyPurchased?: boolean;
    useDefaultSettings?: boolean;
    days?: number;
}
