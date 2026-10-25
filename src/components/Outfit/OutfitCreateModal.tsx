/**
 * 创建穿搭弹窗组件
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal, Form, Input, DatePicker, Select, Button, Space, Image, Tag, Upload, message, Spin, Row, Col
} from 'antd';
import { DeleteOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { OutfitCreateRequest, OutfitItemType } from '@/types/outfit';
import type { Product } from '@/types/product';
import * as wardrobeService from '@/services/wardrobeService';
import * as outfitService from '@/services/outfitService';
import { useUpload } from '@/hooks/api/useUpload';

const PAGE_SIZE = 12;

interface OutfitCreateModalProps {
    visible: boolean;
    initialDate?: Dayjs;
    onClose: () => void;
    onSuccess: () => void;
}

interface SelectedProduct {
    product: Product;
    itemType: OutfitItemType;
}

const OutfitCreateModal: React.FC<OutfitCreateModalProps> = ({
    visible,
    initialDate,
    onClose,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [outfitImage, setOutfitImage] = useState<string>('');
    const { uploadFile, uploading } = useUpload();

    // 搜索与分页状态
    const [searchKeyword, setSearchKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    // 加载单品列表（参数显式传入，避免闭包陈旧值）
    const loadPurchasedProducts = useCallback(async (keyword: string, page: number) => {
        setLoading(true);
        try {
            const res = await wardrobeService.getPurchasedProducts({
                page: page - 1,
                size: PAGE_SIZE,
                keyword: keyword || undefined,
            });
            if (res.success) {
                setPurchasedProducts(res.data.content || []);
                setTotal(res.data.totalElements || 0);
            }
        } catch (error) {
            message.error('加载已购买商品失败');
        } finally {
            setLoading(false);
        }
    }, []);

    // 弹窗打开时重置并加载
    useEffect(() => {
        if (visible) {
            setSearchKeyword('');
            setDebouncedKeyword('');
            setCurrentPage(1);
            form.setFieldValue('outfitDate', initialDate || dayjs());
            loadPurchasedProducts('', 1);
        }
    }, [visible, initialDate]);

    // 关键词防抖：300ms 后更新 debouncedKeyword 并重置到第一页
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchKeyword);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    // debouncedKeyword 变化时重新加载（跳过初始化已由 visible effect 触发的那次）
    useEffect(() => {
        if (!visible) return;
        loadPurchasedProducts(debouncedKeyword, 1);
    }, [debouncedKeyword]);

    // 翻页
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        loadPurchasedProducts(debouncedKeyword, page);
    };

    const handleProductSelect = (product: Product) => {
        const exists = selectedProducts.find(sp => sp.product.id === product.id);
        if (exists) {
            // 取消选择
            setSelectedProducts(selectedProducts.filter(sp => sp.product.id !== product.id));
        } else {
            // 添加选择，默认为主要单品
            setSelectedProducts([...selectedProducts, { product, itemType: 'MAIN' }]);
        }
    };

    const handleItemTypeChange = (productId: string, itemType: OutfitItemType) => {
        setSelectedProducts(selectedProducts.map(sp =>
            sp.product.id === productId ? { ...sp, itemType } : sp
        ));
    };

    const handleImageUpload = async (file: File) => {
        try {
            const url = await uploadFile(file, 'image');
            if (url) {
                setOutfitImage(url);
            }
            return false; // 阻止默认上传行为
        } catch (error) {
            message.error('图片上传失败');
            return false;
        }
    };

    const handleSubmit = async () => {
        if (selectedProducts.length === 0) {
            message.warning('请至少选择一件商品');
            return;
        }

        try {
            await form.validateFields();
            setSubmitting(true);

            const values = form.getFieldsValue();
            const request: OutfitCreateRequest = {
                // 使用 format() 生成本地时间字符串，避免 toISOString() 的 UTC 转换问题
                outfitDate: values.outfitDate?.format('YYYY-MM-DDTHH:mm:ss'),
                productIds: selectedProducts.map(sp => sp.product.id),
                itemTypes: selectedProducts.reduce((acc, sp) => {
                    acc[sp.product.id] = sp.itemType;
                    return acc;
                }, {} as Record<string, OutfitItemType>),
                note: values.note,
                outfitImage: outfitImage || undefined
            };

            const res = await outfitService.createOutfit(request);
            if (res.success) {
                message.success('穿搭记录创建成功');
                handleClose();
                onSuccess();
            }
        } catch (error) {
            message.error('创建失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedProducts([]);
        setOutfitImage('');
        onClose();
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

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
        },
        footer: {
            backgroundColor: 'transparent',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        },
    };

    return (
        <>
            <style>{`
                /* 暗色玻璃拟态表单样式 */
                .outfit-modal .ant-modal-title {
                    color: white !important;
                }
                .outfit-modal .ant-modal-close {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .outfit-modal .ant-modal-close:hover {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }

                /* DatePicker 暗色样式 */
                .outfit-modal .ant-picker {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 8px !important;
                }
                .outfit-modal .ant-picker:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .outfit-modal .ant-picker-focused {
                    border-color: #1890ff !important;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                }
                .outfit-modal .ant-picker-input > input {
                    color: white !important;
                }
                .outfit-modal .ant-picker-input > input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .outfit-modal .ant-picker-suffix,
                .outfit-modal .ant-picker-clear {
                    color: rgba(255, 255, 255, 0.6) !important;
                }

                /* Select 暗色样式 */
                .outfit-modal .ant-select-selector {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 6px !important;
                }
                .outfit-modal .ant-select:hover .ant-select-selector {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .outfit-modal .ant-select-focused .ant-select-selector {
                    border-color: #1890ff !important;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                }
                .outfit-modal .ant-select-selection-item {
                    color: white !important;
                }
                .outfit-modal .ant-select-arrow {
                    color: rgba(255, 255, 255, 0.6) !important;
                }

                /* TextArea 暗色样式 */
                .outfit-modal .ant-input,
                .outfit-modal .ant-input-textarea textarea {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 8px !important;
                    color: white !important;
                }
                .outfit-modal .ant-input:hover,
                .outfit-modal .ant-input-textarea textarea:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .outfit-modal .ant-input:focus,
                .outfit-modal .ant-input-textarea textarea:focus {
                    border-color: #1890ff !important;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                }
                .outfit-modal .ant-input::placeholder,
                .outfit-modal .ant-input-textarea textarea::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .outfit-modal .ant-input-textarea-show-count::after {
                    color: rgba(255, 255, 255, 0.5) !important;
                }

                /* 搜索框前缀图标 */
                .outfit-modal .ant-input-prefix {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                /* 搜索框清除按钮 */
                .outfit-modal .ant-input-clear-icon {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .outfit-modal .ant-input-clear-icon:hover {
                    color: rgba(255, 255, 255, 0.8) !important;
                }

                /* Upload Button 暗色样式 */
                .outfit-modal .ant-btn-default {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .outfit-modal .ant-btn-default:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }

                /* Footer Buttons */
                .outfit-modal .ant-modal-footer .ant-btn-default {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .outfit-modal .ant-modal-footer .ant-btn-default:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }
                .outfit-modal .ant-modal-footer .ant-btn-primary {
                    background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%) !important;
                    border: none !important;
                }
                .outfit-modal .ant-modal-footer .ant-btn-primary:hover {
                    background: linear-gradient(135deg, #40a9ff 0%, #9254de 100%) !important;
                }
                .outfit-modal .ant-modal-footer .ant-btn-primary:disabled {
                    background: rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.3) !important;
                }

                /* Tag 样式优化 */
                .outfit-modal .ant-tag {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                }
                .outfit-modal .ant-tag-blue {
                    background: rgba(24, 144, 255, 0.2) !important;
                    border-color: rgba(24, 144, 255, 0.4) !important;
                    color: #69c0ff !important;
                }
                .outfit-modal .ant-tag-purple {
                    background: rgba(114, 46, 209, 0.2) !important;
                    border-color: rgba(114, 46, 209, 0.4) !important;
                    color: #b37feb !important;
                }
                .outfit-modal .ant-tag-close-icon {
                    color: inherit !important;
                }

                /* Spin 样式 */
                .outfit-modal .ant-spin-text {
                    color: rgba(255, 255, 255, 0.7) !important;
                }

                /* 分页按钮 */
                .outfit-product-pagination .ant-btn {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .outfit-product-pagination .ant-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }
                .outfit-product-pagination .ant-btn:disabled {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.3) !important;
                }

                /* ============================================
                   DatePicker 下拉面板暗色玻璃拟态样式
                   ============================================ */
                .dark-glass-picker-dropdown {
                    backdrop-filter: blur(20px) saturate(180%) !important;
                    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-panel-container {
                    background: rgba(30, 30, 30, 0.95) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 12px !important;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
                    overflow: hidden;
                }
                .dark-glass-picker-dropdown .ant-picker-header {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                }
                .dark-glass-picker-dropdown .ant-picker-header button {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-header button:hover {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-content th {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-cell {
                    color: rgba(255, 255, 255, 0.85) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-cell:hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end) .ant-picker-cell-inner {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
                    background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%) !important;
                    border-radius: 6px !important;
                }
                .dark-glass-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
                    border-color: #1890ff !important;
                    border-radius: 6px !important;
                }
                .dark-glass-picker-dropdown .ant-picker-cell-disabled {
                    color: rgba(255, 255, 255, 0.25) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-cell-disabled::before {
                    background: transparent !important;
                }
                .dark-glass-picker-dropdown .ant-picker-footer {
                    background: transparent !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-today-btn {
                    color: #1890ff !important;
                }
                .dark-glass-picker-dropdown .ant-picker-now-btn {
                    color: #1890ff !important;
                }
                .dark-glass-picker-dropdown .ant-picker-ok button {
                    background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%) !important;
                    border: none !important;
                }
                /* TimePicker 部分 */
                .dark-glass-picker-dropdown .ant-picker-time-panel {
                    border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-time-panel-column {
                    border-left: 1px solid rgba(255, 255, 255, 0.05) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-time-panel-column > li.ant-picker-time-panel-cell .ant-picker-time-panel-cell-inner {
                    color: rgba(255, 255, 255, 0.85) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-time-panel-column > li.ant-picker-time-panel-cell:hover .ant-picker-time-panel-cell-inner {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-glass-picker-dropdown .ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
                    background: rgba(24, 144, 255, 0.3) !important;
                    color: #69c0ff !important;
                }
                .dark-glass-picker-dropdown .ant-picker-datetime-panel .ant-picker-time-panel {
                    border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
                }

                /* ============================================
                   Select 下拉面板暗色玻璃拟态样式
                   ============================================ */
                .dark-glass-select-dropdown {
                    background: rgba(30, 30, 30, 0.95) !important;
                    backdrop-filter: blur(20px) saturate(180%) !important;
                    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 10px !important;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
                    padding: 4px !important;
                }
                .dark-glass-select-dropdown .ant-select-item {
                    color: rgba(255, 255, 255, 0.85) !important;
                    border-radius: 6px !important;
                }
                .dark-glass-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-glass-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
                    background: rgba(24, 144, 255, 0.25) !important;
                    color: #69c0ff !important;
                }
                .dark-glass-select-dropdown .ant-select-item-option-disabled {
                    color: rgba(255, 255, 255, 0.3) !important;
                }
            `}</style>

            <Modal
                title="记录今日穿搭"
                open={visible}
                onCancel={handleClose}
                width={800}
                className="outfit-modal"
                footer={[
                    <Button key="cancel" onClick={handleClose}>取消</Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={submitting}
                        onClick={handleSubmit}
                        disabled={selectedProducts.length === 0}
                    >
                        保存穿搭
                    </Button>
                ]}
                styles={modalStyles}
            >
                <Form form={form} layout="vertical">
                    {/* 日期选择 */}
                    <Form.Item
                        name="outfitDate"
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>穿搭日期</span>}
                        rules={[{ required: true, message: '请选择日期' }]}
                    >
                        <DatePicker
                            showTime
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD HH:mm"
                            popupClassName="dark-glass-picker-dropdown"
                        />
                    </Form.Item>

                    {/* 商品选择 */}
                    <Form.Item
                        label={
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                选择单品
                                {selectedProducts.length > 0 && (
                                    <span style={{ color: '#1890ff', marginLeft: 6 }}>
                                        ({selectedProducts.length} 已选)
                                    </span>
                                )}
                            </span>
                        }
                    >
                        {/* 搜索栏 */}
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="搜索单品名称..."
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                            allowClear
                            style={{ marginBottom: '10px' }}
                        />

                        {/* 单品网格 */}
                        <Spin spinning={loading}>
                            <div style={{
                                minHeight: '160px',
                                maxHeight: '280px',
                                overflowY: 'auto',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.05)'
                            }}>
                                <Row gutter={[8, 8]}>
                                    {purchasedProducts.map(product => {
                                        const selected = selectedProducts.find(sp => sp.product.id === product.id);
                                        return (
                                            <Col key={product.id} xs={12} sm={8} md={6}>
                                                <div
                                                    onClick={() => handleProductSelect(product)}
                                                    style={{
                                                        border: selected
                                                            ? '2px solid #1890ff'
                                                            : '1px solid rgba(255, 255, 255, 0.15)',
                                                        borderRadius: '10px',
                                                        padding: '10px',
                                                        cursor: 'pointer',
                                                        background: selected
                                                            ? 'rgba(24, 144, 255, 0.15)'
                                                            : 'rgba(255, 255, 255, 0.05)',
                                                        transition: 'all 0.25s ease',
                                                        backdropFilter: 'blur(8px)'
                                                    }}
                                                >
                                                    <Image
                                                        src={product.mainImage}
                                                        alt={product.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '80px',
                                                            objectFit: 'cover',
                                                            borderRadius: '6px'
                                                        }}
                                                        preview={false}
                                                    />
                                                    <div style={{
                                                        color: 'rgba(255, 255, 255, 0.9)',
                                                        fontSize: '12px',
                                                        marginTop: '6px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {product.name}
                                                    </div>
                                                    {selected && (
                                                        <Select
                                                            size="small"
                                                            value={selected.itemType}
                                                            onChange={(v) => handleItemTypeChange(product.id, v)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{ width: '100%', marginTop: '6px' }}
                                                            popupClassName="dark-glass-select-dropdown"
                                                            options={[
                                                                { value: 'MAIN', label: '主要单品' },
                                                                { value: 'ACCESSORY', label: '配饰' }
                                                            ]}
                                                        />
                                                    )}
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                                {!loading && purchasedProducts.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '20px' }}>
                                        {searchKeyword
                                            ? `未找到包含"${searchKeyword}"的单品`
                                            : '暂无已购买商品，请先在商品管理中标记已购买的商品'}
                                    </div>
                                )}
                            </div>
                        </Spin>

                        {/* 分页控件 */}
                        {totalPages > 1 && (
                            <div
                                className="outfit-product-pagination"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    marginTop: '10px'
                                }}
                            >
                                <Button
                                    size="small"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    上一页
                                </Button>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                                    第 {currentPage} / {totalPages} 页 · 共 {total} 件
                                </span>
                                <Button
                                    size="small"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    下一页
                                </Button>
                            </div>
                        )}
                        {totalPages <= 1 && total > 0 && (
                            <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '6px' }}>
                                共 {total} 件
                            </div>
                        )}
                    </Form.Item>

                    {/* 已选商品预览 */}
                    {selectedProducts.length > 0 && (
                        <Form.Item label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>已选单品</span>}>
                            <Space wrap>
                                {selectedProducts.map(sp => (
                                    <Tag
                                        key={sp.product.id}
                                        color={sp.itemType === 'MAIN' ? 'blue' : 'purple'}
                                        closable
                                        onClose={() => handleProductSelect(sp.product)}
                                    >
                                        {sp.product.name} ({sp.itemType === 'MAIN' ? '主要' : '配饰'})
                                    </Tag>
                                ))}
                            </Space>
                        </Form.Item>
                    )}

                    {/* 穿搭图片上传 */}
                    <Form.Item label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>穿搭实拍 (可选)</span>}>
                        <Upload
                            accept="image/*"
                            showUploadList={false}
                            beforeUpload={handleImageUpload}
                        >
                            {outfitImage ? (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <Image
                                        src={outfitImage}
                                        alt="穿搭实拍"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    />
                                    <Button
                                        type="primary"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(255, 77, 79, 0.9)',
                                            border: 'none'
                                        }}
                                        onClick={(e) => { e.stopPropagation(); setOutfitImage(''); }}
                                    />
                                </div>
                            ) : (
                                <Button icon={<UploadOutlined />} loading={uploading}>
                                    上传穿搭照片
                                </Button>
                            )}
                        </Upload>
                    </Form.Item>

                    {/* 备注 */}
                    <Form.Item
                        name="note"
                        label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>备注 (可选)</span>}
                    >
                        <Input.TextArea
                            placeholder="记录今日穿搭心情、场合等..."
                            maxLength={500}
                            showCount
                            rows={3}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default OutfitCreateModal;
