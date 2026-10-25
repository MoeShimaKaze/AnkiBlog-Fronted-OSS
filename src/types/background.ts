// src/types/background.ts
import { BaseEntity } from './api'

export enum BackgroundType {
    COLOR = 'COLOR',
    GRADIENT = 'GRADIENT',
    IMAGE = 'IMAGE',
    API = 'API'
}

export interface BackgroundTypeInfo {
    code: BackgroundType
    displayName: string
}

export const BACKGROUND_TYPE_OPTIONS: BackgroundTypeInfo[] = [
    { code: BackgroundType.COLOR, displayName: '纯色' },
    { code: BackgroundType.GRADIENT, displayName: '渐变' },
    { code: BackgroundType.IMAGE, displayName: '图片' },
    { code: BackgroundType.API, displayName: 'API接口' }
]

export interface BackgroundSettings extends BaseEntity {
    type: BackgroundType
    value: string
    active: boolean
    autoChange: boolean
    changeInterval?: number
}

export interface BackgroundSettingsRequest {
    type: BackgroundType
    value?: string
    active?: boolean
    autoChange?: boolean
    changeInterval?: number
}

export interface BackgroundSettingsResponse extends BackgroundSettings {}

export interface ApiTestRequest {
    apiUrl: string
}

export interface ApiTestResponse {
    success: boolean
}

// 预设API配置
export interface ApiConfig {
    url: string
    description: string
}

export const DEFAULT_APIS: ApiConfig[] = [
    {
        url: 'https://www.loliapi.com/acg/',
        description: '二次元动漫图片API'
    },
    {
        url: 'https://www.dmoe.cc/random.php',
        description: '随机二次元图片API'
    },
    {
        url: 'https://api.vvhan.com/api/wallpaper/views',
        description: '风景图片API'
    }
]