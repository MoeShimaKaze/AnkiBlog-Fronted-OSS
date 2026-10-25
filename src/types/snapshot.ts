// src/types/snapshot.ts
import { BaseEntity } from './api';

export type SnapshotType = 'AUTO' | 'MANUAL' | 'DRAFT_SAVE' | 'STATUS_CHANGE';

export interface BaseSnapshot extends BaseEntity {
    versionNumber: number;
    snapshotType: SnapshotType;
    description?: string;
    createdById: string;
    createdByName: string;
}

export interface ArticleSnapshot extends BaseSnapshot {
    articleId: string;
    title: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    status: string;
    visibility: string;
    featured?: boolean;
    pinned?: boolean;
    commentsEnabled?: boolean;
    tags?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
}

export interface ProductSnapshot extends BaseSnapshot {
    productId: string;
    name: string;
    slug?: string;
    summary?: string;
    description?: string;
    renderedDescription?: string;
    mainImage?: string;
    images?: string[];
    brand?: string;
    model?: string;
    price?: number;
    originalPrice?: number;
    currency?: string;
    status: string;
    featured?: boolean;
    categoryId?: string;
    tags?: string;
    purchaseUrl?: string;
    affiliateUrl?: string;
    sourcePlatform?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    specifications?: string;
    attributes?: string;
    notes?: string;
    snapshotDescription?: string;
}

export interface SnapshotCreateRequest {
    description?: string;
}

export interface SnapshotListParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
}

export const SnapshotTypeLabels: Record<SnapshotType, string> = {
    AUTO: '自动快照',
    MANUAL: '手动快照',
    DRAFT_SAVE: '草稿保存',
    STATUS_CHANGE: '状态变更'
};

export const SnapshotTypeColors: Record<SnapshotType, string> = {
    AUTO: 'blue',
    MANUAL: 'green',
    DRAFT_SAVE: 'orange',
    STATUS_CHANGE: 'purple'
};