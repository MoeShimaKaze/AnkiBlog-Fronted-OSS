export const API_BASE_URL = '/api'

export const ROUTES = {
    HOME: '/',
    ARTICLES: '/articles',
    PRODUCTS: '/products',
    SEARCH: '/search',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ADMIN: '/admin',
    USER: '/user',
} as const

export const USER_ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    GUEST: 'GUEST',
} as const

export const ARTICLE_VISIBILITY = {
    PUBLIC: 'PUBLIC',
    LOGIN_REQUIRED: 'LOGIN_REQUIRED',
    ADMIN_ONLY: 'ADMIN_ONLY',
} as const

export const PRODUCT_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    DRAFT: 'DRAFT',
} as const

export const STORAGE_KEYS = {
    TOKEN: 'token',
    THEME: 'theme',
    SEARCH_HISTORY: 'searchHistory',
    USER_PREFERENCES: 'userPreferences',
} as const

export const FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

export const MAX_FILE_SIZE = {
    IMAGE_PROMPT: 10 * 1024 * 1024, // 10MB
    IMAGE: 50 * 1024 * 1024, // 50MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
} as const
