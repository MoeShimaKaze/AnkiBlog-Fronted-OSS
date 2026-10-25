// src/hooks/dashboard/useDashboard.ts
import { useState, useEffect } from 'react'
import { message } from 'antd'
import { getUserDashboard, UserDashboardData } from '@/services/dashboard'

interface UseDashboardReturn {
    data: UserDashboardData | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    updateStats: (updates: Partial<Pick<UserDashboardData, 'myCommentsCount' | 'likedArticlesCount' | 'favoriteProductsCount'>>) => void
}

export const useDashboard = (): UseDashboardReturn => {
    const [data, setData] = useState<UserDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboard = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getUserDashboard()

            if (response.success) {
                setData(response.data)
            } else {
                setError(response.message || '获取看板数据失败')
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || '网络错误'
            setError(errorMessage)
            message.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const updateStats = (updates: Partial<Pick<UserDashboardData, 'myCommentsCount' | 'likedArticlesCount' | 'favoriteProductsCount'>>) => {
        if (data) {
            setData(prev => prev ? { ...prev, ...updates } : null)
        }
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    return {
        data,
        loading,
        error,
        refetch: fetchDashboard,
        updateStats
    }
}