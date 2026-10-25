// src/utils/customPageUtils.ts
import { CustomPage, PageType } from '@/types/customPage';

export const getPageTypeInfo = (type: PageType) => {
    const typeMap = {
        STATIC: {
            name: '静态页面',
            color: 'blue',
            description: '普通的静态内容页面',
            icon: '📄'
        },
        DYNAMIC: {
            name: '动态页面',
            color: 'green',
            description: '包含动态内容的页面',
            icon: '⚡'
        },
        PORTFOLIO: {
            name: '作品集',
            color: 'purple',
            description: '展示作品和项目的页面',
            icon: '🎨'
        },
        LANDING: {
            name: '落地页',
            color: 'orange',
            description: '营销或推广用的着陆页',
            icon: '🚀'
        },
        REDIRECT: {
            name: '重定向',
            color: 'red',
            description: '自动跳转到其他页面',
            icon: '↗️'
        }
    };

    return typeMap[type] || typeMap.STATIC;
};

export const validatePageSlug = (slug: string): string | null => {
    if (!slug) {
        return '页面路径不能为空';
    }

    if (slug.length > 100) {
        return '页面路径长度不能超过100个字符';
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
        return '页面路径只能包含小写字母、数字和连字符';
    }

    // 检查保留路径
    const reservedSlugs = ['admin', 'api', 'auth', 'user', 'articles', 'products', 'pages'];
    if (reservedSlugs.includes(slug)) {
        return '该路径为系统保留路径，请使用其他路径';
    }

    return null;
};

export const generateSlugFromTitle = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
        .replace(/\s+/g, '-') // 空格替换为连字符
        .replace(/-+/g, '-') // 多个连字符替换为单个
        .replace(/^-|-$/g, ''); // 移除开头和结尾的连字符
};

export const sanitizePageContent = (content: string): string => {
    // 基础的HTML内容净化
    // 在实际项目中，建议使用专业的HTML净化库如DOMPurify

    // 移除危险的脚本标签
    let sanitized = content.replace(/<script[^>]*>.*?<\/script>/gi, '');

    // 移除危险的事件处理器
    sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '');

    // 移除javascript:协议
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized;
};

export const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200; // 平均阅读速度
    const plainText = content.replace(/<[^>]+>/g, ''); // 移除HTML标签
    const wordCount = plainText.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readingTime); // 至少1分钟
};

export const formatPageUrl = (slug: string): string => {
    return `/pages/${slug}`;
};

export const isValidRedirectUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        // 检查相对路径
        return /^\/[^\/]/.test(url);
    }
};

export const getPageStatusText = (page: CustomPage): string => {
    if (!page.published) return '草稿';
    if (page.featured) return '推荐';
    return '已发布';
};

export const getPageStatusColor = (page: CustomPage): string => {
    if (!page.published) return 'processing';
    if (page.featured) return 'gold';
    return 'success';
};