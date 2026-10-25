import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, message, Tooltip, Card, Pagination, Dropdown, Select, Radio, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    FileTextOutlined,
    MoreOutlined,
    CloudUploadOutlined,
    CloudDownloadOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    PushpinOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import * as adminArticleService from '@/services/adminArticleService';
import type { ArticleListItem } from '@/services/adminArticleService';
import { ArticleStatus, ArticleVisibility } from '@/constants/article';
import { usePageTitle } from "@/hooks/business/usePageTitle.ts";
import VerificationModal from '@/components/Common/VerificationModal';
import { useVerificationCode } from '@/hooks/common/useVerificationCode.ts';

const { Option } = Select;
const { Group: RadioGroup } = Radio;

// 排序选项配置
const SORT_OPTIONS = [
    { label: '置顶优先', value: 'pinned', icon: <PushpinOutlined /> },
    { label: '发布时间', value: 'publishedAt', icon: null },
    { label: '更新时间', value: 'updatedAt', icon: null },
    { label: '浏览量', value: 'viewCount', icon: null },
    { label: '点赞数', value: 'likeCount', icon: null },
    { label: '评论数', value: 'commentCount', icon: null },
    { label: '文章标题', value: 'title', icon: null },
];

const SORT_DIRECTIONS = [
    { label: '降序', value: 'desc', icon: <SortDescendingOutlined /> },
    { label: '升序', value: 'asc', icon: <SortAscendingOutlined /> },
];

interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

const ArticleManagement: React.FC = () => {
    usePageTitle('文章管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki の栖息地'
    });

    const [articles, setArticles] = useState<ArticleListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // 排序状态
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'pinned',
        direction: 'desc'
    });

    // 删除相关状态
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingArticle, setDeletingArticle] = useState<ArticleListItem | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const verificationHook = useVerificationCode();

    // 统一毛玻璃主题配置
    const glassTheme = {
        token: {
            colorText: 'rgba(255, 255, 255, 0.85)',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
            colorTextQuaternary: 'rgba(255, 255, 255, 0.7)',
            colorBgElevated: 'rgba(50, 50, 50, 0.85)',
            borderRadius: 8,
        },
        components: {
            Select: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
                controlItemBgHover: 'rgba(255, 255, 255, 0.1)',
                controlItemBgActive: 'rgba(255, 255, 255, 0.15)',
                colorFillSecondary: 'rgba(255, 255, 255, 0.2)',
                colorText: 'rgba(255, 255, 255, 0.9)',
                optionSelectedBg: 'rgba(54, 209, 220, 0.2)',
            },
            Radio: {
                colorText: 'rgba(255, 255, 255, 0.85)',
                colorPrimary: '#36d1dc',
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
            }
        },
    };

    useEffect(() => {
        loadArticles();
    }, [currentPage, pageSize, searchText, sortConfig]);

    const loadArticles = async () => {
        setLoading(true);
        try {
            // 构建排序参数
            const sortParam = `${sortConfig.field},${sortConfig.direction}`;

            const params = {
                page: currentPage - 1,
                size: pageSize,
                keyword: searchText.trim() || undefined,
                sort: sortParam
            };

            const result = await adminArticleService.getAdminArticles(params);
            if (result.success) {
                setArticles(result.data.content);
                setTotal(result.data.totalElements);
            }
        } catch (error) {
            console.error('Failed to load articles:', error);
            message.error('加载文章列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (field: string, direction?: 'asc' | 'desc') => {
        setSortConfig(prev => ({
            field,
            direction: direction || prev.direction
        }));
        setCurrentPage(1); // 重置到第一页
    };

    const handleSortDirectionChange = (direction: 'asc' | 'desc') => {
        setSortConfig(prev => ({
            ...prev,
            direction
        }));
        setCurrentPage(1);
    };

    const handleAction = async (action: 'publish' | 'unpublish', articleId: string) => {
        setActionLoading(articleId);
        try {
            const actionMap = {
                publish: adminArticleService.publishArticle,
                unpublish: adminArticleService.unpublishArticle,
            };
            const result = await actionMap[action](articleId);
            if (result.success) {
                message.success(`文章已${action === 'publish' ? '发布' : '转为草稿'}`);
                await loadArticles();
            }
        } catch (error) {
            console.error(`Failed to ${action} article:`, error);
        } finally {
            setActionLoading(null);
        }
    };

    // 修改删除逻辑：只显示模态框，不自动发送验证码
    const handleDeleteAttempt = (article: ArticleListItem) => {
        setDeletingArticle(article);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async (verificationCode?: string) => {
        if (!deletingArticle || !verificationCode) {
            message.error('请输入验证码');
            return;
        }

        setDeleteLoading(true);
        try {
            const result = await adminArticleService.deleteArticle(deletingArticle.id, verificationCode);
            if (result.success) {
                message.success(result.message || '文章删除成功');
                setDeleteModalVisible(false);
                setDeletingArticle(null);
                if (articles.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    await loadArticles();
                }
            }
        } catch (error) {
            console.error('Failed to delete article:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
        setDeletingArticle(null);
    };

    const getVisibilityTag = (visibility: ArticleVisibility) => {
        const tagMap = {
            [ArticleVisibility.PUBLIC]: { color: 'green', text: '公开' },
            [ArticleVisibility.LOGIN_REQUIRED]: { color: 'orange', text: '需登录' },
            [ArticleVisibility.ADMIN_ONLY]: { color: 'red', text: '仅管理员' }
        };
        return <Tag color={tagMap[visibility]?.color || 'default'}>{tagMap[visibility]?.text || visibility}</Tag>;
    };

    const getStatusTag = (status: ArticleStatus) => {
        const tagMap = {
            [ArticleStatus.PUBLISHED]: { color: 'success', text: '已发布' },
            [ArticleStatus.DRAFT]: { color: 'processing', text: '草稿' },
            [ArticleStatus.SCHEDULED]: { color: 'warning', text: '待发布' },
            [ArticleStatus.ARCHIVED]: { color: 'default', text: '已归档' }
        };
        return <Tag color={tagMap[status]?.color || 'default'}>{tagMap[status]?.text || status}</Tag>;
    };

    const EmptyState = () => (
        <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <FileTextOutlined style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.6)' }} />
            <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: '24px 0 12px', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                {searchText ? '未找到相关文章' : '暂无文章内容'}
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', marginBottom: '32px' }}>
                {searchText ? '请尝试其他关键词' : '是时候创建第一篇精彩的内容了！'}
            </p>
            {!searchText && <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => window.location.href = '/admin/editor/new'}>创建文章</Button>}
        </div>
    );

    const columns: ColumnsType<ArticleListItem> = [
        {
            title: '标题',
            dataIndex: 'title',
            render: (_, record) => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {record.pinned && (
                            <PushpinOutlined style={{ color: '#ff4d4f', fontSize: '14px' }} title="置顶文章" />
                        )}
                        <a href={`/articles/${record.slug}`} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-blue-300">
                            {record.title}
                        </a>
                    </div>
                    <div className="text-xs text-white/60">by {record.authorName} on {new Date(record.createdAt).toLocaleDateString('ja-JP')}</div>
                </div>
            )
        },
        { title: '状态', dataIndex: 'status', key: 'status', width: 110, align: 'center', render: getStatusTag },
        { title: '可见性', dataIndex: 'visibility', key: 'visibility', width: 120, align: 'center', render: getVisibilityTag },
        {
            title: '统计',
            key: 'stats',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <div className="text-xs text-white/80">
                    <div>浏览: {record.viewCount}</div>
                    <div>点赞: {record.likeCount}</div>
                    <div>评论: {record.commentCount}</div>
                </div>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const menuItems: MenuProps['items'] = [];
                if (record.status === ArticleStatus.DRAFT || record.status === ArticleStatus.ARCHIVED) {
                    menuItems.push({ key: 'publish', label: '发布文章', icon: <CloudUploadOutlined />, onClick: () => handleAction('publish', record.id) });
                }
                if (record.status === ArticleStatus.PUBLISHED) {
                    menuItems.push({ key: 'unpublish', label: '转为草稿', icon: <CloudDownloadOutlined />, onClick: () => handleAction('unpublish', record.id) });
                }

                return (
                    <Space>
                        <Tooltip title="编辑"><Button type="text" icon={<EditOutlined />} onClick={() => window.location.href = `/admin/editor/${record.id}`} /></Tooltip>
                        <Tooltip title="预览"><Button type="text" icon={<EyeOutlined />} onClick={() => window.open(`/articles/${record.slug}`, '_blank')} /></Tooltip>
                        <Tooltip title="删除"><Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteAttempt(record)} /></Tooltip>
                        {menuItems.length > 0 && (
                            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                                <Button type="text" icon={<MoreOutlined />} loading={actionLoading === record.id} />
                            </Dropdown>
                        )}
                    </Space>
                );
            }
        },
    ];

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>文章管理</h1>
                <Space>
                    <Input.Search
                        placeholder="搜索文章..."
                        allowClear
                        onSearch={(value) => { setCurrentPage(1); setSearchText(value); }}
                        enterButton
                        style={{ width: 300 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => window.location.href = '/admin/editor/new'}>
                        新建文章
                    </Button>
                </Space>
            </div>

            {/* 排序控制区域 - 修复样式 */}
            <Card className="glass-effect border-0 shadow-xl" bodyStyle={{ padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>排序:</span>

                    <ConfigProvider theme={glassTheme}>
                        <Select
                            value={sortConfig.field}
                            onChange={(value) => handleSortChange(value)}
                            style={{ width: 140 }}
                            size="small"
                            dropdownStyle={{
                                background: 'rgba(35, 35, 45, 0.95)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px'
                            }}
                        >
                            {SORT_OPTIONS.map(option => (
                                <Option key={option.value} value={option.value}>
                                    <Space>
                                        {option.icon}
                                        {option.label}
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </ConfigProvider>

                    <ConfigProvider theme={glassTheme}>
                        <RadioGroup
                            value={sortConfig.direction}
                            onChange={(e) => handleSortDirectionChange(e.target.value)}
                            size="small"
                        >
                            {SORT_DIRECTIONS.map(direction => (
                                <Radio.Button key={direction.value} value={direction.value}>
                                    <Space>
                                        {direction.icon}
                                        {direction.label}
                                    </Space>
                                </Radio.Button>
                            ))}
                        </RadioGroup>
                    </ConfigProvider>

                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginLeft: '8px' }}>
                        当前: {SORT_OPTIONS.find(opt => opt.value === sortConfig.field)?.label} - {SORT_DIRECTIONS.find(dir => dir.value === sortConfig.direction)?.label}
                    </span>
                </div>
            </Card>

            <Card className="glass-effect border-0 shadow-xl" bodyStyle={{ padding: '24px' }}>
                {articles.length > 0 ? (
                    <>
                        <Table
                            columns={columns}
                            dataSource={articles}
                            loading={loading || !!actionLoading}
                            rowKey="id"
                            pagination={false}
                            style={{ background: 'transparent' }}
                        />
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
                    </>
                ) : (
                    !loading && <EmptyState />
                )}
            </Card>

            {/* 删除确认模态框 */}
            <VerificationModal
                visible={deleteModalVisible}
                onCancel={handleDeleteCancel}
                onSubmit={handleConfirmDelete}
                isSubmitting={deleteLoading}
                title={`删除文章「${deletingArticle?.title}」`}
                content={<p>删除文章是不可逆操作，请输入邮箱收到的验证码进行确认：</p>}
                requireVerification={true}
                verificationHook={verificationHook}
                sendCodeFn={deletingArticle ? () => adminArticleService.sendDeleteArticleCode(deletingArticle.id) : undefined}
                okText="确认删除"
                danger={true}
            />

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

export default ArticleManagement;