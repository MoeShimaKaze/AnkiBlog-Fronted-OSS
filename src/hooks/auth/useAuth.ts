// src/hooks/auth/useAuth.ts
import { useAppSelector, useAppDispatch } from '../redux'
import { login as loginAction, logout as logoutAction, checkAuthStatus } from '../../store/slices/authSlice'

export const useAuth = () => {
    const auth = useAppSelector(state => state.auth)
    const dispatch = useAppDispatch()

    const login = async (credentials: { username: string; password: string }) => {
        const result = await dispatch(loginAction(credentials))

        if (loginAction.fulfilled.match(result)) {
            // 登录成功，检查是否有返回URL
            const urlParams = new URLSearchParams(window.location.search)
            const returnUrl = urlParams.get('return')

            if (returnUrl) {
                window.location.href = decodeURIComponent(returnUrl)
            }
        }

        return result
    }

    const logout = async () => {
        const result = await dispatch(logoutAction())

        if (logoutAction.fulfilled.match(result)) {
            // 登出后，如果当前在需要认证的页面，跳转到首页
            const isProtectedPage = window.location.pathname.startsWith('/user/') ||
                window.location.pathname.startsWith('/admin/')
            if (isProtectedPage) {
                window.location.href = '/'
            }
        }

        return result
    }

    const refreshUserInfo = () => {
        // 只有在已认证状态下才刷新用户信息
        if (auth.isAuthenticated && auth.token) {
            return dispatch(checkAuthStatus())
        }
    }

    const isAdmin = auth.user?.role === 'ADMIN'
    const isUser = auth.user?.role === 'USER'
    const isApproved = auth.user?.isApproved

    return {
        ...auth,
        login,
        logout,
        refreshUserInfo,
        isAdmin,
        isUser,
        isApproved,
        isLoading: auth.loading,
        isInitialized: auth.initialized,
        userAvatarUrl: auth.user?.avatarUrl,
        userName: auth.user?.displayName,
    }
}