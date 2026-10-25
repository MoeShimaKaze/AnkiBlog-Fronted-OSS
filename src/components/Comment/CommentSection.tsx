// src/components/Comment/CommentSection.tsx
import React, { useState } from 'react'
import { Typography, Button, message } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import CommentList from './CommentList'
import CommentForm from './CommentForm'
import { useComments } from '@/hooks/api/useComments'
import { useAuth } from '@/hooks/auth/useAuth.ts'
import { commentSectionCardStyle, primaryTextStyle } from '@/constants/styles'

const { Title } = Typography

interface CommentSectionProps {
    articleId: string
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
    const [showForm, setShowForm] = useState(false)
    const { isAuthenticated } = useAuth()
    const { comments, loading, submitComment } = useComments(articleId)

    const handleCommentSubmit = async (content: string) => {
        const success = await submitComment({ content })
        if (success) {
            setShowForm(false)
        }
    }

    const glassCardStyle = commentSectionCardStyle;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={3} style={{ ...primaryTextStyle, margin: 0 }}>
                    <MessageOutlined style={{ marginRight: '8px' }} />
                    评论 ({comments.length})
                </Title>

                {isAuthenticated ? (
                    <Button
                        type="primary"
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '20px'
                        }}
                    >
                        {showForm ? '取消评论' : '写评论'}
                    </Button>
                ) : (
                    <Button
                        onClick={() => message.info('请先登录后再评论')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            borderRadius: '20px'
                        }}
                    >
                        写评论
                    </Button>
                )}
            </div>

            {showForm && (
                <div style={glassCardStyle}>
                    <CommentForm onSubmit={handleCommentSubmit} />
                </div>
            )}

            <CommentList comments={comments} loading={loading} />
        </div>
    )
}

export default CommentSection
