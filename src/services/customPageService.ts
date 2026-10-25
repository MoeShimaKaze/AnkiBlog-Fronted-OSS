// src/services/customPageService.ts
import api from './api'
import { ApiResponse, PageResponse, PageRequest } from '@/types/api'
import { CustomPage, CustomPageCreateRequest, CustomPageUpdateRequest } from '@/types/customPage'

// 公开接口
export const getPublishedPages = (params: PageRequest): Promise<ApiResponse<PageResponse<CustomPage>>> => {
    return api.get('/public/pages', { params })
}

export const getMenuPages = (): Promise<ApiResponse<CustomPage[]>> => {
    return api.get('/public/pages/menu')
}

export const getPageBySlug = (slug: string): Promise<ApiResponse<CustomPage>> => {
    return api.get(`/public/pages/${slug}`)
}

export const searchPages = (keyword: string, params: PageRequest): Promise<ApiResponse<PageResponse<CustomPage>>> => {
    return api.get('/public/pages/search', { params: { keyword, ...params } })
}

export const getFeaturedPages = (): Promise<ApiResponse<CustomPage[]>> => {
    return api.get('/public/pages/featured')
}

// 管理员接口
export const getAdminPages = (params: {
    keyword?: string
    page?: number
    size?: number
    sort?: string
    direction?: 'ASC' | 'DESC'
}): Promise<ApiResponse<PageResponse<CustomPage>>> => {
    return api.get('/admin/pages', { params })
}

export const getAdminPageById = (id: string): Promise<ApiResponse<CustomPage>> => {
    return api.get(`/admin/pages/${id}`)
}

export const createPage = (data: CustomPageCreateRequest): Promise<ApiResponse<CustomPage>> => {
    return api.post('/admin/pages', data)
}

export const updatePage = (id: string, data: CustomPageUpdateRequest): Promise<ApiResponse<CustomPage>> => {
    return api.put(`/admin/pages/${id}`, data)
}

export const publishPage = (id: string): Promise<ApiResponse<void>> => {
    return api.post(`/admin/pages/${id}/publish`)
}

export const unpublishPage = (id: string): Promise<ApiResponse<void>> => {
    return api.post(`/admin/pages/${id}/unpublish`)
}

export const deletePage = (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/admin/pages/${id}`)
}

export const setFeatured = (id: string, featured: boolean): Promise<ApiResponse<void>> => {
    return api.post(`/admin/pages/${id}/featured`, null, { params: { featured } })
}

export const updatePageContent = (id: string, content: string): Promise<ApiResponse<void>> => {
    return api.put(`/admin/pages/${id}/content`, content, {
        headers: { 'Content-Type': 'text/plain' }
    })
}

export const updateCustomCss = (id: string, css: string): Promise<ApiResponse<void>> => {
    return api.put(`/admin/pages/${id}/css`, css, {
        headers: { 'Content-Type': 'text/plain' }
    })
}

export const updateCustomJs = (id: string, js: string): Promise<ApiResponse<void>> => {
    return api.put(`/admin/pages/${id}/js`, js, {
        headers: { 'Content-Type': 'text/plain' }
    })
}

export const getPageStats = (): Promise<ApiResponse<number>> => {
    return api.get('/admin/pages/stats')
}