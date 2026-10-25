// src/utils/security.ts
export const sanitizeHtml = (html: string): string => {
    // 简单的HTML清理，生产环境建议使用DOMPurify
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
}

export const escapeHtml = (text: string): string => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

export const generateCsrfToken = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}