/**
 * 购买记录弹窗组件
 * 用于记录化妆品的购买信息
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Button, message, List, Popconfirm, Empty, Spin, Tag } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PurchaseRecord, PurchaseRecordRequest } from '@/types/makeup';
import type { Product } from '@/types/product';
import * as purchaseService from '@/services/purchaseService';

interface PurchaseModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
    visible,
    product,
    onClose,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);

    useEffect(() => {
        if (visible && product) {
            form.setFieldValue('purchaseDate', dayjs());
            loadPurchaseHistory();
        }
    }, [visible, product]);

    const loadPurchaseHistory = async () => {
        if (!product) return;
        setLoading(true);
        try {
            const res = await purchaseService.getProductPurchaseHistory(product.id);
            if (res.success) {
                setPurchaseHistory(res.data || []);
            }
        } catch (error) {
            console.error('加载购买历史失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!product) return;

        try {
            await form.validateFields();
            setSubmitting(true);

            const values = form.getFieldsValue();
            const request: PurchaseRecordRequest = {
                productId: product.id,
                purchaseDate: values.purchaseDate?.format('YYYY-MM-DDTHH:mm:ss'),
                colorCode: values.colorCode,
                price: values.price,
                note: values.note
            };

            const res = await purchaseService.addPurchaseRecord(request);
            if (res.success) {
                message.success('购买记录添加成功');
                form.resetFields();
                form.setFieldValue('purchaseDate', dayjs());
                loadPurchaseHistory();
                onSuccess?.();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '添加失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await purchaseService.deletePurchaseRecord(id);
            if (res.success) {
                message.success('删除成功');
                loadPurchaseHistory();
                onSuccess?.();
            }
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleClose = () => {
        form.resetFields();
        setPurchaseHistory([]);
        onClose();
    };

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
                .purchase-modal .ant-modal-title {
                    color: white !important;
                }
                .purchase-modal .ant-modal-close {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .purchase-modal .ant-modal-close:hover {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }

                /* DatePicker 暗色样式 */
                .purchase-modal .ant-picker {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 8px !important;
                }
                .purchase-modal .ant-picker:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .purchase-modal .ant-picker-focused {
                    border-color: #52c41a !important;
                    box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
                }
                .purchase-modal .ant-picker-input > input {
                    color: white !important;
                }
                .purchase-modal .ant-picker-input > input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .purchase-modal .ant-picker-suffix,
                .purchase-modal .ant-picker-clear {
                    color: rgba(255, 255, 255, 0.6) !important;
                }

                /* Input & InputNumber 暗色样式 */
                .purchase-modal .ant-input,
                .purchase-modal .ant-input-number {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 8px !important;
                    color: white !important;
                }
                .purchase-modal .ant-input:hover,
                .purchase-modal .ant-input-number:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .purchase-modal .ant-input:focus,
                .purchase-modal .ant-input-number-focused {
                    border-color: #52c41a !important;
                    box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
                }
                .purchase-modal .ant-input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .purchase-modal .ant-input-number-input {
                    color: white !important;
                }
                .purchase-modal .ant-input-number-handler-wrap {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-left: 1px solid rgba(255, 255, 255, 0.2) !important;
                }
                .purchase-modal .ant-input-number-handler {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .purchase-modal .ant-input-number-handler-up-inner,
                .purchase-modal .ant-input-number-handler-down-inner {
                    color: rgba(255, 255, 255, 0.7) !important;
                }

                /* TextArea 暗色样式 */
                .purchase-modal .ant-input-textarea textarea {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 8px !important;
                    color: white !important;
                }
                .purchase-modal .ant-input-textarea textarea:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .purchase-modal .ant-input-textarea textarea:focus {
                    border-color: #52c41a !important;
                    box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
                }
                .purchase-modal .ant-input-textarea textarea::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .purchase-modal .ant-input-textarea-show-count::after {
                    color: rgba(255, 255, 255, 0.5) !important;
                }

                /* List 暗色样式 */
                .purchase-modal .ant-list-item {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .purchase-modal .ant-list-item-meta-title {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .purchase-modal .ant-list-item-meta-description {
                    color: rgba(255, 255, 255, 0.6) !important;
                }

                /* Footer Buttons */
                .purchase-modal .ant-modal-footer .ant-btn-default {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .purchase-modal .ant-modal-footer .ant-btn-default:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }
                .purchase-modal .ant-modal-footer .ant-btn-primary {
                    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%) !important;
                    border: none !important;
                }
                .purchase-modal .ant-modal-footer .ant-btn-primary:hover {
                    background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%) !important;
                }

                /* DatePicker 下拉面板暗色样式 */
                .dark-purchase-picker-dropdown {
                    backdrop-filter: blur(20px) saturate(180%) !important;
                    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-panel-container {
                    background: rgba(30, 30, 30, 0.95) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 12px !important;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-header {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-header button {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-header button:hover {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-content th {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-cell {
                    color: rgba(255, 255, 255, 0.85) !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-cell:hover:not(.ant-picker-cell-selected) .ant-picker-cell-inner {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
                    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%) !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
                    border-color: #52c41a !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-footer {
                    background: transparent !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .dark-purchase-picker-dropdown .ant-picker-today-btn {
                    color: #52c41a !important;
                }
            `}</style>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingCartOutlined style={{ color: '#52c41a' }} />
                        <span>购买记录 - {product?.name}</span>
                    </div>
                }
                open={visible}
                onCancel={handleClose}
                width={600}
                className="purchase-modal"
                footer={[
                    <Button key="cancel" onClick={handleClose}>关闭</Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={submitting}
                        onClick={handleSubmit}
                    >
                        添加购买记录
                    </Button>
                ]}
                styles={modalStyles}
            >
                <Spin spinning={loading}>
                    {/* 商品信息 */}
                    {product && (
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginBottom: '20px',
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <img
                                src={product.mainImage}
                                alt={product.name}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}
                            />
                            <div>
                                <div style={{ color: 'white', fontWeight: 500 }}>{product.name}</div>
                                {product.brand && (
                                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                                        {product.brand}
                                    </div>
                                )}
                                <Tag color="green" style={{ marginTop: '4px' }}>
                                    已购买 {product.purchaseCount || 0} 次
                                </Tag>
                            </div>
                        </div>
                    )}

                    {/* 添加购买记录表单 */}
                    <div style={{
                        padding: '16px',
                        background: 'rgba(82, 196, 26, 0.1)',
                        borderRadius: '10px',
                        border: '1px solid rgba(82, 196, 26, 0.3)',
                        marginBottom: '20px'
                    }}>
                        <h4 style={{ color: '#73d13d', margin: '0 0 12px 0' }}>添加新购买记录</h4>
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="purchaseDate"
                                label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>购买日期</span>}
                                rules={[{ required: true, message: '请选择购买日期' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="YYYY-MM-DD"
                                    popupClassName="dark-purchase-picker-dropdown"
                                />
                            </Form.Item>

                            <Form.Item
                                name="colorCode"
                                label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>色号/色码 (可选)</span>}
                            >
                                <Input placeholder="如：#01 自然色、101 珊瑚红..." />
                            </Form.Item>

                            <Form.Item
                                name="price"
                                label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>购买价格 (可选)</span>}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    precision={2}
                                    prefix="¥"
                                    placeholder="实际购买价格"
                                />
                            </Form.Item>

                            <Form.Item
                                name="note"
                                label={<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>备注 (可选)</span>}
                            >
                                <Input.TextArea
                                    placeholder="购买渠道、优惠信息等..."
                                    maxLength={200}
                                    showCount
                                    rows={2}
                                />
                            </Form.Item>
                        </Form>
                    </div>

                    {/* 购买历史 */}
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '12px' }}>
                            购买历史 ({purchaseHistory.length})
                        </h4>
                        {purchaseHistory.length > 0 ? (
                            <List
                                dataSource={purchaseHistory}
                                renderItem={(record) => (
                                    <List.Item
                                        actions={[
                                            <Popconfirm
                                                key="delete"
                                                title="确定删除此购买记录吗？"
                                                onConfirm={() => handleDelete(record.id)}
                                                okText="删除"
                                                cancelText="取消"
                                            >
                                                <Button
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                    danger
                                                    size="small"
                                                />
                                            </Popconfirm>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                        {dayjs(record.purchaseDate).format('YYYY-MM-DD')}
                                                    </span>
                                                    {record.colorCode && (
                                                        <Tag color="blue" style={{ marginLeft: '8px' }}>
                                                            {record.colorCode}
                                                        </Tag>
                                                    )}
                                                    {record.price && (
                                                        <Tag color="green">
                                                            ¥{record.price.toFixed(2)}
                                                        </Tag>
                                                    )}
                                                </div>
                                            }
                                            description={record.note}
                                        />
                                    </List.Item>
                                )}
                                style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '0 12px'
                                }}
                            />
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        暂无购买记录
                                    </span>
                                }
                            />
                        )}
                    </div>
                </Spin>
            </Modal>
        </>
    );
};

export default PurchaseModal;
