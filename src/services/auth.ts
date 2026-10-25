import api from './api'

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
    displayName: string
}

export interface User {
    id: string
    email: string
    displayName: string
    role: 'ADMIN' | 'USER' | 'GUEST'
    avatarUrl?: string
    isApproved: boolean
    bio?: string
    website?: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    user: User
}

// 修复：移除重复的 .data 访问
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data)
    // 拦截器已经返回了 response.data，直接访问 data 字段
    return response.data
}

export const register = (data: RegisterRequest, verificationCode: string) =>
    api.post('/auth/register', data, { params: { verificationCode } })

export const logout = () =>
    api.post('/auth/logout')

export const refreshToken = (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken })

export const getUserProfile = async (): Promise<User> => {
    const response = await api.get('/user/profile')
    return response.data
}

export const updateProfile = (data: {
    displayName?: string
    bio?: string
    website?: string
}) => api.put('/user/profile', null, { params: data })

export const sendRegisterCode = (email: string) =>
    api.post('/auth/send-register-code', null, { params: { email } })

export const sendResetCode = (email: string) =>
    api.post('/auth/send-reset-code', null, { params: { email } })

export const resetPassword = (data: {
    email: string
    code: string
    newPassword: string
}) => api.post('/auth/reset-password', data)