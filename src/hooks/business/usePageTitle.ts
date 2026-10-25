// src/hooks/business/usePageTitle.ts - 增强版本
import { useEffect, useState, useMemo, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { formatPageTitle, PageTitleFormatRequest } from '@/services/pageTitle'
import { matchPageType } from '@/services/pageTypeConfig'

interface PageTitleOptions {
    title?: string
    category?: string
    tags?: string | string[]
    author?: string
    userName?: string
    userDisplayName?: string
    query?: string
    keyword?: string
    page?: string | number
    section?: string
    year?: string | number
    month?: string | number
    date?: string
    [key: string]: any // 支持自定义参数
}

export const usePageTitle = (customTitle?: string, customParams?: PageTitleOptions) => {
    const location = useLocation()
    const params = useParams()
    const [title, setTitle] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const requestRef = useRef<AbortController | null>(null)
    const lastRequestRef = useRef<string>('')

    // 智能提取URL和页面参数
    const extractedParams = useMemo(() => {
        const urlParams = new URLSearchParams(location.search)
        const extracted: Record<string, string> = {}

        // 从URL参数提取
        const query = urlParams.get('q') || urlParams.get('query') || urlParams.get('search')
        if (query) extracted.query = query

        const page = urlParams.get('page') || urlParams.get('p')
        if (page) extracted.page = page

        const category = urlParams.get('category') || urlParams.get('cat')
        if (category) extracted.category = category

        // 从路由参数提取
        if (params.id) extracted.id = params.id
        if (params.slug) extracted.slug = params.slug
        if (params.username) extracted.userName = params.username

        // 从路径推断
        const pathSegments = location.pathname.split('/').filter(Boolean)
        if (pathSegments.includes('search') && pathSegments.length > 1) {
            const searchTerm = pathSegments[pathSegments.indexOf('search') + 1]
            if (searchTerm && !extracted.query) {
                extracted.query = decodeURIComponent(searchTerm)
            }
        }

        return extracted
    }, [location.search, location.pathname, params])

    // 合并所有参数
    const mergedParams = useMemo(() => {
        const merged: Record<string, string> = { ...extractedParams }

        if (customParams) {
            Object.entries(customParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        merged[key] = value.join(', ')
                    } else {
                        merged[key] = String(value)
                    }
                }
            })
        }

        return merged
    }, [extractedParams, customParams])

    const stableParams = useMemo(() => {
        return Object.keys(mergedParams).length > 0 ? mergedParams : undefined
    }, [JSON.stringify(mergedParams)])

    useEffect(() => {
        const updateTitle = async () => {
            if (requestRef.current) {
                requestRef.current.abort()
            }

            const requestKey = `${location.pathname}-${customTitle || ''}-${JSON.stringify(stableParams || {})}`
            if (lastRequestRef.current === requestKey) {
                return
            }

            setLoading(true)
            requestRef.current = new AbortController()

            try {
                // 1. 匹配页面类型
                const matchResponse = await matchPageType(location.pathname)
                let pageType = 'default'

                if (matchResponse.success && matchResponse.data) {
                    pageType = matchResponse.data.pageType
                    console.log('🎯 页面类型匹配:', pageType)
                }

                // 2. 格式化标题
                const request: PageTitleFormatRequest = {
                    pageType,
                    title: customTitle,
                    parameters: stableParams
                }

                console.log('📤 标题格式化请求:', {
                    ...request,
                    parametersCount: stableParams ? Object.keys(stableParams).length : 0
                })

                const response = await formatPageTitle(request)

                if (requestRef.current?.signal.aborted) {
                    return
                }

                if (response.success && response.data) {
                    const formattedTitle = response.data.formattedTitle
                    setTitle(formattedTitle)
                    document.title = formattedTitle
                    lastRequestRef.current = requestKey
                    console.log('✅ 标题设置成功:', formattedTitle)
                } else {
                    console.error('❌ 格式化失败:', response.message)
                    const fallbackTitle = customTitle || 'AnkiBlog'
                    setTitle(fallbackTitle)
                    document.title = fallbackTitle
                    lastRequestRef.current = requestKey
                }
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    return
                }

                console.error('❌ 标题更新失败:', error)
                const fallbackTitle = customTitle || 'AnkiBlog'
                setTitle(fallbackTitle)
                document.title = fallbackTitle
                lastRequestRef.current = requestKey
            } finally {
                setLoading(false)
                requestRef.current = null
            }
        }

        const timeoutId = setTimeout(updateTitle, 100)

        return () => {
            clearTimeout(timeoutId)
            if (requestRef.current) {
                requestRef.current.abort()
            }
        }
    }, [location.pathname, customTitle, stableParams])

    useEffect(() => {
        return () => {
            if (requestRef.current) {
                requestRef.current.abort()
            }
        }
    }, [])

    return {
        title,
        loading,
            setTitle: (newTitle: string) => {
            setTitle(newTitle)
            document.title = newTitle
        }
    }
}

// 便捷的特定页面类型hooks
export const useArticleTitle = (articleTitle: string, category?: string, tags?: string[], author?: string) => {
    return usePageTitle(articleTitle, { category, tags, author })
}

export const useProductTitle = (productTitle: string, category?: string) => {
    return usePageTitle(productTitle, { category })
}

export const useSearchTitle = (query?: string) => {
    return usePageTitle(undefined, { query })
}

export const useUserTitle = (userName?: string, userDisplayName?: string) => {
    return usePageTitle(undefined, { userName, userDisplayName })
}