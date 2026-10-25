// ProductRecommendations.tsx - 使用统一类型定义
import React, { useState, useEffect } from 'react'
import { Row, Col, Typography, Spin } from 'antd'
import ProductCard from './ProductCard'
import { getProducts } from '@/services/products'
import type { Product } from '@/types/product'
import type { ApiResponse } from '@/types/api'
import { primaryTextStyle } from '@/constants/styles'

const { Title } = Typography

interface ProductsResponse {
    content: Product[]
    totalElements: number
    totalPages: number
    page: number
    size: number
}

interface ProductRecommendationsProps {
    currentProductId: string
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ currentProductId }) => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true)
            try {
                const response: ApiResponse<ProductsResponse> = await getProducts({ page: 0, size: 4 })
                if (response && response.success && response.data) {
                    // 过滤掉当前商品
                    const filteredProducts = response.data.content.filter(
                        (product: Product) => product.id !== currentProductId
                    )
                    setProducts(filteredProducts.slice(0, 4))
                }
            } catch (error) {
                console.error('获取推荐商品失败:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecommendations()
    }, [currentProductId])

    if (products.length === 0 && !loading) {
        return null
    }

    return (
        <div>
            <Title level={3} style={{ ...primaryTextStyle, marginBottom: '1.5rem' }}>相关推荐</Title>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '1rem', color: 'white' }}>正在加载推荐商品...</div>
                </div>
            ) : (
                <Row gutter={[24, 24]}>
                    {products.map(product => (
                        <Col key={product.id} xs={24} sm={12} lg={6}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    )
}

export default ProductRecommendations
