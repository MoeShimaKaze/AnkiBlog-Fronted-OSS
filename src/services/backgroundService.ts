// src/services/backgroundService.ts
import api from './api'
import type {
    BackgroundSettingsRequest,
    BackgroundSettingsResponse} from '@/types/background'
import type {
    ApiResponse,
    PageRequest,
    PageResponse
} from '@/types/api'

export const backgroundService = {
    // 获取背景设置列表 (分页)
    async getBackgroundSettings(params?: PageRequest): Promise<ApiResponse<PageResponse<BackgroundSettingsResponse>>> {
        const searchParams = new URLSearchParams()
        if (params?.page !== undefined) searchParams.append('page', params.page.toString())
        if (params?.size !== undefined) searchParams.append('size', params.size.toString())
        if (params?.sort) searchParams.append('sort', params.sort)
        if (params?.direction) searchParams.append('direction', params.direction)

        const query = searchParams.toString()
        return api.get(`/admin/backgrounds${query ? `?${query}` : ''}`)
    },

    // 创建背景设置
    async createBackgroundSetting(data: BackgroundSettingsRequest): Promise<ApiResponse<BackgroundSettingsResponse>> {
        return api.post('/admin/backgrounds', data)
    },

    // 更新背景设置
    async updateBackgroundSetting(id: string, data: BackgroundSettingsRequest): Promise<ApiResponse<BackgroundSettingsResponse>> {
        return api.put(`/admin/backgrounds/${id}`, data)
    },

    // 激活背景设置
    async activateBackgroundSetting(id: string): Promise<ApiResponse<void>> {
        return api.post(`/admin/backgrounds/${id}/activate`)
    },

    // 停用背景设置
    async deactivateBackgroundSetting(id: string): Promise<ApiResponse<void>> {
        return api.post(`/admin/backgrounds/${id}/deactivate`)
    },

    // 切换背景设置状态
    async toggleBackgroundSetting(id: string): Promise<ApiResponse<void>> {
        return api.post(`/admin/backgrounds/${id}/toggle`)
    },

    // 删除背景设置
    async deleteBackgroundSetting(id: string): Promise<ApiResponse<void>> {
        return api.delete(`/admin/backgrounds/${id}`)
    },

    // 测试API连接
    async testApiConnection(apiUrl: string): Promise<ApiResponse<boolean>> {
        return api.post('/admin/backgrounds/test-api', null, {
            params: { apiUrl }
        })
    },

    // 刷新背景图片 - 支持指定API ID
    async refreshBackgroundImage(apiId?: string): Promise<ApiResponse<string>> {
        const params = apiId ? { apiId } : {}
        return api.post('/admin/backgrounds/refresh-image', null, { params })
    },

    // 获取激活的API设置列表
    async getActiveApiSettings(): Promise<ApiResponse<BackgroundSettingsResponse[]>> {
        return api.get('/admin/backgrounds/active-apis')
    }
}