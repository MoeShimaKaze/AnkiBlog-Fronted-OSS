// src/services/pageTitle.ts - 修复版本
import api from './api'
import { ApiResponse } from '@/types/api'

// 保持向下兼容的静态接口
export interface PageTitleTemplates {
    home: string
    articles: string
    articleDetail: string
    products: string
    productDetail: string
    search: string
    userDashboard: string
    userProfile: string
    login: string
    register: string
    admin: string
}

// 新增：动态模板类型，支持任意页面类型
export type DynamicPageTitleTemplates = Record<string, string>

export interface PageTitleConfig {
    defaultPageTitle: string
    templates: DynamicPageTitleTemplates // 修改为动态类型
    previews: Record<string, string>
}

export interface PageTitleFormatRequest {
    pageType: string
    title?: string
    parameters?: Record<string, string>
}

export interface PageTitleFormatResponse {
    formattedTitle: string
    pageType: string
    template: string
}

export const getPageTitleConfig = (): Promise<ApiResponse<PageTitleConfig>> =>
    api.get('/admin/site/page-titles')

// 修改：接收动态模板类型
export const updatePageTitleConfig = (templates: DynamicPageTitleTemplates): Promise<ApiResponse<PageTitleConfig>> =>
    api.put('/admin/site/page-titles', templates)

export const formatPageTitle = (request: PageTitleFormatRequest): Promise<ApiResponse<PageTitleFormatResponse>> =>
    api.post('/public/site/format-title', request)

export const getPageTitleTemplate = (pageType: string): Promise<ApiResponse<string>> =>
    api.get('/public/site/page-title-template', { params: { pageType } })

export const getPageTitlePreviews = (): Promise<ApiResponse<Record<string, string>>> =>
    api.get('/admin/site/page-titles/previews')

export const resetPageTitleTemplates = (): Promise<ApiResponse<PageTitleConfig>> =>
    api.post('/admin/site/page-titles/reset')