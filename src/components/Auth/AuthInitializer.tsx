// src/components/Auth/AuthInitializer.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { checkAuthStatus, logout, resetAuthState } from '@/store/slices/authSlice';
import { storage } from '@/utils/storage';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const { initialized, token, user, isAuthenticated } = useAppSelector(state => state.auth);

    // 初始化认证状态（仅在应用启动时执行一次）
    useEffect(() => {
        const currentToken = storage.get<string>('token');

        if (currentToken && (!initialized || (!user && !isAuthenticated))) {
            dispatch(checkAuthStatus());
        } else if (!currentToken && (token || isAuthenticated)) {
            // Token 不存在但状态显示已认证，重置状态
            dispatch(resetAuthState());
        }
    }, [dispatch, initialized, user, isAuthenticated, token]);

    // 监听 storage 变化，处理多标签页同步
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                const newToken = e.newValue;
                const currentTokenInState = token;

                if (newToken && newToken !== currentTokenInState) {
                    // 在其他标签页登录，静默更新 token（不触发 loading）
                    // 下次 API 请求时会自动使用新 token
                    // 如果需要更新用户信息，可以在这里添加静默获取逻辑
                } else if (!newToken && currentTokenInState) {
                    // 在其他标签页登出，同步登出状态
                    dispatch(logout());
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [dispatch, token]);

    // 注意：移除了 visibilitychange 监听
    // 原因：
    // 1. 会触发 loading 状态变化，导致 ProtectedRoute 卸载子组件
    // 2. 表单数据会丢失
    // 3. 现在有了 api 拦截器的自动刷新机制，不需要主动检查认证状态
    // 4. Token 过期时，API 请求会自动触发刷新

    return <>{children}</>;
};

export default AuthInitializer;
