export const config = {
    apiBaseUrl: (globalThis as any).import?.meta?.env?.VITE_API_BASE_URL || '/api',
    appTitle: (globalThis as any).import?.meta?.env?.VITE_APP_TITLE || '个人博客',
    appDescription: (globalThis as any).import?.meta?.env?.VITE_APP_DESCRIPTION || '一个现代化的个人博客系统',
    uploadMaxSize: Number((globalThis as any).import?.meta?.env?.VITE_UPLOAD_MAX_SIZE) || 10 * 1024 * 1024,
    enableMock: (globalThis as any).import?.meta?.env?.VITE_ENABLE_MOCK === 'true',
    isDevelopment: (globalThis as any).import?.meta?.env?.DEV || false,
    isProduction: (globalThis as any).import?.meta?.env?.PROD || true,
}

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
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
    numberOfElements: number
    empty: boolean
}

export interface SearchRequest extends PageRequest {
    keyword?: string
    type?: 'ALL' | 'ARTICLE' | 'PRODUCT'
}
