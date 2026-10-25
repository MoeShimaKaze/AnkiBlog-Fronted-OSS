// FeaturedProducts.tsx - 使用统一类型定义
import React, { useState, useEffect } from 'react'
import { Row, Col, Spin } from 'antd'
import ProductCard from './ProductCard'
import { getProducts } from '@/services/products'
import type { Product } from '@/types/product'
import type { ApiResponse } from '@/types/api'

interface ProductsResponse {
    content: Product[]
    totalElements: number
    totalPages: number
    page: number
    size: number
}

const FeaturedProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const response: ApiResponse<ProductsResponse> = await getProducts({ page: 0, size: 3 })
                if (response && response.success && response.data) {
                    setProducts(response.data.content || [])
                } else {
                    console.warn('推荐商品响应异常:', response)
                    setProducts([])
                }
            } catch (error) {
                console.error('获取推荐商品失败:', error)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spin size="large" />
                <div style={{ marginTop: '1rem', color: 'white' }}>正在加载推荐商品...</div>
            </div>
        )
    }

    return (
        <Row gutter={[12, 16]}>
            {products.map(product => (
                <Col key={product.id} xs={24} sm={12} xl={8}>
                    <ProductCard product={product} />
                </Col>
            ))}
        </Row>
    )
}

export default FeaturedProducts