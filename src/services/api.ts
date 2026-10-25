// src/services/api.ts - JWT 自动刷新版本
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { storage } from '@/utils/storage'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 120000,
    headers: {
        'Content-Type': 'application/json',
    },
})

const PROTECTED_PATHS = [
    '/user/',
    '/admin/',
    '/api/user/',
    '/api/admin/',
]

const isProtectedPath = (url: string): boolean => {
    return PROTECTED_PATHS.some(path => url.includes(path))
}

const isProtectedPage = (): boolean => {
    const pathname = window.location.pathname
    return pathname.startsWith('/user/') || pathname.startsWith('/admin/')
}

// ==================== Token 刷新机制 ====================

// 刷新状态标志
let isRefreshing = false
// 等待刷新的请求队列
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: Error) => void
}> = []

// 处理队列中的请求
const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error)
        } else if (token) {
            resolve(token)
        }
    })
    failedQueue = []
}

// 刷新 Token
const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = storage.get<string>('refreshToken')
    if (!refreshToken) {
        throw new Error('No refresh token available')
    }

    // 直接使用 axios 避免拦截器循环
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`,
        null,
        { params: { refreshToken } }
    )

    const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data

    // 保存新 Token
    storage.set('token', accessToken)
    if (newRefreshToken) {
        storage.set('refreshToken', newRefreshToken)
    }

    // 更新 Redux state（如果 store 可用）
    try {
        const { store } = await import('@/store')
        const { setTokens } = await import('@/store/slices/authSlice')
        store.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }))
    } catch {
        // store 不可用时忽略
    }

    return accessToken
}

// 清除认证并跳转登录页
const clearAuthAndRedirect = () => {
    storage.remove('token')
    storage.remove('refreshToken')

    // 更新 Redux state
    import('@/store').then(({ store }) => {
        import('@/store/slices/authSlice').then(({ resetAuthState }) => {
            store.dispatch(resetAuthState())
        })
    }).catch(() => {})

    // 跳转登录页
    if (window.location.pathname !== '/auth/login') {
        const returnUrl = window.location.pathname + window.location.search
        window.location.href = `/auth/login?return=${encodeURIComponent(returnUrl)}`
    }
}

// ==================== 拦截器配置 ====================

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        const token = storage.get<string>('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器 - 支持 Token 自动刷新
api.interceptors.response.use(
    (response: AxiosResponse) => {
        const data = response.data

        // 检查业务层错误
        if (data && typeof data === 'object' && data.success === false) {
            const error = new Error(data.message || '操作失败')
            error.name = 'BusinessError'
            Object.assign(error, { data: data })
            return Promise.reject(error)
        }

        // 成功响应：返回完整的 data
        return data
    },
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        const { response } = error

        // 处理 401 错误
        if (response?.status === 401 && !originalRequest._retry) {
            // 标记请求已重试，防止无限循环
            originalRequest._retry = true

            // 检查是否是刷新 Token 请求本身失败
            if (originalRequest.url?.includes('/auth/refresh')) {
                clearAuthAndRedirect()
                return Promise.reject(new Error('刷新令牌已过期，请重新登录'))
            }

            // 检查是否有 refreshToken
            const refreshToken = storage.get<string>('refreshToken')
            if (!refreshToken) {
                // 没有 refreshToken，直接跳转登录
                const isProtectedApiCall = isProtectedPath(originalRequest.url || '')
                const isCurrentPageProtected = isProtectedPage()

                if (isProtectedApiCall || isCurrentPageProtected) {
                    clearAuthAndRedirect()
                }
                return Promise.reject(new Error('未授权访问'))
            }

            // 如果正在刷新，将请求加入队列等待
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                }).catch((err) => {
                    return Promise.reject(err)
                })
            }

            // 开始刷新 Token
            isRefreshing = true

            try {
                const newToken = await refreshAccessToken()

                // 处理队列中的请求
                processQueue(null, newToken)

                // 重试原始请求
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)
            } catch (refreshError) {
                // 刷新失败，处理队列中的请求
                processQueue(refreshError as Error, null)

                // 清除认证并跳转
                clearAuthAndRedirect()

                return Promise.reject(new Error('会话已过期，请重新登录'))
            } finally {
                isRefreshing = false
            }
        }

        // 其他错误
        const msg = error.response?.data?.message || error.message || '请求失败'
        return Promise.reject(new Error(msg))
    }
)

export default api
