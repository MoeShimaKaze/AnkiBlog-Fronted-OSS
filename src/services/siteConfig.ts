import api from './api'
import { ApiResponse } from '@/types/api'

export interface PublicSiteConfig {
    siteName: string
    siteTagline: string
    siteDescription: string
    logoUrl?: string
    faviconUrl?: string
    themeColor: string
    heroTitle: string
    heroSubtitle: string
    ownerName?: string
    ownerAvatar?: string
    ownerBio?: string
    commentsEnabled: boolean
    allowGuestComments: boolean
}

export interface SiteBasicInfo {
    siteName: string
    siteTagline: string
    heroTitle: string
    heroSubtitle: string
    logoUrl?: string
    themeColor: string
}

/**
 * 获取公开的站点配置信息
 */
export const getPublicSiteConfig = async (): Promise<ApiResponse<PublicSiteConfig>> => {
    return api.get('/public/site/config')
}

/**
 * 获取站点基本信息（轻量级）
 */
export const getSiteBasicInfo = async (): Promise<ApiResponse<SiteBasicInfo>> => {
    return api.get('/public/site/basic')
}