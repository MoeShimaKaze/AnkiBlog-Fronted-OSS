export interface User {
    id: string
    email: string
    displayName: string
    role: 'ADMIN' | 'USER' | 'GUEST'
    avatarUrl?: string
    isApproved: boolean
    bio?: string
    website?: string
    createdAt: string
    updatedAt: string
}

export interface Article {
    id: string
    title: string
    content: string
    summary: string
    slug: string
    coverImage?: string
    tags: string[]
    publishedAt: string
    updatedAt: string
    readTime: number
    viewCount: number
    isPublished: boolean
    visibility: 'PUBLIC' | 'LOGIN_REQUIRED' | 'ADMIN_ONLY'
    author: User
}

export interface Product {
    id: string
    title: string
    description: string
    price: number
    originalPrice?: number
    coverImage: string
    images: string[]
    slug: string
    category: string
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
    isFeatured: boolean
    isHot: boolean
    isNew: boolean
    clickCount: number
    externalUrl: string
    createdAt: string
    updatedAt: string
}

export interface Comment {
    id: string
    content: string
    author: User
    article: Article
    parentId?: string
    replies?: Comment[]
    isApproved: boolean
    createdAt: string
}

export interface ApiResponse<T = any> {
    success: boolean
    message: string
    data: T
}

export interface PageResponse<T = any> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
}