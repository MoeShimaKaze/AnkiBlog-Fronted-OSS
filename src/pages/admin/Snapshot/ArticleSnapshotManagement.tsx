// src/pages/admin/Snapshot/ArticleSnapshotManagement.tsx
import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Input,
    message,
    Tooltip,
    Card,
    Pagination,
    Popconfirm,
    ConfigProvider
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    HistoryOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useArticleSnapshots } from '@/hooks/api/useSnapshots';
import { SnapshotTypeLabels, SnapshotTypeColors } from '@/types/snapshot';
import type { ArticleSnapshot } from '@/types/snapshot';
import SnapshotPreview from './SnapshotPreview';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import { elevatedGlassCardStyle } from '@/constants/styles';

const { TextArea } = Input;

interface ArticleSnapshotManagementProps {
    articleId: string;
    articleTitle?: string;
}

const ArticleSnapshotManagement: React.FC<ArticleSnapshotManagementProps> = ({
                                                                                 articleId,
                                                                                 articleTitle
                                                                             }) => {
    const {
        snapshots,
        loading,
        total,
        fetchSnapshots,
        createSnapshot,
        deleteSnapshot
    } = useArticleSnapshots(articleId);
    usePageTitle('文章快照管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [selectedSnapshot, setSelectedSnapshot] = useState<ArticleSnapshot | null>(null);
    const [description, setDescription] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchSnapshots({
            page: currentPage - 1,
            size: pageSize,
            sort: 'versionNumber',
            direction: 'DESC'
        });
    }, [currentPage, pageSize, fetchSnapshots]);

    const handleCreateSnapshot = async () => {
        setActionLoading('create');
        try {
            await createSnapshot(description.trim() || undefined);
            setCreateModalVisible(false);
            setDescription('');
            message.success('快照创建成功！');
        } catch (error) {
            console.error('Create snapshot failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteSnapshot = async (snapshot: ArticleSnapshot) => {
        setActionLoading(snapshot.id);
        try {
            await deleteSnapshot(snapshot.id);
            message.success('快照删除成功！');
        } catch (error) {
            console.error('Delete snapshot failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePreviewSnapshot = (snapshot: ArticleSnapshot) => {
        setSelectedSnapshot(snapshot);
        setPreviewModalVisible(true);
    };

    const getStatusTag = (snapshotType: string) => {
        const type = snapshotType as keyof typeof SnapshotTypeLabels;
        return (
            <Tag color={SnapshotTypeColors[type] || 'default'}>
                {SnapshotTypeLabels[type] || snapshotType}
            </Tag>
        );
    };

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
                <HistoryOutlined style={{
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
                暂无快照记录
            </h3>
            <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                marginBottom: '32px',
                lineHeight: '1.5',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
            }}>
                创建第一个快照来保存文章的当前状态！<br />
                快照可以帮助您回溯文章的历史版本。
            </p>
            <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
                style={{
                    background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(54, 209, 220, 0.4)',
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px',
                    borderRadius: '24px'
                }}
            >
                创建第一个快照
            </Button>
        </div>
    );

    const columns: ColumnsType<ArticleSnapshot> = [
        {
            title: '版本',
            dataIndex: 'versionNumber',
            width: 80,
            render: (version) => (
                <span style={{
                    color: '#36d1dc',
                    fontWeight: 600,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    fontSize: '16px'
                }}>
                    v{version}
                </span>
            )
        },
        {
            title: '快照类型',
            dataIndex: 'snapshotType',
            width: 120,
            render: getStatusTag
        },
        {
            title: '标题',
            dataIndex: 'title',
            render: (title, record) => (
                <div>
                    <div style={{
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 500,
                        marginBottom: '4px'
                    }}>
                        {title}
                    </div>
                    {record.description && (
                        <div style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontStyle: 'italic'
                        }}>
                            {record.description}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: '创建者',
            dataIndex: 'createdByName',
            width: 120,
            render: (name) => (
                <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {name || '系统'}
                </span>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: 150,
            render: (time) => (
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {new Date(time).toLocaleString('zh-CN')}
                </span>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="预览快照">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handlePreviewSnapshot(record)}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '6px',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                color: 'white'
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="确认删除"
                        description={`删除操作不可逆，确定要删除这个${SnapshotTypeLabels[record.snapshotType as keyof typeof SnapshotTypeLabels] || '快照'}吗？`}
                        onConfirm={() => handleDeleteSnapshot(record)}
                        okText="确认"
                        cancelText="取消"
                        okButtonProps={{
                            style: {
                                background: '#ff4d4f',
                                borderColor: '#ff4d4f',
                                color: 'white'
                            }
                        }}
                        cancelButtonProps={{
                            style: {
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                color: 'white'
                            }
                        }}
                        overlayStyle={{
                            background: 'rgba(35, 35, 35, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                        overlayInnerStyle={{
                            background: 'transparent',
                            color: 'white'
                        }}
                    >
                        <Tooltip title="删除快照">
                            <Button
                                type="primary"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                loading={actionLoading === record.id}
                                style={{
                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                                }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    // 自定义分页样式
    const paginationTheme = {
        token: {
            colorPrimary: '#36d1dc',
            colorText: 'white',
            colorTextDisabled: 'rgba(255, 255, 255, 0.4)',
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            colorBgTextHover: 'rgba(54, 209, 220, 0.2)',
            colorBgTextActive: 'rgba(54, 209, 220, 0.3)',
        },
        components: {
            Pagination: {
                itemBg: 'rgba(255, 255, 255, 0.1)',
                itemActiveBg: '#36d1dc',
                itemInputBg: 'rgba(255, 255, 255, 0.1)',
                itemLinkBg: 'rgba(255, 255, 255, 0.1)',
                itemSize: 32,
            }
        }
    };

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
                    <h1 style={{
                        color: 'white',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        margin: 0,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}>
                        文章快照管理
                    </h1>
                    {articleTitle && (
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            margin: '8px 0 0 0',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.6)'
                        }}>
                            <FileTextOutlined style={{ marginRight: '8px' }} />
                            {articleTitle}
                        </p>
                    )}
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setCreateModalVisible(true)}
                    style={{
                        background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 15px rgba(54, 209, 220, 0.4)',
                        height: '40px',
                        padding: '0 24px',
                        fontWeight: 'bold'
                    }}
                >
                    创建快照
                </Button>
            </div>

            <Card
                style={elevatedGlassCardStyle}
                bodyStyle={{ padding: '24px' }}
                bordered={false}
            >
                {snapshots.length > 0 || loading ? (
                    <>
                        <Table
                            columns={columns}
                            dataSource={snapshots}
                            loading={loading}
                            rowKey="id"
                            pagination={false}
                            style={{ background: 'transparent' }}
                            rowClassName={() => 'glass-table-row'}
                        />
                        {total > 0 && (
                            <div style={{ padding: '24px 0 0', textAlign: 'center' }}>
                                <ConfigProvider theme={paginationTheme}>
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
                                </ConfigProvider>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState />
                )}
            </Card>

            {/* 创建快照模态框 */}
            <Modal
                title={
                    <span style={{ color: 'white', fontWeight: 'bold' }}>
                        创建快照
                    </span>
                }
                open={createModalVisible}
                onOk={handleCreateSnapshot}
                onCancel={() => {
                    setCreateModalVisible(false);
                    setDescription('');
                }}
                confirmLoading={actionLoading === 'create'}
                okText="创建"
                cancelText="取消"
                okButtonProps={{
                    style: {
                        background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold'
                    }
                }}
                cancelButtonProps={{
                    style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        fontWeight: 'bold'
                    }
                }}
                style={{
                    top: '20%'
                }}
                styles={{
                    mask: {
                        backdropFilter: 'blur(8px)'
                    },
                    content: {
                        background: 'rgba(35, 35, 35, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px'
                    },
                    header: {
                        background: 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    },
                    body: {
                        background: 'transparent'
                    }
                }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 500,
                        color: 'white'
                    }}>
                        快照描述（可选）
                    </label>
                    <TextArea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="请输入快照描述，方便后续识别和回溯..."
                        rows={3}
                        maxLength={200}
                        showCount
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '6px',
                            color: 'white'
                        }}
                    />
                    <div style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginTop: '8px'
                    }}>
                        描述信息将帮助您更好地识别不同的快照版本
                    </div>
                </div>
            </Modal>

            {/* 快照预览模态框 */}
            <Modal
                title={
                    selectedSnapshot ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                            <HistoryOutlined />
                            <span>快照预览 - v{selectedSnapshot.versionNumber}</span>
                            {getStatusTag(selectedSnapshot.snapshotType)}
                        </div>
                    ) : '快照预览'
                }
                open={previewModalVisible}
                onCancel={() => {
                    setPreviewModalVisible(false);
                    setSelectedSnapshot(null);
                }}
                footer={null}
                width={1000}
                centered
                styles={{
                    mask: {
                        backdropFilter: 'blur(8px)'
                    },
                    content: {
                        background: 'rgba(35, 35, 35, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px'
                    },
                    header: {
                        background: 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    },
                    body: {
                        background: 'transparent'
                    }
                }}
            >
                {selectedSnapshot && (
                    <SnapshotPreview
                        snapshot={selectedSnapshot}
                        type="article"
                    />
                )}
            </Modal>

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

export default ArticleSnapshotManagement;
