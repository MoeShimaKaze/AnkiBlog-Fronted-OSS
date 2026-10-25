// src/pages/admin/Content/CommentManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Space, Tag, message, Tooltip, Card, Pagination, Select, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EyeOutlined,
    StopOutlined,
    ExclamationCircleOutlined,
    MoreOutlined,
    LikeOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDebounce } from 'ahooks';

import * as adminCommentService from '@/services/adminCommentService';
import type { CommentAdminListItem } from '@/services/adminCommentService';
import { CommentStatus } from '@/services/adminCommentService';
import { usePageTitle } from "@/hooks/business/usePageTitle.ts";
import VerificationModal from '@/components/Common/VerificationModal';

const { Option } = Select;

const CommentManagement: React.FC = () => {
    usePageTitle('评论管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki的歇脚处'
    })
    const [comments, setComments] = useState<CommentAdminListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // 筛选条件
    const [statusFilter, setStatusFilter] = useState<CommentStatus | undefined>();
    const [searchKeyword, setSearchKeyword] = useState('');
    const debouncedKeyword = useDebounce(searchKeyword, { wait: 500 });

    // 确认模态框状态
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'spam' | 'delete' | null>(null);
    const [currentComment, setCurrentComment] = useState<CommentAdminListItem | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const params: adminCommentService.GetAdminCommentsParams = {
                page: currentPage - 1,
                size: pageSize,
                sort: 'createdAt,desc',
                status: statusFilter,
                keyword: debouncedKeyword.trim() || undefined,
            };
            const res = await adminCommentService.getAdminComments(params);
            if (res.success) {
                setComments(res.data.content);
                setTotal(res.data.totalElements);
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, statusFilter, debouncedKeyword]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const showConfirm = (action: 'approve' | 'reject' | 'spam' | 'delete', record: CommentAdminListItem) => {
        setConfirmAction(action);
        setCurrentComment(record);
        setConfirmModalVisible(true);
        if (action !== 'reject') {
            setRejectionReason('');
        }
    };

    const handleConfirmSubmit = async () => {
        if (!confirmAction || !currentComment) return;

        setActionLoading(true);
        try {
            let res;
            switch (confirmAction) {
                case 'approve':
                    res = await adminCommentService.approveComment(currentComment.id);
                    break;
                case 'reject':
                    res = await adminCommentService.rejectComment(currentComment.id, rejectionReason);
                    break;
                case 'spam':
                    res = await adminCommentService.markAsSpam(currentComment.id);
                    break;
                case 'delete':
                    res = await adminCommentService.deleteComment(currentComment.id);
                    break;
            }
            if (res.success) {
                message.success(res.message || '操作成功');
                setConfirmModalVisible(false);
                setCurrentComment(null);
                setConfirmAction(null);
                setRejectionReason('');
                await loadComments();
            }
        } catch (error) {
            console.error(`Action ${confirmAction} failed:`, error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmCancel = () => {
        setConfirmModalVisible(false);
        setCurrentComment(null);
        setConfirmAction(null);
        setRejectionReason('');
    };

    const getConfirmContent = () => {
        if (!confirmAction || !currentComment) return null;

        const actionTexts = {
            approve: { title: '批准评论', content: '批准后，该评论将对用户可见。' },
            reject: { title: '拒绝评论', content: '拒绝后，该评论将对用户不可见。' },
            spam: { title: '标记为垃圾', content: '该评论及其作者可能会被系统进一步分析处理。' },
            delete: { title: '删除评论', content: '评论将被移入回收站，后续可进行恢复或永久删除。' }
        };

        const actionInfo = actionTexts[confirmAction];

        return (
            <div>
                <p>{actionInfo.content}</p>
                {confirmAction === 'reject' && (
                    <div style={{ marginTop: '16px' }}>
                        <label style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            display: 'block',
                            marginBottom: '8px'
                        }}>
                            拒绝理由（可选）：
                        </label>
                        <Input.TextArea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="此理由将对评论作者可见"
                            rows={3}
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                            }}
                        />
                    </div>
                )}
            </div>
        );
    };

    const getStatusTag = (status: CommentStatus) => {
        const tagMap: Record<CommentStatus, { color: string; text: string; icon: React.ReactNode }> = {
            [CommentStatus.APPROVED]: { color: 'success', text: '已批准', icon: <CheckCircleOutlined/> },
            [CommentStatus.PENDING]: { color: 'processing', text: '待审核', icon: <ClockCircleOutlined/> },
            [CommentStatus.REJECTED]: { color: 'error', text: '已拒绝', icon: <StopOutlined/> },
            [CommentStatus.SPAM]: { color: 'warning', text: '垃圾评论', icon: <ExclamationCircleOutlined/> },
            [CommentStatus.DELETED]: { color: 'default', text: '回收站', icon: <DeleteOutlined /> }
        };

        const tagInfo = tagMap[status] || { color: 'default', text: '未知', icon: null };
        return <Tag color={tagInfo.color} icon={tagInfo.icon}>{tagInfo.text}</Tag>;
    };

    const columns: ColumnsType<CommentAdminListItem> = [
        {
            title: '作者',
            dataIndex: 'authorName',
            width: 180,
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Space><Avatar src={record.authorAvatar} size="small">{record.authorName[0]}</Avatar> <span>{record.authorName}</span></Space>
                    <span style={{color: 'gray', fontSize: 12}}>{record.ipAddress}</span>
                </Space>
            ),
        },
        {
            title: '评论内容',
            dataIndex: 'content',
            render: (text, record) => (
                <div>
                    <div style={{ maxWidth: 400, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{text}</div>
                    <Space size="middle" style={{color: 'gray', fontSize: 12}}>
                        <span><LikeOutlined /> {record.likeCount}</span>
                        <span><MessageOutlined /> {record.replyCount}</span>
                    </Space>
                </div>
            )
        },
        {
            title: '关联内容',
            width: 200,
            render: (_, record) => (
                <a href={`/articles/${record.articleSlug}`} target="_blank" rel="noopener noreferrer" style={{fontSize: 13}}>
                    <Tooltip title={record.articleTitle}>{record.articleTitle}</Tooltip> <EyeOutlined />
                </a>
            ),
        },
        { title: '状态', dataIndex: 'status', align: 'center', width: 120, render: getStatusTag },
        { title: '提交于', dataIndex: 'createdAt', align: 'center', width: 160, render: (text) => new Date(text).toLocaleString('zh-CN') },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 80,
            render: (_, record) => {
                const menuItems: MenuProps['items'] = [];

                if (record.status !== CommentStatus.APPROVED) {
                    menuItems.push({ key: 'approve', label: '批准', icon: <CheckCircleOutlined />, onClick: () => showConfirm('approve', record) });
                }
                if (record.status !== CommentStatus.REJECTED) {
                    menuItems.push({ key: 'reject', label: '拒绝', icon: <StopOutlined />, onClick: () => showConfirm('reject', record) });
                }
                if (record.status !== CommentStatus.SPAM) {
                    menuItems.push({ key: 'spam', label: '标为垃圾', icon: <ExclamationCircleOutlined />, onClick: () => showConfirm('spam', record) });
                }
                if (record.status !== CommentStatus.DELETED) {
                    menuItems.push({ type: 'divider' });
                    menuItems.push({ key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true, onClick: () => showConfirm('delete', record) });
                }

                return (
                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        disabled={menuItems.length === 0}
                        dropdownRender={(menu) => (
                            <div style={{
                                background: 'rgba(35, 35, 35, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                            }}>
                                {menu}
                            </div>
                        )}
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            style={{
                                background: 'rgba(35, 35, 35, 0.75)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                borderRadius: '8px',
                                width: '32px',
                                height: '32px'
                            }}
                        />
                    </Dropdown>
                );
            }
        },
    ];

    const getModalTitle = () => {
        if (!confirmAction) return '';
        const titleMap = {
            approve: '批准评论',
            reject: '拒绝评论',
            spam: '标记为垃圾',
            delete: '删除评论'
        };
        return titleMap[confirmAction];
    };

    const getOkText = () => {
        if (!confirmAction) return '确认';
        const textMap = {
            approve: '批准',
            reject: '拒绝',
            spam: '标为垃圾',
            delete: '删除'
        };
        return textMap[confirmAction];
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>评论管理</h1>
                <Space>
                    <Select
                        placeholder="筛选状态"
                        allowClear
                        style={{ width: 150 }}
                        onChange={(value) => { setCurrentPage(1); setStatusFilter(value); }}
                    >
                        <Option value={CommentStatus.PENDING}>待审核</Option>
                        <Option value={CommentStatus.APPROVED}>已批准</Option>
                        <Option value={CommentStatus.REJECTED}>已拒绝</Option>
                        <Option value={CommentStatus.SPAM}>垃圾评论</Option>
                        <Option value={CommentStatus.DELETED}>回收站</Option>
                    </Select>
                    <Input.Search
                        placeholder="搜索内容、作者、IP"
                        allowClear
                        style={{ width: 250 }}
                        onSearch={(value) => { setCurrentPage(1); setSearchKeyword(value); }}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        enterButton
                    />
                </Space>
            </div>
            <Card className="glass-effect border-0 shadow-xl" bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={comments}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    style={{ background: 'transparent' }}
                />
                {total > 0 && (
                    <div className="pt-6 text-center">
                        <Pagination
                            current={currentPage}
                            total={total}
                            pageSize={pageSize}
                            showSizeChanger
                            onChange={setCurrentPage}
                            onShowSizeChange={(_, size) => setPageSize(size)}
                            showTotal={(total, range) => (
                                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                            第 {range[0]}-{range[1]} 条，共 {total} 条
                                        </span>
                            )}
                            className="custom-pagination"
                        />
                    </div>
                )}
            </Card>

            {/* 确认操作模态框 */}
            <VerificationModal
                visible={confirmModalVisible}
                onCancel={handleConfirmCancel}
                onSubmit={handleConfirmSubmit}
                isSubmitting={actionLoading}
                title={getModalTitle()}
                content={getConfirmContent()}
                requireVerification={false}
                okText={getOkText()}
                danger={confirmAction === 'delete' || confirmAction === 'spam'}
            />

            <style>{`
                .ant-dropdown-menu {
                    background: rgba(35, 35, 35, 0.95) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                }
                .ant-dropdown-menu-item {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .ant-dropdown-menu-item:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
            `}</style>

            {/* 自定义样式 */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    /* 分页样式 */
                    .custom-pagination .ant-pagination-item {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    }
                    .custom-pagination .ant-pagination-item a {
                        color: rgba(255, 255, 255, 0.9) !important;
                    }
                    .custom-pagination .ant-pagination-item-active {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                        border: none !important;
                    }
                    .custom-pagination .ant-pagination-item-active a {
                        color: white !important;
                    }
                    .custom-pagination .ant-pagination-prev,
                    .custom-pagination .ant-pagination-next {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    }
                    .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
                    .custom-pagination .ant-pagination-next .ant-pagination-item-link {
                        color: rgba(255, 255, 255, 0.9) !important;
                        background: transparent !important;
                        border: none !important;
                    }
                    .custom-pagination .ant-select-single .ant-select-selector {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                        border-radius: 6px !important;
                    }
                    .custom-pagination .ant-select-arrow {
                        color: rgba(255, 255, 255, 0.7) !important;
                    }
                    .custom-pagination .ant-select-dropdown {
                        background: rgba(30, 30, 30, 0.95) !important;
                        backdrop-filter: blur(20px) !important;
                        border: 1px solid rgba(255, 255, 255, 0.2) !important;
                        border-radius: 8px !important;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
                    }
                    .custom-pagination .ant-select-item {
                        color: rgba(255, 255, 255, 0.9) !important;
                        background: transparent !important;
                    }
                    .custom-pagination .ant-select-item:hover {
                        background: rgba(255, 255, 255, 0.1) !important;
                    }
                    .custom-pagination .ant-select-item-option-selected {
                        background: rgba(59, 130, 246, 0.3) !important;
                        color: white !important;
                    }
                `
            }} />
        </div>
    );
};

export default CommentManagement;