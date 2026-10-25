// src/components/Auth/AdminRoute.tsx

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Spin } from 'antd';
import { useAppSelector, useAppDispatch } from '@/hooks/redux.ts';
import { getCurrentUser } from '@/store/slices/authSlice.ts';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    // 1. 从 Redux state 中多获取一个 initialized 状态
    const { isAuthenticated, loading, user, token, initialized } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (token && !user) {
            dispatch(getCurrentUser());
        }
    }, [token, user, dispatch]);

    // 2. 修改加载判断逻辑：当 token 存在但还未初始化完成时，也应显示加载状态
    if ((!initialized && token) || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="正在验证管理员权限..." />
            </div>
        );
    }

    // 3. 修改重定向逻辑：确保在初始化完成后再判断是否已认证
    if (initialized && !isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (user?.role !== 'ADMIN') {
        return (
            <Result
                status="403"
                title="403"
                subTitle="抱歉，您没有权限访问此页面。"
            />
        );
    }

    return <>{children}</>;
};

export default AdminRoute;