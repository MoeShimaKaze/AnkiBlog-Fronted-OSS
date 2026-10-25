import React from 'react'
import { Avatar, Typography, Space, Spin } from 'antd'
import { UserOutlined, ClockCircleOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons'
import { formatRelativeTime } from '@/utils/format.ts'
import type { Comment } from '@/types/comment'
import { commentItemCardStyle, mutedTextStyle, primaryTextStyle } from '@/constants/styles'

const { Text } = Typography

interface CommentListProps {
    comments: Comment[]
    loading: boolean
}

const CommentList: React.FC<CommentListProps> = ({ comments, loading }) => {
    const glassCardStyle = commentItemCardStyle;
    const secondaryTextStyle = mutedTextStyle;

    if (loading) {
        return (
            <div style={glassCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Spin size="large" />
                </div>
            </div>
        )
    }

    if (comments.length === 0) {
        return (
            <div style={glassCardStyle}>
                <div style={{ textAlign: 'center', padding: '2rem', ...secondaryTextStyle }}>
                    暂无评论，快来发表第一条评论吧！
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.map(comment => (
                <div key={comment.id} style={glassCardStyle}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Avatar
                            src={comment.authorAvatar}
                            icon={<UserOutlined />}
                            size={40}
                            style={{
                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                flexShrink: 0
                            }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '0.5rem',
                                flexWrap: 'wrap'
                            }}>
                                <Text strong style={primaryTextStyle}>
                                    {comment.authorName}
                                </Text>
                                <Space size="small" style={secondaryTextStyle}>
                                    <ClockCircleOutlined />
                                    <Text style={secondaryTextStyle}>
                                        {formatRelativeTime(comment.createdAt)}
                                    </Text>
                                </Space>
                                {comment.likeCount > 0 && (
                                    <Space size="small" style={secondaryTextStyle}>
                                        <LikeOutlined />
                                        <span>{comment.likeCount}</span>
                                    </Space>
                                )}
                                {comment.replyCount > 0 && (
                                    <Space size="small" style={secondaryTextStyle}>
                                        <MessageOutlined />
                                        <span>{comment.replyCount}</span>
                                    </Space>
                                )}
                            </div>

                            <div style={{ marginTop: '0.5rem' }}>
                                <p style={{
                                    ...primaryTextStyle,
                                    whiteSpace: 'pre-wrap',
                                    margin: 0,
                                    lineHeight: '1.6'
                                }}>
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    </div>

                    {comment.replies && comment.replies.length > 0 && (
                        <div style={{
                            marginLeft: '3rem',
                            marginTop: '1rem',
                            paddingLeft: '1rem',
                            borderLeft: '2px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <CommentList comments={comment.replies} loading={false} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default CommentList
