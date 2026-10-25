import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, message, Tooltip, Card, Pagination, Dropdown } from 'antd';
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
    StarOutlined,
    StarFilled,
    MenuOutlined,
    SettingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import { CustomPage, PageType } from '@/types/customPage';
import * as customPageService from '@/services/customPageService';
import { formatDate, formatNumber } from '@/utils/format';
import VerificationModal from '@/components/Common/VerificationModal';

const CustomPageManagement: React.FC = () => {
    usePageTitle('自定义页面管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    });

    const navigate = useNavigate();
    const [pages, setPages] = useState<CustomPage[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // 删除确认模态框状态
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [pageToDelete, setPageToDelete] = useState<CustomPage | null>(null);

    useEffect(() => {
        loadPages();
    }, [currentPage, pageSize, searchText]);

    const loadPages = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage - 1,
                size: pageSize,
                keyword: searchText.trim() || undefined,
                sort: 'updatedAt',
                direction: 'DESC' as const
            };
            const result = await customPageService.getAdminPages(params);
            if (result.success) {
                setPages(result.data.content);
                setTotal(result.data.totalElements);
            }
        } catch (error) {
            console.error('Failed to load pages:', error);
            message.error('加载页面失败');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'publish' | 'unpublish' | 'featured', pageId: string, value?: boolean) => {
        setActionLoading(pageId);
        try {
            if (action === 'publish') {
                await customPageService.publishPage(pageId);
                message.success('页面已发布');
            } else if (action === 'unpublish') {
                await customPageService.unpublishPage(pageId);
                message.success('页面已转为草稿');
            } else if (action === 'featured' && value !== undefined) {
                await customPageService.setFeatured(pageId, value);
                message.success(value ? '已设为推荐页面' : '已取消推荐');
            }
            await loadPages();
        } catch (error) {
            console.error(`Failed to ${action} page:`, error);
            message.error(`操作失败`);
        } finally {
            setActionLoading(null);
        }
    };

    // 显示删除确认模态框
    const showDeleteConfirm = (page: CustomPage) => {
        setPageToDelete(page);
        setDeleteModalVisible(true);
    };

    // 处理删除页面
    const handleDeletePage = async () => {
        if (!pageToDelete) return;

        setDeleteLoading(true);
        try {
            await customPageService.deletePage(pageToDelete.id);
            message.success('页面删除成功');

            if (pages.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                await loadPages();
            }

            // 关闭模态框
            setDeleteModalVisible(false);
            setPageToDelete(null);
        } catch (error) {
            console.error('Failed to delete page:', error);
            message.error('删除失败');
        } finally {
            setDeleteLoading(false);
        }
    };

    // 取消删除
    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
        setPageToDelete(null);
    };

    const getPageTypeTag = (type: PageType) => {
        const typeMap = {
            STATIC: { color: 'blue', text: '静态页面' },
            DYNAMIC: { color: 'green', text: '动态页面' },
            PORTFOLIO: { color: 'purple', text: '作品集' },
            LANDING: { color: 'orange', text: '落地页' },
            REDIRECT: { color: 'red', text: '重定向' }
        };
        return <Tag color={typeMap[type]?.color || 'default'}>{typeMap[type]?.text || type}</Tag>;
    };

    const getStatusTag = (published: boolean) => {
        return (
            <Tag color={published ? 'success' : 'processing'}>
                {published ? '已发布' : '草稿'}
            </Tag>
        );
    };

    const EmptyState = () => (
        <div className="text-center py-16 px-5 bg-white/5 rounded-xl border border-white/10">
            <FileTextOutlined className="text-5xl text-white/60 mb-6" />
            <h3 className="text-white text-xl font-bold mb-3">
                {searchText ? '未找到相关页面' : '暂无自定义页面'}
            </h3>
            <p className="text-white/70 text-base mb-8">
                {searchText ? '请尝试其他关键词' : '创建个性化的自定义页面，展示独特内容'}
            </p>
            {!searchText && (
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/admin/pages/new')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:shadow-lg"
                >
                    创建页面
                </Button>
            )}
        </div>
    );

    const columns: ColumnsType<CustomPage> = [
        {
            title: '页面信息',
            dataIndex: 'title',
            render: (_, record) => (
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            to={record.fullPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-medium hover:text-blue-300 no-underline"
                        >
                            {record.title}
                        </Link>
                        {record.featured && <StarFilled className="text-amber-400" />}
                        {record.showInMenu && <MenuOutlined className="text-green-400" />}
                        {record.hasCustomCode && <SettingOutlined className="text-blue-400" />}
                    </div>
                    <div className="text-xs text-white/60">
                        /{record.slug} • {formatDate(record.updatedAt)}
                    </div>
                    {record.subtitle && (
                        <div className="text-xs text-white/80 mt-1">
                            {record.subtitle}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: '类型',
            dataIndex: 'pageType',
            width: 120,
            align: 'center',
            render: getPageTypeTag
        },
        {
            title: '状态',
            dataIndex: 'published',
            width: 100,
            align: 'center',
            render: getStatusTag
        },
        {
            title: '统计',
            key: 'stats',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <div className="text-xs text-white/80">
                    <div>浏览: {formatNumber(record.viewCount)}</div>
                    <div>分享: {formatNumber(record.shareCount)}</div>
                    {record.popular && <Tag color="gold">热门</Tag>}
                </div>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 160,
            align: 'center',
            render: (_, record) => {
                const menuItems: MenuProps['items'] = [];

                if (!record.published) {
                    menuItems.push({
                        key: 'publish',
                        label: '发布页面',
                        icon: <CloudUploadOutlined />,
                        onClick: () => handleAction('publish', record.id)
                    });
                } else {
                    menuItems.push({
                        key: 'unpublish',
                        label: '转为草稿',
                        icon: <CloudDownloadOutlined />,
                        onClick: () => handleAction('unpublish', record.id)
                    });
                }

                menuItems.push({
                    key: 'featured',
                    label: record.featured ? '取消推荐' : '设为推荐',
                    icon: record.featured ? <StarOutlined /> : <StarFilled />,
                    onClick: () => handleAction('featured', record.id, !record.featured)
                });

                return (
                    <Space>
                        <Tooltip title="编辑">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/admin/pages/edit/${record.id}`)}
                                className="text-white/80 hover:text-white hover:bg-white/10"
                            />
                        </Tooltip>
                        <Tooltip title="预览">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => window.open(record.fullPath, '_blank')}
                                className="text-white/80 hover:text-white hover:bg-white/10"
                            />
                        </Tooltip>
                        <Tooltip title="删除">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => showDeleteConfirm(record)}
                                className="hover:bg-red-500/20"
                            />
                        </Tooltip>
                        {menuItems.length > 0 && (
                            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                                <Button
                                    type="text"
                                    icon={<MoreOutlined />}
                                    loading={actionLoading === record.id}
                                    className="text-white/80 hover:text-white hover:bg-white/10"
                                />
                            </Dropdown>
                        )}
                    </Space>
                );
            }
        },
    ];

    return (
        <div className="p-6 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-white text-3xl font-bold drop-shadow-lg">
                    自定义页面管理
                </h1>
                <Space>
                    <Input.Search
                        placeholder="搜索页面标题、路径..."
                        allowClear
                        onSearch={(value) => {
                            setCurrentPage(1);
                            setSearchText(value);
                        }}
                        enterButton
                        className="w-80"
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => navigate('/admin/pages/new')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:shadow-lg"
                    >
                        新建页面
                    </Button>
                </Space>
            </div>

            <Card
                className="glass-effect border-0 shadow-xl"
                bodyStyle={{
                    padding: '24px',
                    background: 'rgba(35, 35, 35, 0.65)',
                    backdropFilter: 'saturate(180%) blur(15px)',
                    borderRadius: '16px'
                }}
                style={{
                    background: 'rgba(35, 35, 35, 0.65)',
                    backdropFilter: 'saturate(180%) blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px'
                }}
            >
                {pages.length > 0 ? (
                    <>
                        <Table
                            columns={columns}
                            dataSource={pages}
                            loading={loading || !!actionLoading}
                            rowKey="id"
                            pagination={false}
                            className="custom-page-table"
                        />
                        <div className="pt-6 text-center">
                            <Pagination
                                current={currentPage}
                                total={total}
                                pageSize={pageSize}
                                showSizeChanger
                                onChange={(page, size) => {
                                    setCurrentPage(page);
                                    setPageSize(size || 10);
                                }}
                                showTotal={(total, range) => (
                                    <span className="text-white">
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
                onCancel={handleCancelDelete}
                onSubmit={handleDeletePage}
                isSubmitting={deleteLoading}
                title="确认删除页面"
                requireVerification={false}
                okText="确认删除"
                cancelText="取消"
                danger={true}
                content={
                    pageToDelete && (
                        <div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>页面标题：</strong>{pageToDelete.title}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>页面路径：</strong>/{pageToDelete.slug}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>页面类型：</strong>{pageToDelete.pageType === 'STATIC' ? '静态页面' :
                                pageToDelete.pageType === 'DYNAMIC' ? '动态页面' :
                                    pageToDelete.pageType === 'PORTFOLIO' ? '作品集' :
                                        pageToDelete.pageType === 'LANDING' ? '落地页' :
                                            pageToDelete.pageType === 'REDIRECT' ? '重定向' : pageToDelete.pageType}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>发布状态：</strong>{pageToDelete.published ? '已发布' : '草稿'}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 16px 0' }}>
                                <strong>浏览次数：</strong>{formatNumber(pageToDelete.viewCount)}
                            </p>
                            <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>
                                ⚠️ 删除页面是不可逆操作，页面将无法访问，相关数据也会被清除。
                            </p>
                        </div>
                    )
                }
            />
        </div>
    );
};

export default CustomPageManagement;