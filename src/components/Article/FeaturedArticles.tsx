import React, { useState, useEffect } from 'react'
import { Row, Col, Spin } from 'antd'
import ArticleCard from './ArticleCard'
import { getArticles } from '@/services/articles'
import { Article } from '@/types/article'
import { ApiResponse, PageResponse } from '@/types/api'

const FeaturedArticles: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true)
            try {
                const response: ApiResponse<PageResponse<Article>> = await getArticles({ page: 0, size: 3 })
                if (response && response.success && response.data) {
                    setArticles(response.data.content || [])
                } else {
                    console.warn('精选文章响应异常:', response)
                    setArticles([])
                }
            } catch (error) {
                console.error('获取精选文章失败:', error)
                setArticles([])
            } finally {
                setLoading(false)
            }
        }

        fetchArticles()
    }, [])

    return (
        <Spin spinning={loading}>
            <Row gutter={[12, 16]}>
                {articles.map(article => (
                    <Col key={article.id} xs={24} sm={12} xl={8}>
                        <ArticleCard article={article} />
                    </Col>
                ))}
            </Row>
        </Spin>
    )
}

export default FeaturedArticles