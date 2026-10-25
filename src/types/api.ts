// src/types/api.ts
export interface BaseEntity {
    id: string
    createdAt: string
    updatedAt: string
}

export interface ApiResponse<T = any> {
    success: boolean
    message: string
    data: T
    errorCode: string | null
    timestamp: string
}

export interface PageRequest {
    page?: number
    size?: number
    sort?: string
    direction?: 'ASC' | 'DESC'
}

export interface PageResponse<T = any> {
    content: T[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    hasNext: boolean
    hasPrevious: boolean
}

export interface SearchRequest extends PageRequest {
    keyword?: string
    type?: 'ALL' | 'ARTICLE' | 'PRODUCT'
}

// 文章相关类型
export interface Article extends BaseEntity {
    title: string
    content: string
    summary: string
    slug: string
    coverImage?: string
    tags: string[]
    publishedAt: string
    readTime: number
    viewCount: number
    isPublished: boolean
    visibility: ArticleVisibility
    author: {
        id: string
        displayName: string
        avatarUrl?: string
    }
}

export type ArticleVisibility = 'PUBLIC' | 'LOGIN_REQUIRED' | 'ADMIN_ONLY'

// 商品相关类型
export interface Product extends BaseEntity {
    title: string
    description: string
    price: number
    originalPrice?: number
    coverImage: string
    images: string[]
    slug: string
    category: string
    status: ProductStatus
    isFeatured: boolean
    isHot: boolean
    isNew: boolean
    clickCount: number
    externalUrl: string
    tags: string[]
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT'

// 用户相关类型
export interface User extends BaseEntity {
    email: string
    displayName: string
    role: UserRole
    avatarUrl?: string
    isApproved: boolean
    bio?: string
    website?: string
    lastLoginAt?: string
}

export type UserRole = 'ADMIN' | 'USER' | 'GUEST'