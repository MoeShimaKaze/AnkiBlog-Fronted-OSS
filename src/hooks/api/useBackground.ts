// src/hooks/useBackground.ts
import { useState, useCallback } from 'react'
import { message } from 'antd'
import { backgroundService } from '@/services/backgroundService'
import type {
    BackgroundSettingsRequest,
    BackgroundSettingsResponse
} from '@/types/background'
import type { PageRequest } from '@/types/api'

export const useBackgroundSettings = () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<BackgroundSettingsResponse[]>([])
    const [total, setTotal] = useState(0)
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const fetchData = useCallback(async (params?: PageRequest) => {
        setLoading(true)
        try {
            const response = await backgroundService.getBackgroundSettings({
                page: params?.page ?? current - 1,
                size: params?.size ?? pageSize,
                sort: params?.sort,
                direction: params?.direction
            })

            if (response.success) {
                setData(response.data.content)
                setTotal(response.data.totalElements)
                setCurrent((response.data.page || 0) + 1)
                setPageSize(response.data.size || 10)
            } else {
                message.error(response.message || '获取数据失败')
            }
        } catch (error) {
            message.error('获取数据失败')
        } finally {
            setLoading(false)
        }
    }, [current, pageSize])

    const createItem = useCallback(async (data: BackgroundSettingsRequest) => {
        try {
            const response = await backgroundService.createBackgroundSetting(data)
            if (response.success) {
                message.success('创建成功')
                await fetchData()
                return response.data
            } else {
                message.error(response.message || '创建失败')
                throw new Error(response.message)
            }
        } catch (error) {
            throw error
        }
    }, [fetchData])

    const updateItem = useCallback(async (id: string, data: BackgroundSettingsRequest) => {
        try {
            const response = await backgroundService.updateBackgroundSetting(id, data)
            if (response.success) {
                message.success('更新成功')
                await fetchData()
                return response.data
            } else {
                message.error(response.message || '更新失败')
                throw new Error(response.message)
            }
        } catch (error) {
            throw error
        }
    }, [fetchData])

    const toggleItem = useCallback(async (id: string) => {
        try {
            const response = await backgroundService.toggleBackgroundSetting(id)
            if (response.success) {
                message.success('状态切换成功')
                await fetchData()
            } else {
                message.error(response.message || '操作失败')
            }
        } catch (error) {
            message.error('操作失败')
        }
    }, [fetchData])

    const deleteItem = useCallback(async (id: string) => {
        try {
            const response = await backgroundService.deleteBackgroundSetting(id)
            if (response.success) {
                message.success('删除成功')
                await fetchData()
            } else {
                message.error(response.message || '删除失败')
            }
        } catch (error) {
            message.error('删除失败')
        }
    }, [fetchData])

    return {
        loading,
        data,
        total,
        current,
        pageSize,
        fetchData,
        createItem,
        updateItem,
        toggleItem,
        deleteItem,
        setCurrent,
        setPageSize
    }
}

export const useBackgroundActions = () => {
    const [testing, setTesting] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [loadingApis, setLoadingApis] = useState(false)

    const testApi = useCallback(async (apiUrl: string) => {
        setTesting(true)
        try {
            const response = await backgroundService.testApiConnection(apiUrl)
            if (response.success && response.data) {
                message.success('API连接测试成功')
                return true
            } else {
                message.error('API连接测试失败')
                return false
            }
        } catch (error) {
            message.error('API连接测试失败')
            return false
        } finally {
            setTesting(false)
        }
    }, [])

    const refreshImage = useCallback(async (apiId?: string) => {
        setRefreshing(true)
        try {
            const response = await backgroundService.refreshBackgroundImage(apiId)
            if (response.success) {
                message.success('背景图片刷新成功')
                return response.data
            } else {
                message.error(response.message || '刷新失败')
                return null
            }
        } catch (error) {
            message.error('刷新失败')
            return null
        } finally {
            setRefreshing(false)
        }
    }, [])

    const getActiveApis = useCallback(async () => {
        setLoadingApis(true)
        try {
            const response = await backgroundService.getActiveApiSettings()
            if (response.success) {
                return response.data
            } else {
                message.error(response.message || '获取API列表失败')
                return []
            }
        } catch (error) {
            message.error('获取API列表失败')
            return []
        } finally {
            setLoadingApis(false)
        }
    }, [])

    return {
        testing,
        refreshing,
        loadingApis,
        testApi,
        refreshImage,
        getActiveApis
    }
}