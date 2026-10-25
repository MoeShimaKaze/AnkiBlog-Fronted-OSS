// src/utils/url.ts
export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // 移除特殊字符
        .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
        .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
}

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export const getQueryParams = (search: string) => {
    return new URLSearchParams(search)
}

export const buildUrl = (base: string, params: Record<string, any>) => {
    const url = new URL(base, window.location.origin)
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value))
        }
    })
    return url.toString()
}