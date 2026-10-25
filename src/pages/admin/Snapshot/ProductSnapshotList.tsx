// src/pages/admin/Snapshot/ProductSnapshotList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    Image,
    Tag,
    Pagination,
    ConfigProvider
} from 'antd';
import {
    ArrowLeftOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ProductSnapshotManagement from './ProductSnapshotManagement';
import * as adminProductService from '@/services/adminProductService';
import type { ProductFilterParams } from '@/services/adminProductService';
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";
import ProductFilterBar from '@/components/Product/ProductFilterBar';
import { elevatedGlassCardStyle } from '@/constants/styles';

const { Title } = Typography;

interface ProductItem {
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    price: number;
    status: string;
    createdAt: string;
    categoryName?: string;
}

const ProductSnapshotList: React.FC = () => {
    usePageTitle('商品快照列表', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
    const [filters, setFilters] = useState<Partial<ProductFilterParams>>({});

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

    const handleViewSnapshots = (product: ProductItem) => {
        setSelectedProduct(product);
    };

    const handleBackToList = () => {
        setSelectedProduct(null);
    };

    const getStatusTag = (status: string) => {
        const statusMap = {
            ACTIVE: { color: 'green', text: '上架中' },
            INACTIVE: { color: 'red', text: '已下架' },
            DRAFT: { color: 'blue', text: '草稿' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    };

    const columns: ColumnsType<ProductItem> = [
        {
            title: '商品',
            dataIndex: 'name',
            render: (_, record) => (
                <Space>
                    <Image
                        width={50}
                        height={50}
                        src={record.mainImage || '/placeholder-product.jpg'}
                        style={{ borderRadius: '8px' }}
                        preview={false}
                        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj7wn5OPPC90ZXh0Pjwvc3ZnPg=="
                    />
                    <div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500 }}>
                            {record.name}
                        </div>
                        {record.categoryName && (
                            <div style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                marginTop: '4px'
                            }}>
                                {record.categoryName}
                            </div>
                        )}
                    </div>
                </Space>
            )
        },
        {
            title: '价格',
            dataIndex: 'price',
            width: 120,
            render: (price) => (
                <span style={{ color: '#52c41a', fontWeight: 600 }}>
                    ¥{price.toFixed(2)}
                </span>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: getStatusTag
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

    if (selectedProduct) {
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
                        返回商品列表
                    </Button>
                </div>
                <ProductSnapshotManagement
                    productId={selectedProduct.id}
                    productName={selectedProduct.name}
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
                <ShoppingOutlined style={{
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
                {Object.keys(filters).length > 0 ? '未找到相关商品' : '暂无商品'}
            </h3>
            <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                marginBottom: '0',
                lineHeight: '1.5',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
            }}>
                {Object.keys(filters).length > 0
                    ? '请尝试调整筛选条件'
                    : '暂时没有商品可以查看快照'
                }
            </p>
        </div>
    );

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
                    <Title level={2} style={{
                        color: 'white',
                        margin: 0,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}>
                        商品快照管理
                    </Title>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: '8px 0 0 0',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.6)'
                    }}>
                        选择商品查看版本快照记录
                    </p>
                </div>
            </div>

            {/* 筛选栏 */}
            <ProductFilterBar
                onFilterChange={handleFilterChange}
                showPriceRange={false}
                showFeatured={false}
                showPurchased={false}
                defaultCollapsed={true}
            />

            <Card
                style={elevatedGlassCardStyle}
                bodyStyle={{ padding: '24px' }}
                bordered={false}
            >
                {products.length > 0 || loading ? (
                    <>
                        <Table
                            columns={columns}
                            dataSource={products}
                            loading={loading}
                            rowKey="id"
                            pagination={false}
                            style={{ background: 'transparent' }}
                            rowClassName={() => 'glass-table-row'}
                        />
                        {total > 0 && (
                            <div style={{ padding: '24px 0 0', textAlign: 'center' }}>
                                <ConfigProvider theme={paginationTheme}>
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
                                </ConfigProvider>
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

export default ProductSnapshotList;
