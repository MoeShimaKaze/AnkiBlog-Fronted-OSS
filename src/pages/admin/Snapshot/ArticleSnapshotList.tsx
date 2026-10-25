// src/pages/admin/Snapshot/ArticleSnapshotList.tsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Input,
    Space,
    Typography,
    Image,
    Tag,
    Pagination
} from 'antd';
import {
    ArrowLeftOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ArticleSnapshotManagement from './ArticleSnapshotManagement';
import * as adminArticleService from '@/services/adminArticleService';
import type { ArticleListItem } from '@/services/adminArticleService';
import { ArticleStatus } from '@/constants/article';
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";
import { elevatedGlassCardStyle } from '@/constants/styles';

const { Title } = Typography;

const ArticleSnapshotList: React.FC = () => {
    usePageTitle('文章快照列表', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const [articles, setArticles] = useState<ArticleListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedArticle, setSelectedArticle] = useState<ArticleListItem | null>(null);

    useEffect(() => {
        loadArticles();
    }, [currentPage, pageSize, searchText]);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage - 1,
                size: pageSize,
                keyword: searchText.trim() || undefined
            };
            const result = await adminArticleService.getAdminArticles(params);
            if (result.success) {
                setArticles(result.data.content);
                setTotal(result.data.totalElements);
            }
        } catch (error) {
            console.error('Failed to load articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSnapshots = (article: ArticleListItem) => {
        setSelectedArticle(article);
    };

    const handleBackToList = () => {
        setSelectedArticle(null);
    };

    const getStatusTag = (status: string) => {
        const statusMap = {
            [ArticleStatus.PUBLISHED]: { color: 'green', text: '已发布' },
            [ArticleStatus.DRAFT]: { color: 'blue', text: '草稿' },
            [ArticleStatus.SCHEDULED]: { color: 'orange', text: '待发布' },
            [ArticleStatus.ARCHIVED]: { color: 'default', text: '已归档' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    };

    const columns: ColumnsType<ArticleListItem> = [
        {
            title: '文章',
            dataIndex: 'title',
            render: (_, record) => (
                <Space>
                    <Image
                        width={50}
                        height={50}
                        src={record.coverImage || '/placeholder-article.jpg'}
                        style={{ borderRadius: '8px' }}
                        preview={false}
                        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj7wn5OPPC90ZXh0Pjwvc3ZnPg=="
                    />
                    <div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500 }}>
                            {record.title}
                        </div>
                        {record.excerpt && (
                            <div style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                marginTop: '4px',
                                maxWidth: '300px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {record.excerpt}
                            </div>
                        )}
                    </div>
                </Space>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: getStatusTag
        },
        {
            title: '作者',
            dataIndex: 'authorName',
            width: 120,
            render: (authorName) => (
                <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {authorName || '未知'}
                </span>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: 150,
            render: (time) => (
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {new Date(time).toLocaleDateString('zh-CN')}
                </span>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => handleViewSnapshots(record)}
                    style={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                        border: 'none',
                        borderRadius: '20px',
                        boxShadow: '0 3px 12px rgba(255, 107, 107, 0.4)',
                        fontWeight: 'bold',
                        color: 'white',
                        minWidth: '40px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    查看快照
                </Button>
            )
        },
    ];

    if (selectedArticle) {
        return (
            <div style={{
                padding: '24px',
                minHeight: '100vh',
                background: 'transparent'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBackToList}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: 500
                        }}
                    >
                        返回文章列表
                    </Button>
                </div>
                <ArticleSnapshotManagement
                    articleId={selectedArticle.id}
                    articleTitle={selectedArticle.title}
                />
            </div>
        );
    }

    const EmptyState = () => (
        <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <FileTextOutlined style={{
                    fontSize: '48px',
                    color: 'rgba(255, 255, 255, 0.6)'
                }} />
            </div>
            <h3 style={{
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '12px',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
            }}>
                {searchText ? '未找到相关文章' : '暂无文章'}
            </h3>
            <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                marginBottom: '0',
                lineHeight: '1.5',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
            }}>
                {searchText
                    ? `搜索 "${searchText}" 没有找到匹配的文章`
                    : '暂时没有文章可以查看快照'
                }
            </p>
        </div>
    );

    return (
        <div style={{
            padding: '24px',
            minHeight: '100vh',
            background: 'transparent'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <Title level={2} style={{
                        color: 'white',
                        margin: 0,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}>
                        文章快照管理
                    </Title>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: '8px 0 0 0',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.6)'
                    }}>
                        选择文章查看版本快照记录
                    </p>
                </div>
                <Input.Search
                    placeholder="搜索文章标题..."
                    allowClear
                    onSearch={(value) => {
                        setCurrentPage(1);
                        setSearchText(value);
                    }}
                    enterButton
                    style={{ width: 300 }}
                />
            </div>

            <Card
                style={elevatedGlassCardStyle}
                bodyStyle={{ padding: '24px' }}
                bordered={false}
            >
                {articles.length > 0 || loading ? (
                    <>
                        <Table
                            columns={columns}
                            dataSource={articles}
                            loading={loading}
                            rowKey="id"
                            pagination={false}
                            style={{ background: 'transparent' }}
                            rowClassName={() => 'glass-table-row'}
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
                    </>
                ) : (
                    <EmptyState />
                )}
            </Card>

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

export default ArticleSnapshotList;
