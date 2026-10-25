// src/pages/user/Management/UserCommentManagement.tsx
import React from 'react';
import { List, Typography, Spin, Empty, Pagination, Tag, Space, Avatar } from 'antd';
import { ClockCircleOutlined, MessageOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useUserComments } from '@/hooks/api/useUserComments';
import { formatRelativeTime } from '@/utils/format';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import Navbar from '@/components/Common/Navbar';
import PageTitle from '@/components/Common/PageTitle';
import { type UserComment } from '@/services/comments';
import { CommentStatus } from '@/types/comment';
import { userGlassCardStyle } from '@/constants/styles';

const { Text, Paragraph } = Typography;

const getStatusTag = (status: CommentStatus) => {
    const tagMap: Record<string, { color: string; text: string; }> = {
        [CommentStatus.APPROVED]: { color: 'success', text: '已批准' },
        [CommentStatus.PENDING]: { color: 'processing', text: '待审核' },
        [CommentStatus.REJECTED]: { color: 'error', text: '已拒绝' },
        [CommentStatus.SPAM]: { color: 'warning', text: '垃圾评论' },
        [CommentStatus.DELETED]: { color: 'default', text: '已删除' }
    };
    const tagInfo = tagMap[status] || { color: 'default', text: '未知' };
    return <Tag color={tagInfo.color}>{tagInfo.text}</Tag>;
};

const UserCommentManagement: React.FC = () => {
    usePageTitle('我的评论');
    const { comments, loading, total, currentPage, pageSize, fetchUserComments } = useUserComments();

    const handlePageChange = (page: number, size?: number) => {
        fetchUserComments(page, size || pageSize);
    };

    const glassCardStyle = userGlassCardStyle;

    const renderCommentItem = (comment: UserComment) => (
        <List.Item
            key={comment.id}
            style={{ ...glassCardStyle, padding: '1.5rem', marginBottom: '1rem', border: 'none' }}
        >
            <List.Item.Meta
                avatar={
                    <Avatar
                        icon={<MessageOutlined />}
                        size={48}
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '12px' }}
                    />
                }
                title={
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                        在文章
                        <Link to={`/articles/${comment.articleSlug}#comment-${comment.id}`} style={{ color: 'rgba(255, 255, 255, 0.95)', margin: '0 4px', fontWeight: 500 }}>
                            《{comment.articleTitle}》
                        </Link>
                        中发表了评论
                    </Text>
                }
                description={
                    <>
                        <Paragraph
                            style={{ color: 'white', marginTop: '0.75rem', marginBottom: '1rem', lineHeight: 1.7 }}
                            ellipsis={{ rows: 3, expandable: true, symbol: <span style={{color: 'white'}}>展开</span> }}
                        >
                            {comment.content}
                        </Paragraph>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            {getStatusTag(comment.status)}
                            <Space style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                                <ClockCircleOutlined />
                                <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    {formatRelativeTime(comment.createdAt)}
                                </Text>
                            </Space>
                        </div>
                    </>
                }
            />
        </List.Item>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundImage: `url('/background_placeholder.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(2px)',
                zIndex: 1
            }} />

            <div style={{ position: 'relative', zIndex: 10 }}>
                <Navbar />
            </div>

            <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', paddingBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {/* -- 最终修正: 添加 showBreadcrumb={false} 属性 -- */}
                    <PageTitle
                        title="我的评论"
                        subtitle="管理您发表的所有评论"
                        showBreadcrumb={false}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '1000px', padding: '0 1rem' }}>
                        <Spin spinning={loading} style={{ width: '100%' }}>
                            {comments.length > 0 ? (
                                <>
                                    <List
                                        dataSource={comments}
                                        renderItem={renderCommentItem}
                                        split={false}
                                        style={{ background: 'transparent' }}
                                    />
                                    {total > pageSize && (
                                        <div style={{ ...glassCardStyle, padding: '1rem', marginTop: '1rem', textAlign: 'center' }}>
                                            <Pagination
                                                current={currentPage}
                                                pageSize={pageSize}
                                                total={total}
                                                onChange={handlePageChange}
                                                showSizeChanger={false}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                !loading && (
                                    <div style={glassCardStyle}>
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>您还没有发表过任何评论</Text>}
                                            style={{ padding: '4rem 0' }}
                                        />
                                    </div>
                                )
                            )}
                        </Spin>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCommentManagement;
