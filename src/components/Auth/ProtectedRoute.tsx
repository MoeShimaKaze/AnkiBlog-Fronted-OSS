// src/components/Auth/ProtectedRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import Loading from '@/components/UI/Loading'

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, initialized, loading, token } = useAppSelector(state => state.auth)
    const location = useLocation()

    // 如果有token但还没初始化完成，或者正在加载，显示加载状态
    if ((!initialized && token) || loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loading size="large" tip="正在验证身份..." />
            </div>
        )
    }

    // 初始化完成且未认证，重定向到登录页
    if (initialized && !isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />
    }

    // 已认证，正常渲染
    return <>{children}</>
}

export default ProtectedRoute