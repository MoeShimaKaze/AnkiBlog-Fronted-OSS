    import React, { useState, useEffect, useCallback } from 'react';
    import { Table, Button, Space, Tag, message, Tooltip, Card, Image, Pagination, Switch } from 'antd';
    import {PlusOutlined, EditOutlined, DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
    import type { ColumnsType } from 'antd/es/table';

    // 确保以下文件的路径在您的项目中是正确的
    import * as adminProductService from '@/services/adminProductService';
    import type { ProductListItem, ProductFilterParams } from '@/services/adminProductService';
    import { ProductStatus } from '@/types/product';
    import { usePageTitle } from "@/hooks/business/usePageTitle.ts";
    import VerificationModal from '@/components/Common/VerificationModal';
    import { useVerificationCode } from '@/hooks/common/useVerificationCode.ts';
    import ProductFilterBar from '@/components/Product/ProductFilterBar';

    const ProductManagement: React.FC = () => {
        usePageTitle('商品管理', {
            siteName: 'AnkiBlog',
            siteTagline: 'Anki的歇脚处'
        })
        const [products, setProducts] = useState<ProductListItem[]>([]);
        const [loading, setLoading] = useState(false);
        const [actionLoading, setActionLoading] = useState<string | null>(null);
        const [total, setTotal] = useState(0);
        const [currentPage, setCurrentPage] = useState(1);
        const [pageSize, setPageSize] = useState(10);
        const [filters, setFilters] = useState<Partial<ProductFilterParams>>({});

        // 删除相关状态
        const [deleteModalVisible, setDeleteModalVisible] = useState(false);
        const [deletingProduct, setDeletingProduct] = useState<ProductListItem | null>(null);
        const [deleteLoading, setDeleteLoading] = useState(false);
        const verificationHook = useVerificationCode();

        const loadProducts = useCallback(async () => {
            setLoading(true);
            try {
                const params: ProductFilterParams = {
                    page: currentPage - 1,
                    size: pageSize,
                    ...filters
                };
                const result = await adminProductService.getAdminProducts(params);
                if (result.success) {
                    setProducts(result.data.content);
                    setTotal(result.data.totalElements);
                }
            } catch (error) {
                console.error('Failed to load products:', error);
                message.error('加载商品列表失败');
            } finally {
                setLoading(false);
            }
        }, [currentPage, pageSize, filters]);

        useEffect(() => {
            loadProducts();
        }, [loadProducts]);

        const handleFilterChange = (newFilters: Partial<ProductFilterParams>) => {
            setCurrentPage(1);
            setFilters(newFilters);
        };

        const handleDeleteAttempt = (product: ProductListItem) => {
            setDeletingProduct(product);
            setDeleteModalVisible(true);
        };

        const handleConfirmDelete = async (verificationCode?: string) => {
            if (!deletingProduct || !verificationCode) {
                message.error('请输入验证码');
                return;
            }

            setDeleteLoading(true);
            try {
                await adminProductService.deleteProduct(deletingProduct.id, verificationCode);
                message.success('商品删除成功');
                setDeleteModalVisible(false);
                setDeletingProduct(null);
                await loadProducts();
            } catch (error) {
                console.error('Delete failed:', error);
                message.error('删除失败');
            } finally {
                setDeleteLoading(false);
            }
        };

        const handleDeleteCancel = () => {
            setDeleteModalVisible(false);
            setDeletingProduct(null);
        };

        const handleToggleFeatured = async (product: ProductListItem) => {
            setActionLoading(product.id);
            try {
                await adminProductService.toggleFeaturedProduct(product.id);
                message.success(`商品 "${product.name}" 已${!product.featured ? '设为' : '取消'}精选`);
                await loadProducts();
            } catch (error) {
                console.error('Toggle featured failed:', error);
                message.error('操作失败');
            } finally {
                setActionLoading(null);
            }
        };

        const getStatusTag = (status: ProductStatus) => {
            const statusMap = { ACTIVE: { color: 'green', text: '上架中' }, INACTIVE: { color: 'red', text: '已下架' }, DRAFT: { color: 'blue', text: '草稿' }, FEATURED: { color: 'gold', text: '热销中' } };
            return <Tag color={statusMap[status]?.color || 'default'}>{statusMap[status]?.text || status}</Tag>;
        };

        const EmptyState = () => (
            <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    width: '120px', height: '120px', margin: '0 auto 24px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <ShoppingOutlined style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.6)' }} />
                </div>
                <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                    {Object.keys(filters).length > 0 ? '未找到相关商品' : '暂无商品'}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', marginBottom: '32px', lineHeight: '1.5', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                    {Object.keys(filters).length > 0 ? '请尝试调整筛选条件' : '开始添加优质商品，为访客提供有价值的推荐内容！'}
                </p>
                {Object.keys(filters).length === 0 && (
                    <Button
                        type="primary" size="large" icon={<PlusOutlined />}
                        style={{ background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)', border: 'none', boxShadow: '0 4px 15px rgba(54, 209, 220, 0.4)',
                            height: '48px', padding: '0 32px', fontSize: '16px'
                        }}
                        onClick={() => window.location.href = '/admin/products/new'}
                    >
                        添加第一个商品
                    </Button>
                )}
            </div>
        );

        const columns: ColumnsType<ProductListItem> = [
            {
                title: '商品',
                dataIndex: 'name',
                render: (_, record) => (
                    <Space>
                        <Image width={50} height={50} src={record.mainImage || '/placeholder-product.jpg'} style={{ borderRadius: '8px' }} />
                        <div>
                            <a href={`/products/${record.slug}`} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-blue-300">{record.name}</a>
                            <div className="text-xs text-white/60">{record.categoryName}</div>
                        </div>
                    </Space>
                )
            },
            { title: '价格', dataIndex: 'price', width: 120, render: (price) => <span className="text-green-400 font-semibold">¥{price.toFixed(2)}</span> },
            { title: '状态', dataIndex: 'status', width: 100, render: getStatusTag },
            { title: '点击量', dataIndex: 'clickCount', width: 100 },
            { title: '精选', dataIndex: 'featured', width: 80, render: (isFeatured, record) => <Switch checked={isFeatured} loading={actionLoading === record.id} onChange={() => handleToggleFeatured(record)} /> },
            { title: '创建时间', dataIndex: 'createdAt', width: 150, render: (time) => new Date(time).toLocaleDateString() },
            {
                title: '操作',
                key: 'action',
                width: 150,
                align: 'center',
                render: (_, record) => (
                    <Space>
                        <Tooltip title="编辑"><Button type="text" icon={<EditOutlined />} onClick={() => window.location.href = `/admin/products/edit/${record.id}`} /></Tooltip>
                        <Tooltip title="删除"><Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteAttempt(record)} /></Tooltip>
                    </Space>
                )
            },
        ];

        return (
            <div style={{ padding: '24px', minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>商品管理</h1>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => window.location.href = '/admin/products/new'}>新增商品</Button>
                </div>

                {/* 筛选栏 */}
                <ProductFilterBar
                    onFilterChange={handleFilterChange}
                    showPriceRange={true}
                    defaultCollapsed={true}
                />

                <Card className="glass-effect border-0 shadow-xl" bodyStyle={{ padding: '24px' }}>
                    {products.length > 0 || loading ? (
                        <>
                            <Table columns={columns} dataSource={products} loading={loading} rowKey="id" pagination={false} style={{ background: 'transparent' }} />
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

                {/* 删除确认模态框 */}
                <VerificationModal
                    visible={deleteModalVisible}
                    onCancel={handleDeleteCancel}
                    onSubmit={handleConfirmDelete}
                    isSubmitting={deleteLoading}
                    title={`删除商品「${deletingProduct?.name}」`}
                    content={<p>删除操作不可逆，请输入发送到您邮箱的验证码以确认：</p>}
                    requireVerification={true}
                    verificationHook={verificationHook}
                    sendCodeFn={deletingProduct ? () => adminProductService.sendDeleteProductCode(deletingProduct.id) : undefined}
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

    export default ProductManagement;