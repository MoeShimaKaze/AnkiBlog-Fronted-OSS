// src/store/slices/authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as authApi from '../../services/auth'
import { storage } from '@/utils/storage'
import type { User } from '@/services/auth'

interface AuthState {
    user: User | null
    token: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    loading: boolean
    initialized: boolean
    error: string | null
}

// 修复初始化逻辑
const token = storage.get<string>('token')
const refreshToken = storage.get<string>('refreshToken')
const initialState: AuthState = {
    user: null,
    token,
    refreshToken,
    isAuthenticated: false,
    loading: false, // 默认不加载，避免阻塞公开页面
    initialized: !token, // 如果有token则未初始化，需要验证用户信息
    error: null,
}

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            return await authApi.getUserProfile()
        } catch (error: any) {
            storage.remove('token')
            return rejectWithValue(error.response?.data?.message || '无法验证会话，请重新登录')
        }
    }
)

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { username: string; password: string }, { dispatch }) => {
        const response = await authApi.login(credentials)
        storage.set('token', response.accessToken)
        storage.set('refreshToken', response.refreshToken)

        // 登录成功后立即获取最新用户信息
        await dispatch(getCurrentUser())

        return response
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
        await authApi.logout().catch(() => {})
        storage.remove('token')
        storage.remove('refreshToken')

        // 登出后重置所有状态
        dispatch(resetAuthState())

        return null
    }
)

export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (profileData: { displayName?: string; bio?: string; website?: string }) => {
        await authApi.updateProfile(profileData)
        // 更新后重新获取用户信息以确保数据同步
        return await authApi.getUserProfile()
    }
)

// 新增：检查认证状态（仅在需要时调用）
export const checkAuthStatus = createAsyncThunk(
    'auth/checkAuthStatus',
    async (_, { dispatch, getState }) => {
        const state = getState() as { auth: AuthState }
        const token = state.auth.token || storage.get<string>('token')

        if (!token) {
            return null
        }

        try {
            return await authApi.getUserProfile()
        } catch (error: any) {
            storage.remove('token')
            dispatch(resetAuthState())
            throw error
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload }
            }
        },
        // 重置认证状态
        resetAuthState: (state) => {
            state.user = null
            state.token = null
            state.refreshToken = null
            state.isAuthenticated = false
            state.loading = false
            state.initialized = true
            state.error = null
        },
        // 刷新用户状态的action
        refreshUserState: (state) => {
            // 标记需要重新获取用户信息
            if (state.token && !state.loading) {
                state.loading = true
                state.initialized = false
            }
        },
        // 更新 tokens（供 api 拦截器使用，静默更新不触发 loading）
        setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
            state.token = action.payload.accessToken
            if (action.payload.refreshToken) {
                state.refreshToken = action.payload.refreshToken
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.token = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
                // 注意：这里不直接设置用户信息，等getCurrentUser完成
                state.isAuthenticated = true
                state.initialized = true
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || '登录失败'
                state.user = null
                state.token = null
                state.isAuthenticated = false
                state.initialized = true
            })
            // Logout
            .addCase(logout.fulfilled, () => {
                // 状态已在reducer中重置
            })
            // GetCurrentUser
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
                state.initialized = true
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false
                state.user = null
                state.token = null
                state.isAuthenticated = false
                state.initialized = true
                state.error = action.payload as string
            })
            // CheckAuthStatus
            .addCase(checkAuthStatus.pending, (state) => {
                state.loading = true
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.loading = false
                if (action.payload) {
                    state.user = action.payload
                    state.isAuthenticated = true
                } else {
                    state.user = null
                    state.isAuthenticated = false
                }
                state.initialized = true
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.loading = false
                state.user = null
                state.token = null
                state.isAuthenticated = false
                state.initialized = true
            })
            // UpdateUserProfile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload // 直接使用最新的用户信息
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || '更新资料失败'
            })
    },
})

export const { clearError, setUser, updateUser, resetAuthState, refreshUserState, setTokens } = authSlice.actions
export default authSlice.reducer