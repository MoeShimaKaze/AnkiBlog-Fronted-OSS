// src/types/customPage.ts
export interface CustomPageType {
    STATIC: 'STATIC'
    DYNAMIC: 'DYNAMIC'
    PORTFOLIO: 'PORTFOLIO'
    LANDING: 'LANDING'
    REDIRECT: 'REDIRECT'
}

export type PageType = 'STATIC' | 'DYNAMIC' | 'PORTFOLIO' | 'LANDING' | 'REDIRECT'

export interface CustomPage {
    id: string
    title: string
    slug: string
    subtitle?: string
    pageType: PageType
    content?: string
    customCss?: string
    customJs?: string
    template: string
    published: boolean
    featured: boolean
    showInMenu: boolean
    menuTitle?: string
    menuOrder: number
    sortOrder: number
    commentsEnabled: boolean
    accessLevel: string
    redirectUrl?: string
    redirectType?: number
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string
    ogImage?: string
    pageIcon?: string
    viewCount: number
    shareCount: number
    lastViewedAt?: string
    contentVersion: number
    publishedAt?: string
    lastEditedAt?: string
    pageConfig?: string
    customFields?: string
    createdAt: string
    updatedAt: string

    // 计算属性
    fullPath: string
    effectiveMenuTitle: string
    effectiveSeoTitle: string
    effectiveSeoDescription: string
    hasCustomCode: boolean
    popular: boolean
    popularityScore: number
    needsSecurityReview: boolean
    summary: string
    validRedirect: boolean
}

export interface CustomPageCreateRequest {
    title: string
    slug: string
    subtitle?: string
    pageType: PageType
    content?: string
    customCss?: string
    customJs?: string
    template?: string
    published?: boolean
    featured?: boolean
    showInMenu?: boolean
    menuTitle?: string
    menuOrder?: number
    sortOrder?: number
    commentsEnabled?: boolean
    accessLevel?: string
    redirectUrl?: string
    redirectType?: number
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string
    ogImage?: string
    pageIcon?: string
    pageConfig?: string
    customFields?: string
}

export interface CustomPageUpdateRequest {
    title?: string
    slug?: string
    subtitle?: string
    pageType?: PageType
    content?: string
    customCss?: string
    customJs?: string
    template?: string
    published?: boolean
    featured?: boolean
    showInMenu?: boolean
    menuTitle?: string
    menuOrder?: number
    sortOrder?: number
    commentsEnabled?: boolean
    accessLevel?: string
    redirectUrl?: string
    redirectType?: number
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string
    ogImage?: string
    pageIcon?: string
    pageConfig?: string
    customFields?: string
}