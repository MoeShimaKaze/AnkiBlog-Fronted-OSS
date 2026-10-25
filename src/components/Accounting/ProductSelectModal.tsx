import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal, Input, TreeSelect, Row, Col, Card, Empty, Spin,
    Pagination, Tag, Button, Space
} from 'antd';
import { SearchOutlined, CheckOutlined, EyeOutlined } from '@ant-design/icons';

import { getProductsForSelect, getProductCategoryTree } from '@/services/accountingService';
import { ProductSelectItem, CategoryTreeNode } from '@/types/accounting';

interface ProductSelectModalProps {
    visible: boolean;
    onCancel: () => void;
    onSelect: (product: ProductSelectItem | null) => void;
    selectedProduct: ProductSelectItem | null;
}

// 暗色玻璃拟态Modal样式
const modalStyles = {
    mask: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
    },
    content: {
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    },
    header: {
        backgroundColor: 'transparent',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
    },
    body: {
        backgroundColor: 'transparent',
        padding: '24px',
        maxHeight: '70vh',
        overflow: 'auto',
    },
    footer: {
        backgroundColor: 'transparent',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
};

// 暗色玻璃拟态样式CSS
const darkGlassStyles = `
    /* 暗色玻璃拟态表单样式 */
    .product-select-modal .ant-modal-title {
        color: white !important;
    }
    .product-select-modal .ant-modal-close {
        color: rgba(255, 255, 255, 0.7) !important;
    }
    .product-select-modal .ant-modal-close:hover {
        color: white !important;
        background: rgba(255, 255, 255, 0.1) !important;
    }

    /* Input 暗色样式 */
    .product-select-modal .ant-input-affix-wrapper {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 8px !important;
    }
    .product-select-modal .ant-input-affix-wrapper:hover {
        border-color: rgba(255, 255, 255, 0.4) !important;
    }
    .product-select-modal .ant-input-affix-wrapper-focused {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
    }
    .product-select-modal .ant-input {
        background: transparent !important;
        color: white !important;
    }
    .product-select-modal .ant-input::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
    }
    .product-select-modal .ant-input-prefix {
        color: rgba(255, 255, 255, 0.6) !important;
    }
    .product-select-modal .ant-input-clear-icon {
        color: rgba(255, 255, 255, 0.5) !important;
    }
    .product-select-modal .ant-input-clear-icon:hover {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    /* TreeSelect 暗色样式 */
    .product-select-modal .ant-select-selector {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 8px !important;
    }
    .product-select-modal .ant-select:hover .ant-select-selector {
        border-color: rgba(255, 255, 255, 0.4) !important;
    }
    .product-select-modal .ant-select-focused .ant-select-selector {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
    }
    .product-select-modal .ant-select-selection-placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
    }
    .product-select-modal .ant-select-selection-item {
        color: white !important;
    }
    .product-select-modal .ant-select-arrow {
        color: rgba(255, 255, 255, 0.6) !important;
    }
    .product-select-modal .ant-select-clear {
        background: rgba(30, 30, 30, 0.95) !important;
        color: rgba(255, 255, 255, 0.6) !important;
    }
    .product-select-modal .ant-select-selection-search-input {
        color: white !important;
    }

    /* Button 暗色样式 */
    .product-select-modal .ant-btn-default {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: rgba(255, 255, 255, 0.9) !important;
    }
    .product-select-modal .ant-btn-default:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
        color: white !important;
    }
    .product-select-modal .ant-btn-primary {
        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
        border: none !important;
    }
    .product-select-modal .ant-btn-primary:hover {
        background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%) !important;
    }

    /* Footer Buttons */
    .product-select-modal .ant-modal-footer .ant-btn-default {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: rgba(255, 255, 255, 0.9) !important;
    }
    .product-select-modal .ant-modal-footer .ant-btn-default:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
        color: white !important;
    }
    .product-select-modal .ant-modal-footer .ant-btn-primary {
        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
        border: none !important;
    }
    .product-select-modal .ant-modal-footer .ant-btn-primary:hover {
        background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%) !important;
    }

    /* Pagination 暗色样式 */
    .product-select-modal .ant-pagination-item {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
    .product-select-modal .ant-pagination-item a {
        color: rgba(255, 255, 255, 0.85) !important;
    }
    .product-select-modal .ant-pagination-item:hover {
        border-color: #1890ff !important;
    }
    .product-select-modal .ant-pagination-item:hover a {
        color: #1890ff !important;
    }
    .product-select-modal .ant-pagination-item-active {
        background: rgba(24, 144, 255, 0.2) !important;
        border-color: #1890ff !important;
    }
    .product-select-modal .ant-pagination-item-active a {
        color: #1890ff !important;
    }
    .product-select-modal .ant-pagination-prev .ant-pagination-item-link,
    .product-select-modal .ant-pagination-next .ant-pagination-item-link {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: rgba(255, 255, 255, 0.85) !important;
    }
    .product-select-modal .ant-pagination-prev:hover .ant-pagination-item-link,
    .product-select-modal .ant-pagination-next:hover .ant-pagination-item-link {
        border-color: #1890ff !important;
        color: #1890ff !important;
    }
    .product-select-modal .ant-pagination-disabled .ant-pagination-item-link {
        color: rgba(255, 255, 255, 0.3) !important;
    }
    .product-select-modal .ant-pagination-total-text {
        color: rgba(255, 255, 255, 0.65) !important;
    }

    /* Spin 暗色样式 */
    .product-select-modal .ant-spin-text {
        color: rgba(255, 255, 255, 0.85) !important;
    }

    /* Empty 暗色样式 */
    .product-select-modal .ant-empty-description {
        color: rgba(255, 255, 255, 0.5) !important;
    }

    /* TreeSelect 下拉面板暗色样式 */
    .dark-product-tree-dropdown {
        background: rgba(30, 30, 30, 0.95) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 10px !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
        padding: 4px !important;
    }
    .dark-product-tree-dropdown .ant-select-tree {
        background: transparent !important;
        color: rgba(255, 255, 255, 0.85) !important;
    }
    .dark-product-tree-dropdown .ant-select-tree-treenode {
        color: rgba(255, 255, 255, 0.85) !important;
    }
    .dark-product-tree-dropdown .ant-select-tree-treenode:hover {
        background: rgba(255, 255, 255, 0.1) !important;
    }
    .dark-product-tree-dropdown .ant-select-tree-treenode-selected {
        background: rgba(24, 144, 255, 0.25) !important;
    }
    .dark-product-tree-dropdown .ant-select-tree-node-content-wrapper:hover {
        background: rgba(255, 255, 255, 0.1) !important;
    }
    .dark-product-tree-dropdown .ant-select-tree-node-content-wrapper.ant-select-tree-node-selected {
        background: rgba(24, 144, 255, 0.25) !important;
        color: #40a9ff !important;
    }
    .dark-product-tree-dropdown .ant-select-tree-switcher {
        color: rgba(255, 255, 255, 0.6) !important;
    }
    .dark-product-tree-dropdown .ant-select-tree-indent-unit {
        border-color: rgba(255, 255, 255, 0.1) !important;
    }
    .dark-product-tree-dropdown .ant-select-tree-title {
        color: rgba(255, 255, 255, 0.85) !important;
    }

    /* 搜索框内的 input */
    .dark-product-tree-dropdown .ant-select-tree-list-holder-inner {
        background: transparent !important;
    }
`;

const ProductSelectModal: React.FC<ProductSelectModalProps> = ({
    visible,
    onCancel,
    onSelect,
    selectedProduct,
}) => {
    const [products, setProducts] = useState<ProductSelectItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);

    // 筛选状态
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState<string | undefined>();
    const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);

    // 选中状态
    const [tempSelected, setTempSelected] = useState<ProductSelectItem | null>(null);

    // 加载商品
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getProductsForSelect({
                page: currentPage - 1,
                size: pageSize,
                keyword: keyword || undefined,
                categoryId,
                includeChildren: true,
            });
            if (response.success) {
                setProducts(response.data.content);
                setTotal(response.data.totalElements);
            }
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, keyword, categoryId]);

    // 加载分类树
    const loadCategoryTree = async () => {
        try {
            const response = await getProductCategoryTree();
            if (response.success) {
                setCategoryTree(response.data);
            }
        } catch (error) {
            console.error('Failed to load category tree', error);
        }
    };

    useEffect(() => {
        if (visible) {
            loadProducts();
            loadCategoryTree();
            setTempSelected(selectedProduct);
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            loadProducts();
        }
    }, [loadProducts, visible]);

    // 转换分类树为TreeSelect格式
    const convertTreeData = (nodes: CategoryTreeNode[]): any[] => {
        return nodes.map(node => ({
            value: node.id,
            title: `${node.name} (${node.productCount})`,
            children: node.children ? convertTreeData(node.children) : undefined,
        }));
    };

    // 搜索
    const handleSearch = () => {
        setCurrentPage(1);
        loadProducts();
    };

    // 选择商品
    const handleSelectProduct = (product: ProductSelectItem) => {
        setTempSelected(product.id === tempSelected?.id ? null : product);
    };

    // 确认选择
    const handleConfirm = () => {
        onSelect(tempSelected);
    };

    // 商品卡片样式（参考ProductCard）
    const renderProductCard = (product: ProductSelectItem) => {
        const isSelected = tempSelected?.id === product.id;

        return (
            <Col xs={12} sm={8} md={6} key={product.id}>
                <Card
                    hoverable
                    style={{
                        background: isSelected ? 'rgba(24, 144, 255, 0.2)' : 'rgba(35, 35, 35, 0.65)',
                        backdropFilter: 'blur(10px)',
                        border: isSelected ? '2px solid #1890ff' : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    bodyStyle={{ padding: 12 }}
                    cover={
                        <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                            <img
                                src={product.mainImage || '/placeholder-product.jpg'}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                            {isSelected && (
                                <div style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    background: '#1890ff',
                                    borderRadius: '50%',
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <CheckOutlined style={{ color: '#fff', fontSize: 14 }} />
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                display: 'flex',
                                gap: 4,
                            }}>
                                {product.isPurchased && (
                                    <Tag color="green" style={{ fontSize: 10, padding: '0 4px' }}>已购买</Tag>
                                )}
                                {product.featured && (
                                    <Tag color="orange" style={{ fontSize: 10, padding: '0 4px' }}>推荐</Tag>
                                )}
                            </div>
                        </div>
                    }
                    onClick={() => handleSelectProduct(product)}
                >
                    <div style={{
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 500,
                        fontSize: 13,
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {product.name}
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                    }}>
                        <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 14 }}>
                            ¥{product.price?.toLocaleString() || '0'}
                        </span>
                        {product.originalPrice && product.originalPrice > (product.price || 0) && (
                            <span style={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: 11,
                                textDecoration: 'line-through',
                            }}>
                                ¥{product.originalPrice}
                            </span>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 11,
                    }}>
                        {product.categoryName && (
                            <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                                {product.categoryName}
                            </Tag>
                        )}
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            <EyeOutlined style={{ marginRight: 4 }} />
                            {product.viewCount || 0}
                        </span>
                    </div>

                    {product.tags && product.tags.length > 0 && (
                        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {product.tags.slice(0, 2).map((tag, index) => (
                                <Tag
                                    key={index}
                                    style={{
                                        fontSize: 10,
                                        margin: 0,
                                        background: 'rgba(108, 99, 255, 0.2)',
                                        border: '1px solid rgba(108, 99, 255, 0.4)',
                                        color: 'white',
                                    }}
                                >
                                    {tag}
                                </Tag>
                            ))}
                        </div>
                    )}
                </Card>
            </Col>
        );
    };

    return (
        <>
            <style>{darkGlassStyles}</style>

            <Modal
                title="选择关联商品"
                open={visible}
                onCancel={onCancel}
                width={900}
                className="product-select-modal"
                styles={modalStyles}
                footer={[
                    <Button key="clear" onClick={() => onSelect(null)}>
                        清除选择
                    </Button>,
                    <Button key="cancel" onClick={onCancel}>
                        取消
                    </Button>,
                    <Button key="confirm" type="primary" onClick={handleConfirm}>
                        确认选择
                    </Button>,
                ]}
            >
                {/* 筛选栏 */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={10}>
                        <Input
                            placeholder="搜索商品名称..."
                            prefix={<SearchOutlined />}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onPressEnter={handleSearch}
                            allowClear
                        />
                    </Col>
                    <Col span={10}>
                        <TreeSelect
                            style={{ width: '100%' }}
                            placeholder="选择分类（支持父子分类）"
                            treeData={convertTreeData(categoryTree)}
                            value={categoryId}
                            onChange={(value) => {
                                setCategoryId(value);
                                setCurrentPage(1);
                            }}
                            allowClear
                            showSearch
                            treeNodeFilterProp="title"
                            popupClassName="dark-product-tree-dropdown"
                        />
                    </Col>
                    <Col span={4}>
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} block>
                            搜索
                        </Button>
                    </Col>
                </Row>

                {/* 商品列表 */}
                <Spin spinning={loading}>
                    {products.length > 0 ? (
                        <>
                            <Row gutter={[12, 12]}>
                                {products.map(renderProductCard)}
                            </Row>
                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={total}
                                    showSizeChanger={false}
                                    showTotal={(total) => `共 ${total} 个商品`}
                                    onChange={(page) => setCurrentPage(page)}
                                />
                            </div>
                        </>
                    ) : (
                        <Empty description="暂无商品" />
                    )}
                </Spin>

                {/* 当前选中提示 */}
                {tempSelected && (
                    <div style={{
                        marginTop: 16,
                        padding: '8px 12px',
                        background: 'rgba(24, 144, 255, 0.15)',
                        borderRadius: 8,
                        border: '1px solid rgba(24, 144, 255, 0.3)',
                    }}>
                        <Space>
                            <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>已选择:</span>
                            <span style={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>{tempSelected.name}</span>
                            {tempSelected.price && (
                                <span style={{ color: '#ff4d4f' }}>¥{tempSelected.price}</span>
                            )}
                        </Space>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ProductSelectModal;
