// src/pages/admin/Content/TagManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Input, Space, Tag, message, Tooltip, Card, Pagination, Form, Switch,
    ColorPicker, Typography,
    Modal
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDebounce } from 'ahooks';

import * as adminTagService from '@/services/adminTagService';
import type { TagListItem, TagCreateRequest, TagUpdateRequest } from '@/services/adminTagService';
import { usePageTitle } from "@/hooks/business/usePageTitle.ts";
import VerificationModal from '@/components/Common/VerificationModal';
import { modalGlassCardStyle } from '@/constants/styles';

const { Title } = Typography;

const TagManagement: React.FC = () => {
    usePageTitle('标签管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki的歇脚处'
    })
    const [tags, setTags] = useState<TagListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState('');
    const debouncedKeyword = useDebounce(searchKeyword, { wait: 500 });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTag, setEditingTag] = useState<TagListItem | null>(null);
    const [form] = Form.useForm();

    // 删除确认状态
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingTag, setDeletingTag] = useState<TagListItem | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const loadTags = useCallback(async () => {
        setLoading(true);
        try {
            const params: adminTagService.GetAdminTagsParams = {
                page: currentPage - 1,
                size: pageSize,
                sort: 'name,asc',
                keyword: debouncedKeyword.trim() || undefined,
            };
            const res = await adminTagService.getAdminTags(params);
            if (res.success) {
                setTags(res.data.content);
                setTotal(res.data.totalElements);
            }
        } catch (error) {
            console.error('Failed to load tags:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedKeyword]);

    useEffect(() => {
        loadTags();
    }, [loadTags]);

    const handleShowModal = (tag: TagListItem | null = null) => {
        setEditingTag(tag);
        if (tag) {
            // 当有颜色值时，确保 ColorPicker 能正确接收
            form.setFieldsValue({
                ...tag,
                color: tag.color || '#1677ff', // 提供一个默认颜色以防为空
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ featured: false, color: '#1677ff' }); // 新建时设置默认值
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingTag(null);
    };

    const handleFormSubmit = async (values: any) => {
        // antd ColorPicker 返回的是 Color 对象，我们需要转为 hex 字符串
        const colorString = typeof values.color === 'string' ? values.color : values.color?.toHexString();
        const payload = { ...values, color: colorString };

        try {
            if (editingTag) {
                const res = await adminTagService.updateTag(editingTag.id, payload as TagUpdateRequest);
                message.success(res.message || '标签更新成功');
            } else {
                const res = await adminTagService.createTag(payload as TagCreateRequest);
                message.success(res.message || '标签创建成功');
            }
            setIsModalVisible(false);
            await loadTags();
        } catch (error) {
            console.error('Form submission failed:', error);
        }
    };

    const showDeleteConfirm = (record: TagListItem) => {
        setDeletingTag(record);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingTag) return;

        setDeleteLoading(true);
        try {
            const res = await adminTagService.deleteTag(deletingTag.id);
            message.success(res.message || '标签删除成功');
            setDeleteModalVisible(false);
            setDeletingTag(null);
            await loadTags();
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
        setDeletingTag(null);
    };

    const columns: ColumnsType<TagListItem> = [
        {
            title: '名称',
            dataIndex: 'name',
            render: (text, record) => <Tag color={record.color || '#108ee9'}>{text}</Tag>,
        },
        { title: '路径 (Slug)', dataIndex: 'slug' },
        { title: '描述', dataIndex: 'description' },
        { title: '文章数', dataIndex: 'articleCount', align: 'center' },
        { title: '设为推荐', dataIndex: 'featured', align: 'center', render: (featured) => featured ? '是' : '否' },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="编辑"><Button type="text" icon={<EditOutlined />} onClick={() => handleShowModal(record)} /></Tooltip>
                    <Tooltip title="删除"><Button type="text" danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)} /></Tooltip>
                </Space>
            ),
        },
    ];

    // --- 为模态框内的表单控件定义统一样式 ---
    const glassInputStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
    };

    const labelStyle: React.CSSProperties = {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 500,
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>标签管理</h1>
                <Space>
                    <Input.Search
                        placeholder="搜索标签..."
                        allowClear
                        onSearch={(value) => { setCurrentPage(1); setSearchKeyword(value); }}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={{ width: 300 }}
                        enterButton
                    />
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => handleShowModal()}>新建标签</Button>
                </Space>
            </div>
            <Card className="glass-effect border-0 shadow-xl" bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={tags}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    style={{ background: 'transparent' }}
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
            </Card>

            {/* --- 修改后的模态框 --- */}
            <Modal
                title={null} // 移除默认标题
                footer={null} // 移除默认页脚
                open={isModalVisible}
                onCancel={handleCancel}
                destroyOnClose
                centered
                closable={false}
                // 强制将 Modal 内容容器变透明，并移除阴影
                styles={{
                    content: { background: 'transparent', boxShadow: 'none', padding: 0 },
                    mask: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }
                }}
                bodyStyle={{ padding: 0 }}
            >
                {/* 玻璃拟态容器 */}
                <div style={{
                    ...modalGlassCardStyle,
                    padding: '24px',
                }}>
                    <Title level={4} style={{ color: 'white', margin: 0, marginBottom: '24px', textShadow: '1px 1px 3px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                        {editingTag ? '编辑标签' : '新建标签'}
                    </Title>
                    <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                        <Form.Item name="name" label={<span style={labelStyle}>名称</span>} rules={[{ required: true, message: '请输入标签名称' }]}>
                            <Input style={glassInputStyle} />
                        </Form.Item>
                        <Form.Item name="slug" label={<span style={labelStyle}>路径 (Slug)</span>} help={<span style={{color: 'rgba(255,255,255,0.7)'}}>留空将根据名称自动生成</span>}>
                            <Input style={glassInputStyle} />
                        </Form.Item>
                        <Form.Item name="description" label={<span style={labelStyle}>描述</span>}>
                            <Input.TextArea rows={3} style={glassInputStyle} />
                        </Form.Item>
                        <Form.Item name="color" label={<span style={labelStyle}>颜色</span>}>
                            <ColorPicker showText />
                        </Form.Item>
                        <Form.Item name="icon" label={<span style={labelStyle}>图标</span>}>
                            <Input placeholder="例如：fab fa-react" style={glassInputStyle} />
                        </Form.Item>
                        <Form.Item name="featured" label={<span style={labelStyle}>推荐标签</span>} valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Form>
                    <div style={{ textAlign: 'right', marginTop: '16px' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 8 }}>取消</Button>
                        <Button type="primary" onClick={() => form.submit()}>提交</Button>
                    </div>
                </div>
            </Modal>

            {/* 删除确认模态框 */}
            <VerificationModal
                visible={deleteModalVisible}
                onCancel={handleDeleteCancel}
                onSubmit={handleDeleteConfirm}
                isSubmitting={deleteLoading}
                title={`删除标签「${deletingTag?.name}」`}
                content={
                    <div>
                        <p>只有未关联任何文章的标签才能被删除。此操作不可撤销。</p>
                        {deletingTag && deletingTag.articleCount > 0 && (
                            <p style={{ color: '#ff4d4f' }}>
                                ⚠️ 该标签关联了 {deletingTag.articleCount} 篇文章，无法删除
                            </p>
                        )}
                    </div>
                }
                requireVerification={false}
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

export default TagManagement;
