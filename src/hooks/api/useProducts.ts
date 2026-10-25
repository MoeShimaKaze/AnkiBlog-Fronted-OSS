// useProducts Hook - 使用统一类型定义
import { useState, useEffect } from 'react'
import { getProducts, getProductBySlug } from '@/services/products'
import type { Product } from '@/types/product'
import type { ApiResponse } from '@/types/api'

interface ProductsParams {
    page?: number
    size?: number
    category?: string
    keyword?: string
    sort?: string
}

interface ProductsResponse {
    content: Product[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    first?: boolean
    last?: boolean
    hasNext?: boolean
    hasPrevious?: boolean
}

export const useProducts = (params: ProductsParams = {}) => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const fetchProducts = async () => {
        setLoading(true)
        setError(null)

        try {
            const queryParams = {
                ...params,
                search: params.keyword || undefined,
            }

            const response: ApiResponse<ProductsResponse> = await getProducts(queryParams)

            if (response && response.success && response.data) {
                const data = response.data
                setProducts(data.content || [])
                setTotal(data.totalElements || 0)
            } else {
                console.warn('商品响应异常:', response)
                setProducts([])
                setTotal(0)
                setError(response?.message || '响应数据格式错误')
            }
        } catch (err: any) {
            console.error('获取商品失败:', err)
            setProducts([])
            setTotal(0)

            if (err.response?.status === 404) {
                setError('未找到相关商品')
            } else if (err.response?.status >= 500) {
                setError('服务器错误，请稍后重试')
            } else if (err.code === 'NETWORK_ERROR' || !err.response) {
                setError('网络连接失败，请检查网络')
            } else {
                setError(err.response?.data?.message || '获取商品失败')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [JSON.stringify(params)])

    return {
        products,
        loading,
        total,
        error,
        refetch: fetchProducts,
    }
}

export const useProduct = (slug: string) => {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!slug) {
            setProduct(null)
            setError(null)
            return
        }

        const fetchProduct = async () => {
            setLoading(true)
            setError(null)

            try {
                const response: ApiResponse<Product> = await getProductBySlug(slug)

                if (response && response.success && response.data) {
                    setProduct(response.data)
                } else {
                    setProduct(null)
                    setError(response?.message || '商品数据格式错误')
                }
            } catch (err: any) {
                console.error('获取商品详情失败:', err)
                setProduct(null)

                if (err.response?.status === 404) {
                    setError('商品不存在')
                } else if (err.response?.status >= 500) {
                    setError('服务器错误，请稍后重试')
                } else {
                    setError(err.response?.data?.message || '获取商品详情失败')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [slug])

    return {
        product,
        loading,
        error,
    }
}