import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Input, Select, DatePicker, InputNumber, Switch,
    Button, Space, Row, Col, message, Divider, Progress
} from 'antd';
import { ShoppingOutlined, CloudUploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import {
    createAccountingRecord,
    updateAccountingRecord,
    getAccountingCategories,
    getAccountingSubCategories,
    getAccountingAccounts,
} from '@/services/accountingService';
import {
    AccountingRecord,
    AccountingRecordRequest,
    ProductSelectItem,
} from '@/types/accounting';
import ProductSelectModal from './ProductSelectModal';
import ImageUploader, { FileWithPreview } from '@/components/Upload/ImageUploader';
import { useUpload } from '@/hooks/api/useUpload';

const { TextArea } = Input;

interface AccountingFormModalProps {
    visible: boolean;
    record: AccountingRecord | null;
    onCancel: () => void;
    onSuccess: () => void;
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
    },
    footer: {
        backgroundColor: 'transparent',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
};

// 暗色玻璃拟态样式CSS
const darkGlassStyles = `
    /* 暗色玻璃拟态表单样式 */
    .accounting-modal .ant-modal-title {
        color: white !important;
    }
    .accounting-modal .ant-modal-close {
        color: rgba(255, 255, 255, 0.7) !important;
    }
    .accounting-modal .ant-modal-close:hover {
        color: white !important;
        background: rgba(255, 255, 255, 0.1) !important;
    }

    /* Form Label */
    .accounting-modal .ant-form-item-label > label {
        color: rgba(255, 255, 255, 0.9) !important;
    }

    /* DatePicker 暗色样式 */
    .accounting-modal .ant-picker {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 8px !important;
    }
    .accounting-modal .ant-picker:hover {
        border-color: rgba(255, 255, 255, 0.4) !important;
    }
    .accounting-modal .ant-picker-focused {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
    }
    .accounting-modal .ant-picker-input > input {
        color: white !important;
    }
    .accounting-modal .ant-picker-input > input::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
    }
    .accounting-modal .ant-picker-suffix,
    .accounting-modal .ant-picker-clear {
        color: rgba(255, 255, 255, 0.6) !important;
    }

    /* Select 暗色样式 */
    .accounting-modal .ant-select-selector {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 8px !important;
    }
    .accounting-modal .ant-select:hover .ant-select-selector {
        border-color: rgba(255, 255, 255, 0.4) !important;
    }
    .accounting-modal .ant-select-focused .ant-select-selector {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
    }
    .accounting-modal .ant-select-selection-item,
    .accounting-modal .ant-select-selection-placeholder {
        color: white !important;
    }
    .accounting-modal .ant-select-selection-placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
    }
    .accounting-modal .ant-select-arrow {
        color: rgba(255, 255, 255, 0.6) !important;
    }
    .accounting-modal .ant-select-clear {
        background: rgba(30, 30, 30, 0.95) !important;
        color: rgba(255, 255, 255, 0.6) !important;
    }
    .accounting-modal .ant-select-selection-search-input {
        color: white !important;
    }

    /* Input 暗色样式 */
    .accounting-modal .ant-input,
    .accounting-modal .ant-input-number {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 8px !important;
        color: white !important;
    }
    .accounting-modal .ant-input:hover,
    .accounting-modal .ant-input-number:hover {
        border-color: rgba(255, 255, 255, 0.4) !important;
    }
    .accounting-modal .ant-input:focus,
    .accounting-modal .ant-input-focused,
    .accounting-modal .ant-input-number:focus,
    .accounting-modal .ant-input-number-focused {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
    }
    .accounting-modal .ant-input::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
    }
    .accounting-modal .ant-input-number-input {
        color: white !important;
    }
    .accounting-modal .ant-input-number-input::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
    }
    .accounting-modal .ant-input-number-handler-wrap {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
    }
    .accounting-modal .ant-input-number-handler {
        border-color: rgba(255, 255, 255, 0.2) !important;
    }
    .accounting-modal .ant-input-number-handler-up-inner,
    .accounting-modal .ant-input-number-handler-down-inner {
        color: rgba(255, 255, 255, 0.6) !important;
    }

    /* TextArea */
    .accounting-modal textarea.ant-input {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: white !important;
    }

    /* Switch 暗色样式 */
    .accounting-modal .ant-switch {
        background: rgba(255, 255, 255, 0.2) !important;
    }
    .accounting-modal .ant-switch-checked {
        background: #1890ff !important;
    }

    /* Divider */
    .accounting-modal .ant-divider {
        border-color: rgba(255, 255, 255, 0.15) !important;
        color: rgba(255, 255, 255, 0.7) !important;
    }
    .accounting-modal .ant-divider-inner-text {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    /* Footer Buttons */
    .accounting-modal .ant-modal-footer .ant-btn-default {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: rgba(255, 255, 255, 0.9) !important;
    }
    .accounting-modal .ant-modal-footer .ant-btn-default:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
        color: white !important;
    }
    .accounting-modal .ant-modal-footer .ant-btn-primary {
        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
        border: none !important;
    }
    .accounting-modal .ant-modal-footer .ant-btn-primary:hover {
        background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%) !important;
    }
    .accounting-modal .ant-modal-footer .ant-btn-primary:disabled {
        background: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 0.3) !important;
    }

    /* DatePicker 下拉面板暗色样式 */
    .dark-accounting-picker-dropdown {
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-panel-container {
        background: rgba(30, 30, 30, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 12px !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-header {
        background: transparent !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: white !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-header button {
        color: rgba(255, 255, 255, 0.7) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-header button:hover {
        color: white !important;
        background: rgba(255, 255, 255, 0.1) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-content th {
        color: rgba(255, 255, 255, 0.6) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-cell {
        color: rgba(255, 255, 255, 0.85) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-cell:hover:not(.ant-picker-cell-selected) .ant-picker-cell-inner {
        background: rgba(255, 255, 255, 0.1) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
        border-color: #1890ff !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-footer {
        background: transparent !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-today-btn,
    .dark-accounting-picker-dropdown .ant-picker-now-btn {
        color: #1890ff !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-ok button {
        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
        border: none !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-time-panel-column > li.ant-picker-time-panel-cell .ant-picker-time-panel-cell-inner {
        color: rgba(255, 255, 255, 0.85) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-time-panel-column > li.ant-picker-time-panel-cell:hover .ant-picker-time-panel-cell-inner {
        background: rgba(255, 255, 255, 0.1) !important;
    }
    .dark-accounting-picker-dropdown .ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
        background: rgba(24, 144, 255, 0.3) !important;
        color: #40a9ff !important;
    }

    /* Select 下拉面板暗色样式 */
    .dark-accounting-select-dropdown {
        background: rgba(30, 30, 30, 0.95) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 10px !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
        padding: 4px !important;
    }
    .dark-accounting-select-dropdown .ant-select-item {
        color: rgba(255, 255, 255, 0.85) !important;
        border-radius: 6px !important;
    }
    .dark-accounting-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
        background: rgba(255, 255, 255, 0.1) !important;
    }
    .dark-accounting-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
        background: rgba(24, 144, 255, 0.25) !important;
        color: #40a9ff !important;
    }

    /* Progress Bar */
    .accounting-modal .ant-progress-text {
        color: rgba(255, 255, 255, 0.9) !important;
    }

    /* ImageUploader 暗色样式 */
    .accounting-modal .ant-upload-wrapper {
        color: rgba(255, 255, 255, 0.85) !important;
    }
    .accounting-modal .ant-upload-drag {
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px dashed rgba(255, 255, 255, 0.3) !important;
    }
    .accounting-modal .ant-upload-drag:hover {
        border-color: #1890ff !important;
    }
    .accounting-modal .ant-upload-drag-icon,
    .accounting-modal .ant-upload-text,
    .accounting-modal .ant-upload-hint {
        color: rgba(255, 255, 255, 0.7) !important;
    }
`;

const AccountingFormModal: React.FC<AccountingFormModalProps> = ({
    visible,
    record,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [subCategories, setSubCategories] = useState<string[]>([]);
    const [accounts, setAccounts] = useState<string[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductSelectItem | null>(null);
    const [productModalVisible, setProductModalVisible] = useState(false);

    // 图片上传相关状态
    const { uploadFile } = useUpload();
    const [pendingFiles, setPendingFiles] = useState<FileWithPreview[]>([]);
    const [existingUrls, setExistingUrls] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingFileName, setUploadingFileName] = useState('');

    const isEditing = !!record;
    const selectedType = Form.useWatch('type', form);
    const hasUnsavedFiles = pendingFiles.length > 0;

    // 加载分类
    useEffect(() => {
        const loadData = async () => {
            try {
                const [catRes, accRes] = await Promise.all([
                    getAccountingCategories(),
                    getAccountingAccounts(),
                ]);
                if (catRes.success) setCategories(catRes.data);
                if (accRes.success) setAccounts(accRes.data);
            } catch (error) {
                console.error('Failed to load form data', error);
            }
        };
        if (visible) {
            loadData();
        }
    }, [visible]);

    // 初始化表单
    useEffect(() => {
        if (visible) {
            if (record) {
                form.setFieldsValue({
                    ...record,
                    recordTime: dayjs(record.recordTime),
                    tags: record.tags?.join(','),
                });
                setSelectedProduct(record.linkedProduct || null);
                // 初始化已有图片
                setExistingUrls(record.billImages || []);
                setPendingFiles([]);

                // 加载二级分类
                if (record.category) {
                    loadSubCategories(record.category);
                }
            } else {
                form.resetFields();
                form.setFieldsValue({
                    recordTime: dayjs(),
                    type: 'EXPENSE',
                    currency: 'CNY',
                    isReimbursed: false,
                });
                setSelectedProduct(null);
                setExistingUrls([]);
                setPendingFiles([]);
            }
        }
    }, [visible, record, form]);

    // 加载二级分类
    const loadSubCategories = async (category: string) => {
        try {
            const res = await getAccountingSubCategories(category);
            if (res.success) {
                setSubCategories(res.data);
            }
        } catch (error) {
            console.error('Failed to load sub-categories', error);
        }
    };

    // 分类变化时加载二级分类
    const handleCategoryChange = (value: string) => {
        form.setFieldValue('subCategory', undefined);
        loadSubCategories(value);
    };

    // 商品选择
    const handleProductSelect = (product: ProductSelectItem | null) => {
        setSelectedProduct(product);
        setProductModalVisible(false);
    };

    // 图片变化处理
    const handleImagesChange = (files: FileWithPreview[], urls: string[]) => {
        setPendingFiles(files);
        setExistingUrls(urls);
    };

    // 上传待处理的图片
    const uploadPendingFiles = async (): Promise<string[]> => {
        if (pendingFiles.length === 0) return [];
        const uploadedUrls: string[] = [];
        const totalFiles = pendingFiles.length;

        for (let i = 0; i < totalFiles; i++) {
            const file = pendingFiles[i];
            setUploadingFileName(file.name);
            const baseProgress = (i / totalFiles) * 100;
            try {
                const url = await uploadFile(file, 'image', {
                    onProgress: (percent: number) => setUploadProgress(baseProgress + (percent / totalFiles))
                });
                if (url) {
                    uploadedUrls.push(url);
                } else {
                    message.error(`${file.name} 上传后未获取到URL`);
                }
            } catch (error: any) {
                message.error(`${file.name} 上传失败: ${error.message}`);
            }
        }
        return uploadedUrls;
    };

    // 提交表单
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            setUploadProgress(0);

            // 上传待处理的图片
            const newUploadedUrls = await uploadPendingFiles();

            // 清理blob URLs
            pendingFiles.forEach(file => {
                if (file.preview?.startsWith('blob:')) URL.revokeObjectURL(file.preview);
            });

            // 合并所有图片URL
            const allImageUrls = [...existingUrls, ...newUploadedUrls];

            const data: AccountingRecordRequest = {
                recordTime: values.recordTime.toISOString(),
                category: values.category,
                subCategory: values.subCategory,
                type: values.type,
                amount: values.amount,
                currency: values.currency || 'CNY',
                account1: values.account1,
                account2: values.account2,
                remark: values.remark,
                isReimbursed: values.isReimbursed || false,
                fee: values.fee,
                coupon: values.coupon,
                recorder: values.recorder,
                billMark: values.billMark,
                tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined,
                billImages: allImageUrls.length > 0 ? allImageUrls : undefined,
                linkedProductId: selectedProduct?.id,
            };

            const response = isEditing
                ? await updateAccountingRecord(record!.id, data)
                : await createAccountingRecord(data);

            if (response.success) {
                message.success(isEditing ? '更新成功' : '创建成功');
                // 清理状态
                setPendingFiles([]);
                setExistingUrls(allImageUrls);
                onSuccess();
            }
        } catch (error) {
            message.error(isEditing ? '更新失败' : '创建失败');
        } finally {
            setLoading(false);
            setUploadProgress(0);
            setUploadingFileName('');
        }
    };

    return (
        <>
            <style>{darkGlassStyles}</style>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{isEditing ? '编辑记账' : '新增记账'}</span>
                        {hasUnsavedFiles && (
                            <span style={{
                                fontSize: 12,
                                color: '#faad14',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}>
                                <CloudUploadOutlined />
                                {pendingFiles.length} 张图片待上传
                            </span>
                        )}
                    </div>
                }
                open={visible}
                onCancel={onCancel}
                width={750}
                className="accounting-modal"
                styles={modalStyles}
                footer={[
                    <Button key="cancel" onClick={onCancel} disabled={loading}>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                        {loading ? '处理中...' : (isEditing ? '更新' : '创建')}
                    </Button>,
                ]}
            >
                {/* 上传进度条 */}
                {loading && uploadProgress > 0 && (
                    <div style={{
                        marginBottom: 16,
                        padding: '12px 16px',
                        background: 'rgba(24, 144, 255, 0.15)',
                        borderRadius: 8,
                        border: '1px solid rgba(24, 144, 255, 0.3)',
                    }}>
                        <div style={{ marginBottom: 8, fontSize: 13, color: 'rgba(255, 255, 255, 0.9)' }}>
                            正在上传图片: <strong>{uploadingFileName}</strong>
                        </div>
                        <Progress
                            percent={Math.round(uploadProgress)}
                            status="active"
                            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                        />
                    </div>
                )}

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        type: 'EXPENSE',
                        currency: 'CNY',
                        isReimbursed: false,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="recordTime"
                                label="记账时间"
                                rules={[{ required: true, message: '请选择时间' }]}
                            >
                                <DatePicker
                                    showTime
                                    style={{ width: '100%' }}
                                    disabled={loading}
                                    popupClassName="dark-accounting-picker-dropdown"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="类型"
                                rules={[{ required: true, message: '请选择类型' }]}
                            >
                                <Select
                                    disabled={loading}
                                    popupClassName="dark-accounting-select-dropdown"
                                >
                                    <Select.Option value="EXPENSE">支出</Select.Option>
                                    <Select.Option value="INCOME">收入</Select.Option>
                                    <Select.Option value="TRANSFER">转账</Select.Option>
                                    <Select.Option value="REFUND">退款</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="分类"
                                rules={[{ required: true, message: '请选择或输入分类' }]}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    mode="tags"
                                    maxTagCount={1}
                                    placeholder="选择或输入分类"
                                    disabled={loading}
                                    popupClassName="dark-accounting-select-dropdown"
                                    onChange={(values) => {
                                        if (values && values.length > 0) {
                                            const value = values[values.length - 1];
                                            form.setFieldValue('category', value);
                                            handleCategoryChange(value);
                                        }
                                    }}
                                    value={form.getFieldValue('category') ? [form.getFieldValue('category')] : []}
                                >
                                    {categories.map(cat => (
                                        <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="subCategory" label="二级分类">
                                <Select
                                    showSearch
                                    allowClear
                                    mode="tags"
                                    maxTagCount={1}
                                    placeholder="选择或输入二级分类"
                                    disabled={loading}
                                    popupClassName="dark-accounting-select-dropdown"
                                    onChange={(values) => {
                                        if (values && values.length > 0) {
                                            form.setFieldValue('subCategory', values[values.length - 1]);
                                        } else {
                                            form.setFieldValue('subCategory', undefined);
                                        }
                                    }}
                                    value={form.getFieldValue('subCategory') ? [form.getFieldValue('subCategory')] : []}
                                >
                                    {subCategories.map(sub => (
                                        <Select.Option key={sub} value={sub}>{sub}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="amount"
                                label="金额"
                                rules={[{ required: true, message: '请输入金额' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    precision={2}
                                    placeholder="0.00"
                                    disabled={loading}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="currency" label="币种">
                                <Select disabled={loading} popupClassName="dark-accounting-select-dropdown">
                                    <Select.Option value="CNY">CNY (人民币)</Select.Option>
                                    <Select.Option value="USD">USD (美元)</Select.Option>
                                    <Select.Option value="EUR">EUR (欧元)</Select.Option>
                                    <Select.Option value="JPY">JPY (日元)</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="isReimbursed" label="已报销" valuePropName="checked">
                                <Switch disabled={loading} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="account1" label={selectedType === 'TRANSFER' ? '转出账户' : '账户'}>
                                <Select
                                    showSearch
                                    allowClear
                                    mode="tags"
                                    maxTagCount={1}
                                    placeholder="选择或输入账户"
                                    disabled={loading}
                                    popupClassName="dark-accounting-select-dropdown"
                                    onChange={(values) => {
                                        if (values && values.length > 0) {
                                            form.setFieldValue('account1', values[values.length - 1]);
                                        } else {
                                            form.setFieldValue('account1', undefined);
                                        }
                                    }}
                                    value={form.getFieldValue('account1') ? [form.getFieldValue('account1')] : []}
                                >
                                    {accounts.map(acc => (
                                        <Select.Option key={acc} value={acc}>{acc}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        {selectedType === 'TRANSFER' && (
                            <Col span={12}>
                                <Form.Item name="account2" label="转入账户">
                                    <Select
                                        showSearch
                                        allowClear
                                        mode="tags"
                                        maxTagCount={1}
                                        placeholder="选择或输入账户"
                                        disabled={loading}
                                        popupClassName="dark-accounting-select-dropdown"
                                        onChange={(values) => {
                                            if (values && values.length > 0) {
                                                form.setFieldValue('account2', values[values.length - 1]);
                                            } else {
                                                form.setFieldValue('account2', undefined);
                                            }
                                        }}
                                        value={form.getFieldValue('account2') ? [form.getFieldValue('account2')] : []}
                                    >
                                        {accounts.map(acc => (
                                            <Select.Option key={acc} value={acc}>{acc}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        )}
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="fee" label="手续费">
                                <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" disabled={loading} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="coupon" label="优惠券">
                                <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" disabled={loading} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="remark" label="备注">
                        <TextArea rows={2} placeholder="输入备注信息" disabled={loading} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="recorder" label="记账者">
                                <Input placeholder="记账者姓名" disabled={loading} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="tags" label="标签">
                                <Input placeholder="多个标签用逗号分隔" disabled={loading} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>账单图片</Divider>

                    <Form.Item label="上传账单图片 (支持拖拽排序，最多5张)">
                        <ImageUploader
                            value={existingUrls}
                            onChange={handleImagesChange}
                            multiple={true}
                            maxCount={5}
                            enableCrop={false}
                            enableDragSort={true}
                            showPreview={true}
                            uploadMode="delayed"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Divider>关联商品</Divider>

                    <Form.Item label="关联商品">
                        <Space>
                            {selectedProduct ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '8px 12px',
                                    background: 'rgba(24, 144, 255, 0.15)',
                                    borderRadius: 8,
                                    border: '1px solid rgba(24, 144, 255, 0.3)',
                                }}>
                                    {selectedProduct.mainImage && (
                                        <img
                                            src={selectedProduct.mainImage}
                                            alt={selectedProduct.name}
                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                        />
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>{selectedProduct.name}</div>
                                        {selectedProduct.price && (
                                            <div style={{ fontSize: 12, color: '#ff4d4f' }}>
                                                ¥{selectedProduct.price}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        size="small"
                                        onClick={() => setSelectedProduct(null)}
                                        disabled={loading}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: 'rgba(255, 255, 255, 0.9)',
                                        }}
                                    >
                                        移除
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    icon={<ShoppingOutlined />}
                                    onClick={() => setProductModalVisible(true)}
                                    disabled={loading}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                    }}
                                >
                                    选择商品
                                </Button>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 商品选择弹窗 */}
            <ProductSelectModal
                visible={productModalVisible}
                onCancel={() => setProductModalVisible(false)}
                onSelect={handleProductSelect}
                selectedProduct={selectedProduct}
            />
        </>
    );
};

export default AccountingFormModal;
