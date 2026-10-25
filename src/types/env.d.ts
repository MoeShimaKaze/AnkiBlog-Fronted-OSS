/// <reference types="vite/client" />

// Vite 环境变量类型定义
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_VERSION: string
    readonly VITE_APP_DESCRIPTION: string
    readonly VITE_UPLOAD_MAX_SIZE: string
    readonly VITE_ENABLE_MOCK: string
    readonly VITE_ENABLE_SW: string
    readonly VITE_PWA_SHORT_NAME: string
    readonly VITE_PWA_THEME_COLOR: string
    readonly VITE_PWA_BACKGROUND_COLOR: string
    readonly VITE_GOOGLE_ANALYTICS_ID?: string
    readonly VITE_BAIDU_ANALYTICS_ID?: string
    readonly VITE_CDN_URL?: string
    readonly VITE_DEBUG_SW?: string
    readonly VITE_DEBUG_API?: string
    readonly VITE_ENABLE_DEVTOOLS?: string
    readonly MODE: string
    readonly BASE_URL: string
    readonly PROD: boolean
    readonly DEV: boolean
    readonly SSR: boolean
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// 全局常量类型定义
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string

// Window 对象扩展
declare global {
    interface Window {
        // PWA 相关
        deferredPrompt?: any
        // 性能监控
        __PERFORMANCE_DATA__?: Record<string, any>
    }
}

export {}