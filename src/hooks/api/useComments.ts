// src/hooks/useComments.ts
import { useState, useEffect } from 'react'
import { message } from 'antd'
import { getArticleComments, createComment } from '@/services/comments'
import type { Comment, CommentCreateRequest } from '@/types/comment'

export const useComments = (articleId: string) => {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(false)

    const fetchComments = async () => {
        setLoading(true)
        try {
            const response = await getArticleComments(articleId)
            if (response.success) {
                setComments(response.data)
            }
        } catch (error) {
            console.error('获取评论失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const submitComment = async (data: CommentCreateRequest) => {
        try {
            const response = await createComment(articleId, data)
            if (response.success) {
                message.success('评论发表成功，等待审核')
                await fetchComments()
                return true
            }
            return false
        } catch (error: any) {
            console.error('评论发表失败:', error)

            // 统一处理后端错误响应格式
            const errorResponse = error.response?.data

            if (errorResponse?.code === 'LIMIT_EXCEEDED') {
                const { currentValue, maxValue } = errorResponse.details || {}
                message.error({
                    content: `评论内容过长！当前${currentValue}字符，最多${maxValue}字符`,
                    duration: 5
                })
                return false
            }

            // 其他错误
            message.error(errorResponse?.message || '评论发表失败')
            return false
        }
    }

    useEffect(() => {
        if (articleId) {
            fetchComments()
        }
    }, [articleId])

    return {
        comments,
        loading,
        fetchComments,
        submitComment
    }
}