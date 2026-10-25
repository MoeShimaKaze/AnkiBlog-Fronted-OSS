/**
 * 穿搭相关类型定义
 */

/**
 * 穿搭物品类型
 */
export type OutfitItemType = 'MAIN' | 'ACCESSORY';

/**
 * 穿搭物品
 */
export interface OutfitItem {
    productId: string;
    productSlug?: string;
    productName: string;
    productMainImage: string;
    brand?: string;
    itemType: OutfitItemType;
}

/**
 * 穿搭日志
 */
export interface OutfitLog {
    id: string;
    outfitDate: string;
    note?: string;
    outfitImage?: string;
    items: OutfitItem[];
    createdAt: string;
}

/**
 * 创建穿搭请求
 */
export interface OutfitCreateRequest {
    outfitDate?: string;
    productIds: string[];
    itemTypes?: Record<string, OutfitItemType>;
    note?: string;
    outfitImage?: string;
}

/**
 * 穿搭统计
 */
export interface OutfitStats {
    totalOutfits: number;
    recentOutfitsCount: number;
    thisMonthOutfits: number;
    uniqueProductsUsed: number;
    avgItemsPerOutfit: number;
}

/**
 * 风格统计
 */
export interface StyleStat {
    style: string;
    count: number;
}

/**
 * 日历数据
 */
export interface CalendarData {
    year: number;
    month: number;
    dailyOutfits: Record<number, OutfitLog[]>;
    totalOutfitsInMonth: number;
}

/**
 * 衣橱概览
 */
export interface WardrobeOverview {
    totalItems: number;
    totalValue: number;
    totalWearCount: number;
    idleItemCount: number;
    totalPurchased: number;
    idleItems: number;
    activeItems: number;
}

// ==================== 今天穿什么功能类型定义 ====================

/**
 * 建议状态
 */
export type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

/**
 * 建议商品项
 */
export interface SuggestionItem {
    productId: string;
    productSlug?: string;
    productName: string;
    productMainImage: string;
    brand?: string;
    categoryId?: string;
    categoryName?: string;
    /** 是否被接受（null/undefined=待决定，true=已接受，false=已放弃） */
    accepted?: boolean | null;
}

/**
 * 每日穿搭建议
 */
export interface DailyOutfitSuggestion {
    id: string;
    suggestionDate: string;
    status: SuggestionStatus;
    statusDisplayName: string;
    isPublic: boolean;
    note?: string;
    outfitLogId?: string;
    items: SuggestionItem[];
    createdAt: string;
    updatedAt: string;
}

/**
 * 公开建议响应（简化版）
 */
export interface DailyOutfitPublicResponse {
    id: string;
    suggestionDate: string;
    status: SuggestionStatus;
    statusDisplayName: string;
    items: {
        productId: string;
        productSlug?: string;
        productName: string;
        productMainImage: string;
        brand?: string;
        /** 是否被接受（null/undefined=待决定，true=已接受，false=已放弃） */
        accepted?: boolean | null;
    }[];
    createdAt: string;
}

/**
 * 生成建议请求
 */
export interface DailyOutfitGenerateRequest {
    suggestionDate?: string;
    categoryIds?: string[];
    itemCount?: number;
    onlyPurchased?: boolean;
    isPublic?: boolean;
    note?: string;
}

/**
 * 接受建议请求
 */
export interface DailyOutfitAcceptRequest {
    /** 选择接受的商品ID列表（可选，不指定则接受全部） */
    selectedProductIds?: string[];
    outfitDate?: string;
    itemTypes?: Record<string, OutfitItemType>;
    note?: string;
    outfitImage?: string;
}
