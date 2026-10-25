// src/services/pageTypeConfig.ts
import api from './api'
import { ApiResponse } from '@/types/api'

export interface PageTypeConfig {
    pageType: string
    displayName: string
    pathPattern: string
    priority: number
    isSystem: boolean
    description?: string
    createdAt?: string
    updatedAt?: string
}

export interface CreatePageTypeRequest {
    pageType: string
    displayName: string
    pathPattern: string
    priority?: number
    description?: string
}

export interface UpdatePageTypeRequest {
    displayName: string
    pathPattern: string
    priority?: number
    description?: string
}

// 获取所有页面类型配置
export const getAllPageTypes = (): Promise<ApiResponse<PageTypeConfig[]>> =>
    api.get('/admin/site/page-types')

// 获取非系统页面类型配置
export const getCustomPageTypes = (): Promise<ApiResponse<PageTypeConfig[]>> =>
    api.get('/admin/site/page-types/custom')

// 获取指定页面类型配置
export const getPageTypeConfig = (pageType: string): Promise<ApiResponse<PageTypeConfig>> =>
    api.get(`/admin/site/page-types/${pageType}`)

// 创建页面类型配置
export const createPageType = (request: CreatePageTypeRequest): Promise<ApiResponse<PageTypeConfig>> =>
    api.post('/admin/site/page-types', request)

// 更新页面类型配置
export const updatePageType = (pageType: string, request: UpdatePageTypeRequest): Promise<ApiResponse<PageTypeConfig>> =>
    api.put(`/admin/site/page-types/${pageType}`, request)

// 删除页面类型配置
export const deletePageType = (pageType: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/site/page-types/${pageType}`)

// 匹配路径获取页面类型
export const matchPageType = (path: string): Promise<ApiResponse<{ pageType: string; config: PageTypeConfig }>> =>
    api.post('/public/site/match-page-type', { path })

// 获取公开的页面类型配置（用于前端路径匹配）
export const getPublicPageTypes = (): Promise<ApiResponse<PageTypeConfig[]>> =>
    api.get('/public/site/page-types')