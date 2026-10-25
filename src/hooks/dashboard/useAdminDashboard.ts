// src/hooks/dashboard/useAdminDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getOverviewDashboard, DashboardOverviewData } from '@/services/dashboard';

interface UseAdminDashboardReturn {
    data: DashboardOverviewData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
    const [data, setData] = useState<DashboardOverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getOverviewDashboard();

            if (response.success) {
                setData(response.data);
            } else {
                const errorMessage = response.message || '获取管理员看板数据失败';
                setError(errorMessage);
                message.error(errorMessage);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || '网络错误，请稍后重试';
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return {
        data,
        loading,
        error,
        refetch: fetchDashboard,
    };
};