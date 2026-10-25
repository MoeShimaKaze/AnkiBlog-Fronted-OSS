/**
 * 创建化妆记录弹窗组件
 */
import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Input, DatePicker, Select, Button, Space, Image, Tag, message, Spin, Row, Col
} from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { MakeupCreateRequest, MakeupUsageType } from '@/types/makeup';
import type { Product } from '@/types/product';
import * as cosmeticService from '@/services/cosmeticService';
import * as makeupService from '@/services/makeupService';
import * as makeupUsageTypeService from '@/services/makeupUsageTypeService';

interface MakeupCreateModalProps {
    visible: boolean;
    initialDate?: Dayjs;
    onClose: () => void;
    onSuccess: () => void;
}

interface SelectedProduct {
    product: Product;
    usageTypeId?: string;
}

const MakeupCreateModal: React.FC<MakeupCreateModalProps> = ({
    visible,
    initialDate,
    onClose,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [cosmetics, setCosmetics] = useState<Product[]>([]);
    const [usageTypes, setUsageTypes] = useState<MakeupUsageType[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

    useEffect(() => {
        if (visible) {
            loadData();
            form.setFieldValue('makeupDate', initialDate || dayjs());
        }
    }, [visible, initialDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cosmeticsRes, typesRes] = await Promise.all([
                cosmeticService.getCosmetics({ page: 0, size: 200, onlyPurchased: true }),
                makeupUsageTypeService.getAllUsageTypes()
            ]);

            if (cosmeticsRes.success) {
                setCosmetics(cosmeticsRes.data.content || []);
            }
            if (typesRes.success) {
                setUsageTypes(typesRes.data || []);
            }
        } catch (error) {
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelect = (product: Product) => {
        const exists = selectedProducts.find(sp => sp.product.id === product.id);
        if (exists) {
            // 取消选择
            setSelectedProducts(selectedProducts.filter(sp => sp.product.id !== product.id));
        } else {
            // 添加选择
            setSelectedProducts([...selectedProducts, { product, usageTypeId: undefined }]);
        }
    };

    const handleUsageTypeChange = (productId: string, usageTypeId: string) => {
        setSelectedProducts(selectedProducts.map(sp =>
            sp.product.id === productId ? { ...sp, usageTypeId } : sp
        ));
    };

    const handleSubmit = async () => {
        if (selectedProducts.length === 0) {
            message.warning('请至少选择一件化妆品');
            return;
        }

        try {
            await form.validateFields();
            setSubmitting(true);

            const values = form.getFieldsValue();
            const request: MakeupCreateRequest = {
                makeupDate: values.makeupDate?.format('YYYY-MM-DDTHH:mm:ss'),
                lookName: values.lookName,
                referenceUrl: values.referenceUrl,
                productIds: selectedProducts.map(sp => sp.product.id),
                usageTypes: selectedProducts.reduce((acc, sp) => {
                    if (sp.usageTypeId) {
                        acc[sp.product.id] = sp.usageTypeId;
                    }
                    return acc;
                }, {} as Record<string, string>)
            };

            const res = await makeupService.createMakeup(request);
            if (res.success) {
                message.success('化妆记录创建成功');
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
        onClose();
    };

    // 按使用类型分组显示化妆品
    const groupedCosmetics = cosmetics.reduce((acc, product) => {
        const category = product.categoryName || '未分类';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

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
                .makeup-modal .ant-modal-title {
                    color: white !important;
                }
                .makeup-modal .ant-modal-close {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .makeup-modal .ant-modal-close:hover {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }

                /* DatePicker 暗色样式 */
                .makeup-modal .ant-picker {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 8px !important;
                }
                .makeup-modal .ant-picker:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .makeup-modal .ant-picker-focused {
                    border-color: #eb2f96 !important;
                    box-shadow: 0 0 0 2px rgba(235, 47, 150, 0.2) !important;
                }
                .makeup-modal .ant-picker-input > input {
                    color: white !important;
                }
                .makeup-modal .ant-picker-input > input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .makeup-modal .ant-picker-suffix,
                .makeup-modal .ant-picker-clear {
                    color: rgba(255, 255, 255, 0.6) !important;
                }

                /* Select 暗色样式 */
                .makeup-modal .ant-select-selector {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 6px !important;
                }
                .makeup-modal .ant-select:hover .ant-select-selector {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .makeup-modal .ant-select-focused .ant-select-selector {
                    border-color: #eb2f96 !important;
                    box-shadow: 0 0 0 2px rgba(235, 47, 150, 0.2) !important;
                }
                .makeup-modal .ant-select-selection-item {
                    color: white !important;
                }
                .makeup-modal .ant-select-arrow {
                    color: rgba(255, 255, 255, 0.6) !important;
                }

                /* Input 暗色样式 */
                .makeup-modal .ant-input {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 8px !important;
                    color: white !important;
                }
                .makeup-modal .ant-input:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .makeup-modal .ant-input:focus {
                    border-color: #eb2f96 !important;
                    box-shadow: 0 0 0 2px rgba(235, 47, 150, 0.2) !important;
                }
                .makeup-modal .ant-input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }

                /* Footer Buttons */
                .makeup-modal .ant-modal-footer .ant-btn-default {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .makeup-modal .ant-modal-footer .ant-btn-default:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }
                .makeup-modal .ant-modal-footer .ant-btn-primary {
                    background: linear-gradient(135deg, #eb2f96 0%, #722ed1 100%) !important;
                    border: none !important;
                }
                .makeup-modal .ant-modal-footer .ant-btn-primary:hover {
                    background: linear-gradient(135deg, #f759ab 0%, #9254de 100%) !important;
                }
                .makeup-modal .ant-modal-footer .ant-btn-primary:disabled {
                    background: rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.3) !important;
                }

                /* Tag 样式优化 */
                .makeup-modal .ant-tag {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                }
                .makeup-modal .ant-tag-close-icon {
                    color: inherit !important;
                }

                /* DatePicker 下拉面板暗色样式 */
                .dark-makeup-picker-dropdown {
                    backdrop-filter: blur(20px) saturate(180%) !important;
                    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-panel-container {
                    background: rgba(30, 30, 30, 0.95) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 12px !important;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-header {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-header button {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-header button:hover {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-content th {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-cell {
                    color: rgba(255, 255, 255, 0.85) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-cell:hover:not(.ant-picker-cell-selected) .ant-picker-cell-inner {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
                    background: linear-gradient(135deg, #eb2f96 0%, #722ed1 100%) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
                    border-color: #eb2f96 !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-footer {
                    background: transparent !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-today-btn,
                .dark-makeup-picker-dropdown .ant-picker-now-btn {
                    color: #eb2f96 !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-ok button {
                    background: linear-gradient(135deg, #eb2f96 0%, #722ed1 100%) !important;
                    border: none !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-time-panel-column > li.ant-picker-time-panel-cell .ant-picker-time-panel-cell-inner {
                    color: rgba(255, 255, 255, 0.85) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-time-panel-column > li.ant-picker-time-panel-cell:hover .ant-picker-time-panel-cell-inner {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-makeup-picker-dropdown .ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
                    background: rgba(235, 47, 150, 0.3) !important;
                    color: #f759ab !important;
                }

                /* Select 下拉面板暗色样式 */
                .dark-makeup-select-dropdown {
                    background: rgba(30, 30, 30, 0.95) !important;
                    backdrop-filter: blur(20px) saturate(180%) !important;
                    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 10px !important;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
                    padding: 4px !important;
                }
                .dark-makeup-select-dropdown .ant-select-item {
                    color: rgba(255, 255, 255, 0.85) !important;
                    border-radius: 6px !important;
                }
                .dark-makeup-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-makeup-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
                    background: rgba(235, 47, 150, 0.25) !important;
                    color: #f759ab !important;
                }
            `}</style>

            <Modal
                title="记录今日妆容"
                open={visible}
                onCancel={handleClose}
                width={900}
                className="makeup-modal"
                footer={[
                    <Button key="cancel" onClick={handleClose}>取消</Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={submitting}
                        onClick={handleSubmit}
                        disabled={selectedProducts.length === 0}
                    >
                        保存记录
                    </Button>
                ]}
                styles={modalStyles}
            >
                <Spin spinning={loading}>
                    <Form form={form} layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                {/* 日期选择 */}
                                <Form.Item
                                    name="makeupDate"
                                    label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>化妆日期</span>}
                                    rules={[{ required: true, message: '请选择日期' }]}
                                >
                                    <DatePicker
                                        showTime
                                        style={{ width: '100%' }}
                                        format="YYYY-MM-DD HH:mm"
                                        popupClassName="dark-makeup-picker-dropdown"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                {/* 妆面名称 */}
                                <Form.Item
                                    name="lookName"
                                    label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>妆面名称 (可选)</span>}
                                >
                                    <Input placeholder="如：日常通勤妆、约会甜美妆..." />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* 参考链接 */}
                        <Form.Item
                            name="referenceUrl"
                            label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}><LinkOutlined /> 参考链接 (可选)</span>}
                        >
                            <Input placeholder="小红书/B站/YouTube 教程链接..." />
                        </Form.Item>

                        {/* 化妆品选择 */}
                        <Form.Item
                            label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>选择使用的化妆品 ({selectedProducts.length} 已选)</span>}
                        >
                            <div style={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.05)'
                            }}>
                                {Object.entries(groupedCosmetics).map(([category, products]) => (
                                    <div key={category} style={{ marginBottom: '16px' }}>
                                        <div style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '12px',
                                            marginBottom: '8px',
                                            fontWeight: 'bold'
                                        }}>
                                            {category}
                                        </div>
                                        <Row gutter={[8, 8]}>
                                            {products.map(product => {
                                                const selected = selectedProducts.find(sp => sp.product.id === product.id);
                                                return (
                                                    <Col key={product.id} xs={12} sm={8} md={6}>
                                                        <div
                                                            onClick={() => handleProductSelect(product)}
                                                            style={{
                                                                border: selected
                                                                    ? '2px solid #eb2f96'
                                                                    : '1px solid rgba(255, 255, 255, 0.15)',
                                                                borderRadius: '10px',
                                                                padding: '10px',
                                                                cursor: 'pointer',
                                                                background: selected
                                                                    ? 'rgba(235, 47, 150, 0.15)'
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
                                                                    height: '70px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '6px'
                                                                }}
                                                                preview={false}
                                                            />
                                                            <div style={{
                                                                color: 'rgba(255, 255, 255, 0.9)',
                                                                fontSize: '11px',
                                                                marginTop: '6px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {product.name}
                                                            </div>
                                                            {selected && usageTypes.length > 0 && (
                                                                <Select
                                                                    size="small"
                                                                    value={selected.usageTypeId}
                                                                    onChange={(v) => handleUsageTypeChange(product.id, v)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{ width: '100%', marginTop: '6px' }}
                                                                    placeholder="用途"
                                                                    allowClear
                                                                    popupClassName="dark-makeup-select-dropdown"
                                                                    options={usageTypes.map(t => ({
                                                                        value: t.id,
                                                                        label: (
                                                                            <span>
                                                                                {t.color && (
                                                                                    <span style={{
                                                                                        display: 'inline-block',
                                                                                        width: '10px',
                                                                                        height: '10px',
                                                                                        borderRadius: '2px',
                                                                                        background: t.color,
                                                                                        marginRight: '6px'
                                                                                    }} />
                                                                                )}
                                                                                {t.name}
                                                                            </span>
                                                                        )
                                                                    }))}
                                                                />
                                                            )}
                                                        </div>
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                    </div>
                                ))}
                                {cosmetics.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '20px' }}>
                                        暂无已购买的化妆品，请先在化妆台中标记已购买的化妆品
                                    </div>
                                )}
                            </div>
                        </Form.Item>

                        {/* 已选化妆品预览 */}
                        {selectedProducts.length > 0 && (
                            <Form.Item label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>已选化妆品</span>}>
                                <Space wrap>
                                    {selectedProducts.map(sp => {
                                        const usageType = usageTypes.find(t => t.id === sp.usageTypeId);
                                        return (
                                            <Tag
                                                key={sp.product.id}
                                                color={usageType?.color || '#eb2f96'}
                                                closable
                                                onClose={() => handleProductSelect(sp.product)}
                                                style={{
                                                    background: `${usageType?.color || '#eb2f96'}30`,
                                                    borderColor: `${usageType?.color || '#eb2f96'}60`,
                                                    color: 'white'
                                                }}
                                            >
                                                {sp.product.name}
                                                {usageType && ` (${usageType.name})`}
                                            </Tag>
                                        );
                                    })}
                                </Space>
                            </Form.Item>
                        )}
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default MakeupCreateModal;
