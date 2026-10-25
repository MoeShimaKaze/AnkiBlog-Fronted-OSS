// src/types/user.ts
import { BaseEntity } from './api'

export interface User extends BaseEntity {
    email: string
    displayName: string
    role: UserRole
    avatarUrl?: string
    isApproved: boolean
    bio?: string
    website?: string
    lastLoginAt?: string
}

export type UserRole = 'ADMIN' | 'USER' | 'GUEST'

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    displayName: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    userInfo: User
}