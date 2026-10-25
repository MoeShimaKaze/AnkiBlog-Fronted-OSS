// src/pages/admin/Content/ProductCategoryManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    message,
    Tooltip,
    Card,
    Form,
    Input,
    Switch,
    InputNumber,
    TreeSelect,
    Spin,
    Typography,
    Alert,
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import * as adminCategoryService from '@/services/adminProductCategoryService';
import type {
    AdminCategoryListItem,
    CategoryCreateRequest,
    CategoryUpdateRequest
} from '@/services/adminProductCategoryService';
import { modalGlassCardStyle } from '@/constants/styles';
import { usePageTitle } from "@/hooks/business/usePageTitle.ts";
import VerificationModal from '@/components/Common/VerificationModal';

const { Title, Text } = Typography;

// 辅助函数：转换数据以适应TreeSelect，并禁用指定节点及其后代
const transformToTreeSelectData = (nodes: AdminCategoryListItem[], disabledNodeId?: string): any[] => {
    const isNodeDisabled = (node: AdminCategoryListItem, disabledId?: string): boolean => {
        if (!disabledId) return false;
        if (node.id === disabledId) return true;
        if (node.children) {
            return node.children.some(child => isNodeDisabled(child, disabledId));
        }
        return false;
    };

    return nodes.map(node => ({
        title: `${node.name} (${node.productCount}个商品)`,
        value: node.id,
        disabled: isNodeDisabled(node, disabledNodeId),
        children: node.children ? transformToTreeSelectData(node.children, disabledNodeId) : [],
    }));
};

// 辅助函数：扁平化树形数据（仅用于统计）
const flattenTreeData = (nodes: AdminCategoryListItem[]): AdminCategoryListItem[] => {
    const result: AdminCategoryListItem[] = [];
    const traverse = (items: AdminCategoryListItem[]) => {
        items.forEach(item => {
            result.push(item);
            if (item.children && item.children.length > 0) {
                traverse(item.children);
            }
        });
    };
    traverse(nodes);
    return result;
};

// 辅助函数：计算真实商品总数（避免重复计算）
const calculateTotalProducts = (nodes: AdminCategoryListItem[]): number => {
    let total = 0;
    const traverse = (items: AdminCategoryListItem[]) => {
        items.forEach(item => {
            // 如果是叶子节点（没有子分类），则计算其商品数
            if (!item.children || item.children.length === 0) {
                total += item.productCount;
            } else {
                // 如果有子分类，则递归计算子分类
                traverse(item.children);
            }
        });
    };
    traverse(nodes);
    return total;
};

// 辅助函数：为表格数据添加 key
const addKeysToTreeData = (nodes: AdminCategoryListItem[]): AdminCategoryListItem[] => {
    return nodes.map(node => ({
        ...node,
        key: node.id,
        children: node.children && node.children.length > 0 ? addKeysToTreeData(node.children) : undefined
    }));
};

const ProductCategoryManagement: React.FC = () => {
    usePageTitle('商品类型管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki的歇脚处'
    });

    // 状态管理
    const [categories, setCategories] = useState<AdminCategoryListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AdminCategoryListItem | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();

    // 删除相关状态
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<AdminCategoryListItem | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [warningModalVisible, setWarningModalVisible] = useState(false);
    const [warningContent, setWarningContent] = useState<React.ReactNode>(null);

    // 加载分类树数据
    const loadCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminCategoryService.getCategoryTree();
            if (res.success && res.data) {
                setCategories(res.data);
            } else {
                message.error(res.message || '获取分类数据失败');
                setCategories([]);
            }
        } catch (error: any) {
            console.error('Failed to load categories:', error);
            if (error.name === 'BusinessError' && error.data) {
                message.error(error.data.message || '获取分类数据失败');
            } else {
                message.error('网络错误，获取分类数据失败');
            }
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // 前端过滤获取可用父分类并重建树结构
    const getAvailableParentTree = useCallback((allCategories: AdminCategoryListItem[]): AdminCategoryListItem[] => {
        const buildFilteredTree = (nodes: AdminCategoryListItem[]): AdminCategoryListItem[] => {
            return nodes
                .filter(node => node.active && node.level < 3) // 只保留激活且层级小于3的分类
                .map(node => ({
                    ...node,
                    children: node.children ? buildFilteredTree(node.children) : undefined
                }));
        };
        return buildFilteredTree(allCategories);
    }, []);

    // 模态框样式定义
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

    const glassDropdownStyle: React.CSSProperties = {
        background: 'rgba(50, 50, 50, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
    };

    // TreeSelect和分页组件的自定义样式
    React.useEffect(() => {
        // 为TreeSelect下拉框添加样式
        const style = document.createElement('style');
        style.textContent = `
            .ant-select-dropdown {
                background: rgba(50, 50, 50, 0.85) !important;
                backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 8px !important;
            }
            
            .ant-select-item {
                background: transparent !important;
                color: rgba(255, 255, 255, 0.9) !important;
            }
            
            .ant-select-item:hover {
                background: rgba(255, 255, 255, 0.1) !important;
            }
            
            .ant-select-item-option-selected {
                background: rgba(24, 144, 255, 0.2) !important;
                color: white !important;
            }
            
            .ant-tree-select-dropdown .ant-select-tree {
                background: transparent !important;
            }
            
            .ant-tree-select-dropdown .ant-select-tree-treenode {
                color: rgba(255, 255, 255, 0.9) !important;
            }
            
            .ant-tree-select-dropdown .ant-select-tree-treenode:hover {
                background: rgba(255, 255, 255, 0.1) !important;
            }
            
            .ant-tree-select-dropdown .ant-select-tree-treenode-selected {
                background: rgba(24, 144, 255, 0.2) !important;
            }
            
            /* 分页样式 */
            .ant-pagination .ant-pagination-options-size-changer.ant-select {
                background: rgba(255, 255, 255, 0.15) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                border-radius: 6px !important;
            }
            
            .ant-pagination .ant-pagination-options-size-changer.ant-select .ant-select-selector {
                background: transparent !important;
                border: none !important;
                color: white !important;
            }
            
            .ant-pagination .ant-pagination-options-size-changer.ant-select .ant-select-arrow {
                color: rgba(255, 255, 255, 0.7) !important;
            }
            
            .ant-pagination .ant-pagination-options-quick-jumper input {
                background: rgba(255, 255, 255, 0.15) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                color: white !important;
                border-radius: 4px !important;
            }
            
            .ant-pagination .ant-pagination-options-quick-jumper input::placeholder {
                color: rgba(255, 255, 255, 0.5) !important;
            }
            
            .ant-pagination .ant-pagination-item {
                background: rgba(255, 255, 255, 0.1) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            
            .ant-pagination .ant-pagination-item a {
                color: rgba(255, 255, 255, 0.8) !important;
            }
            
            .ant-pagination .ant-pagination-item:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                border-color: rgba(255, 255, 255, 0.4) !important;
            }
            
            .ant-pagination .ant-pagination-item-active {
                background: rgba(24, 144, 255, 0.3) !important;
                border-color: rgba(24, 144, 255, 0.6) !important;
            }
            
            .ant-pagination .ant-pagination-item-active a {
                color: white !important;
            }
            
            .ant-pagination .ant-pagination-prev, 
            .ant-pagination .ant-pagination-next {
                background: rgba(255, 255, 255, 0.1) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            
            .ant-pagination .ant-pagination-prev:hover, 
            .ant-pagination .ant-pagination-next:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                border-color: rgba(255, 255, 255, 0.4) !important;
            }
            
            .ant-pagination .ant-pagination-prev a, 
            .ant-pagination .ant-pagination-next a {
                color: rgba(255, 255, 255, 0.8) !important;
            }
            
            .ant-pagination .ant-pagination-options {
                color: rgba(255, 255, 255, 0.8) !important;
            }
            
            .ant-pagination .ant-pagination-total-text {
                color: rgba(255, 255, 255, 0.8) !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // 组件初始化
    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // 显示创建/编辑模态框
    const handleShowModal = (category: AdminCategoryListItem | null = null) => {
        setEditingCategory(category);

        if (category) {
            // 编辑模式：设置表单值
            form.setFieldsValue({
                name: category.name,
                parentId: category.parentId || undefined,
                slug: category.slug,
                description: category.description,
                icon: category.icon,
                coverImage: category.coverImage,
                sortOrder: category.sortOrder,
                active: category.active,
                featured: category.featured,
                showInMenu: category.showInMenu
            });
        } else {
            // 新建模式：重置表单并设置默认值
            form.resetFields();
            form.setFieldsValue({
                active: true,
                featured: false,
                showInMenu: true,
                sortOrder: 0,
                parentId: undefined
            });
        }

        setIsModalVisible(true);
    };

    // 取消模态框
    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
    };

    // 表单提交处理
    const handleFormSubmit = async (values: CategoryCreateRequest | CategoryUpdateRequest) => {
        // 关键修正：将parentId的falsy值转为undefined
        const payload = {
            ...values,
            parentId: values.parentId || undefined,
            sortOrder: values.sortOrder || 0
        };

        setSubmitLoading(true);

        try {
            if (editingCategory) {
                // 更新分类
                const response = await adminCategoryService.updateCategory(editingCategory.id, payload);
                if (response.success) {
                    message.success('分类更新成功');
                } else {
                    throw new Error(response.message || '更新失败');
                }
            } else {
                // 创建分类
                const response = await adminCategoryService.createCategory(payload as CategoryCreateRequest);
                if (response.success) {
                    message.success('分类创建成功');
                } else {
                    throw new Error(response.message || '创建失败');
                }
            }

            setIsModalVisible(false);
            setEditingCategory(null);
            form.resetFields();

            // 刷新数据
            await loadCategories();

        } catch (error: any) {
            console.error('Form submission failed:', error);

            // 详细的错误处理
            if (error.name === 'BusinessError' && error.data) {
                message.error(error.data.message || '操作失败');
            } else if (error.message) {
                // 处理具体的业务错误信息
                if (error.message.includes('父分类不存在')) {
                    message.error('指定的父分类不存在，请重新选择或创建根分类');
                } else if (error.message.includes('分类层级不能超过')) {
                    message.error('分类层级不能超过4级，请选择其他父分类');
                } else if (error.message.includes('已存在相同名称')) {
                    message.error('同级分类中已存在相同名称的分类，请修改分类名称');
                } else {
                    message.error(error.message);
                }
            } else {
                message.error('系统错误，请稍后重试');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    // 显示删除确认对话框
    const showDeleteConfirm = (record: AdminCategoryListItem) => {
        const hasChildren = record.children && record.children.length > 0;
        const hasProducts = record.productCount > 0;

        if (hasChildren || hasProducts) {
            // 如果有子分类或商品，显示警告但不允许删除
            setWarningContent(
                <div>
                    <p>分类「{record.name}」无法删除：</p>
                    {hasChildren && <p style={{ color: '#ff4d4f' }}>• 该分类包含 {record.children?.length} 个子分类</p>}
                    {hasProducts && <p style={{ color: '#ff4d4f' }}>• 该分类包含 {record.productCount} 个商品</p>}
                    <p>请先处理相关数据后再删除。</p>
                </div>
            );
            setWarningModalVisible(true);
            return;
        }

        // 如果可以删除，显示简单确认（无需验证码）
        setDeletingCategory(record);
        setDeleteModalVisible(true);
    };

    // 处理删除确认
    const handleDeleteConfirm = async () => {
        if (!deletingCategory) return;

        setDeleteLoading(true);
        try {
            const response = await adminCategoryService.deleteCategory(deletingCategory.id);
            if (response.success) {
                message.success('分类删除成功');
                setDeleteModalVisible(false);
                setDeletingCategory(null);
                await loadCategories();
            } else {
                throw new Error(response.message || '删除失败');
            }
        } catch (error: any) {
            console.error('Delete failed:', error);

            if (error.name === 'BusinessError' && error.data) {
                message.error(error.data.message || '删除失败');
            } else if (error.message) {
                if (error.message.includes('包含子分类或商品')) {
                    message.error('该分类包含子分类或商品，无法删除');
                } else {
                    message.error(error.message);
                }
            } else {
                message.error('删除失败，请稍后重试');
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    // 取消删除
    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
        setDeletingCategory(null);
    };

    // 表格列定义
    const columns: ColumnsType<AdminCategoryListItem> = [
        {
            title: '分类名称',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (text: string, record: AdminCategoryListItem) => (
                <Space>
                    <Text strong>{text}</Text>
                    {record.level > 0 && (
                        <Tag color="blue">L{record.level}</Tag>
                    )}
                </Space>
            )
        },
        {
            title: '路径 (Slug)',
            dataIndex: 'slug',
            key: 'slug',
            width: 150,
            render: (text: string) => (
                <Text code style={{ fontSize: '12px' }}>{text}</Text>
            )
        },
        {
            title: '父分类',
            dataIndex: 'parentName',
            key: 'parentName',
            width: 120,
            render: (text: string) => text || <Text type="secondary">根分类</Text>
        },
        {
            title: '商品数',
            dataIndex: 'productCount',
            key: 'productCount',
            align: 'center',
            width: 80,
            render: (count: number) => (
                <Tag color={count > 0 ? 'green' : 'default'}>{count}</Tag>
            )
        },
        {
            title: '状态',
            key: 'status',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Space size="small">
                        {record.active ?
                            <Tag color="success">已激活</Tag> :
                            <Tag color="default">未激活</Tag>
                        }
                        {record.featured && <Tag color="volcano">推荐</Tag>}
                    </Space>
                    {record.showInMenu && <Tag color="blue">菜单显示</Tag>}
                </Space>
            )
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
            align: 'center',
            width: 80
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="编辑">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleShowModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteConfirm(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // 扁平化的分类数据用于统计
    const flatCategories = flattenTreeData(categories);
    // 带key的树形数据用于表格显示
    const treeDataWithKeys = addKeysToTreeData(categories);
    // 计算真实商品总数
    const totalProducts = calculateTotalProducts(categories);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 200px)'
            }}>
                <Spin size="large" tip="正在加载分类数据..." />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            {/* 页面头部 */}
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
                        marginBottom: '8px'
                    }}>
                        商品分类管理
                    </h1>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        管理商品分类层次结构，支持最多4级分类嵌套
                    </Text>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadCategories}
                        loading={loading}
                    >
                        刷新
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => handleShowModal()}
                    >
                        新建分类
                    </Button>
                </Space>
            </div>

            {/* 数据统计信息 */}
            {flatCategories.length > 0 && (
                <Alert
                    message={
                        <Space>
                            <InfoCircleOutlined />
                            <span>
                                共 {flatCategories.length} 个分类，
                                其中根分类 {flatCategories.filter(c => c.level === 0).length} 个，
                                总商品数 {totalProducts} 个
                            </span>
                        </Space>
                    }
                    type="info"
                    showIcon={false}
                    style={{
                        marginBottom: '16px',
                        background: 'rgba(24, 144, 255, 0.1)',
                        border: '1px solid rgba(24, 144, 255, 0.2)'
                    }}
                />
            )}

            {/* 分类表格 */}
            <Card className="glass-effect border-0 shadow-xl" bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={treeDataWithKeys}
                    rowKey="id"
                    pagination={{
                        pageSize: 50,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`
                    }}
                    expandable={{
                        defaultExpandAllRows: false,
                        expandRowByClick: false,
                        childrenColumnName: 'children'
                    }}
                    style={{ background: 'transparent' }}
                    size="middle"
                />
            </Card>

            {/* 创建/编辑模态框 */}
            <Modal
                title={null}
                footer={null}
                open={isModalVisible}
                onCancel={handleCancel}
                destroyOnClose
                centered
                closable={false}
                width={600}
                styles={{
                    content: { background: 'transparent', boxShadow: 'none', padding: 0 },
                    mask: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }
                }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{
                    ...modalGlassCardStyle,
                    padding: '24px',
                }}>
                    {/* 模态框标题 */}
                    <Title level={4} style={{
                        color: 'white',
                        margin: 0,
                        marginBottom: '24px',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                        textAlign: 'center'
                    }}>
                        {editingCategory ? '编辑分类' : '新建分类'}
                    </Title>

                    {/* 操作说明 */}
                    <Alert
                        message={editingCategory ?
                            "编辑分类信息，留空父分类字段将设置为根分类" :
                            "创建新分类，留空父分类字段将创建根分类"
                        }
                        type="info"
                        showIcon
                        style={{
                            marginBottom: '24px',
                            background: 'rgba(24, 144, 255, 0.1)',
                            border: '1px solid rgba(24, 144, 255, 0.3)'
                        }}
                    />

                    {/* 分类表单 */}
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFormSubmit}
                        preserve={false}
                    >
                        <Form.Item
                            name="name"
                            label={<span style={labelStyle}>分类名称</span>}
                            rules={[
                                { required: true, message: '请输入分类名称' },
                                { max: 100, message: '分类名称不能超过100个字符' }
                            ]}
                        >
                            <Input
                                style={glassInputStyle}
                                placeholder="请输入分类名称"
                            />
                        </Form.Item>

                        <Form.Item
                            name="parentId"
                            label={<span style={labelStyle}>父级分类</span>}
                        >
                            <TreeSelect
                                style={glassInputStyle}
                                dropdownStyle={glassDropdownStyle}
                                treeData={transformToTreeSelectData(
                                    getAvailableParentTree(categories),
                                    editingCategory?.id
                                )}
                                placeholder="留空则为根分类"
                                allowClear
                                treeDefaultExpandAll
                                loading={loading}
                                showSearch
                                treeNodeFilterProp="title"
                            />
                        </Form.Item>

                        <Form.Item
                            name="slug"
                            label={<span style={labelStyle}>路径标识符 (Slug)</span>}
                            help={<span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                留空将根据名称自动生成，只能包含小写字母、数字和连字符
                            </span>}
                            rules={[
                                { pattern: /^[a-z0-9-]*$/, message: '只能包含小写字母、数字和连字符' },
                                { max: 150, message: '路径标识符不能超过150个字符' }
                            ]}
                        >
                            <Input
                                style={glassInputStyle}
                                placeholder="留空自动生成"
                            />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label={<span style={labelStyle}>分类描述</span>}
                            rules={[
                                { max: 1000, message: '描述不能超过1000个字符' }
                            ]}
                        >
                            <Input.TextArea
                                rows={3}
                                style={glassInputStyle}
                                placeholder="请输入分类描述"
                            />
                        </Form.Item>

                        <Form.Item
                            name="sortOrder"
                            label={<span style={labelStyle}>排序值</span>}
                            help={<span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                数值越小越靠前显示
                            </span>}
                        >
                            <InputNumber
                                style={{ ...glassInputStyle, width: '100%' }}
                                min={0}
                                max={9999}
                                placeholder="0"
                            />
                        </Form.Item>

                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                        {/* 状态开关组 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Form.Item
                                    name="active"
                                    valuePropName="checked"
                                    style={{ marginBottom: 0 }}
                                >
                                    <Switch />
                                </Form.Item>
                                <span style={labelStyle}>激活状态</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Form.Item
                                    name="featured"
                                    valuePropName="checked"
                                    style={{ marginBottom: 0 }}
                                >
                                    <Switch />
                                </Form.Item>
                                <span style={labelStyle}>设为推荐</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Form.Item
                                    name="showInMenu"
                                    valuePropName="checked"
                                    style={{ marginBottom: 0 }}
                                >
                                    <Switch />
                                </Form.Item>
                                <span style={labelStyle}>菜单显示</span>
                            </div>
                        </div>

                        {/* 操作按钮 */}
                        <div style={{ textAlign: 'right', marginTop: '24px' }}>
                            <Space>
                                <Button
                                    onClick={handleCancel}
                                    disabled={submitLoading}
                                >
                                    取消
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submitLoading}
                                >
                                    {editingCategory ? '更新' : '创建'}
                                </Button>
                            </Space>
                        </div>
                    </Form>
                </div>
            </Modal>

            {/* 删除确认模态框 */}
            <VerificationModal
                visible={deleteModalVisible}
                onCancel={handleDeleteCancel}
                onSubmit={handleDeleteConfirm}
                isSubmitting={deleteLoading}
                title={`删除分类「${deletingCategory?.name}」`}
                content={<p>删除操作不可撤销，确定要删除该分类吗？</p>}
                requireVerification={false}
                okText="确认删除"
                danger={true}
            />

            {/* 警告模态框 */}
            <Modal
                title={null}
                footer={null}
                open={warningModalVisible}
                onCancel={() => setWarningModalVisible(false)}
                destroyOnClose
                centered
                closable={false}
                maskStyle={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                styles={{
                    content: { background: 'transparent', boxShadow: 'none', padding: 0 }
                }}
            >
                <div style={{
                    ...modalGlassCardStyle,
                    padding: '24px',
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <Title level={4} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
                            无法删除分类
                        </Title>
                        <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            {warningContent}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="primary"
                            onClick={() => setWarningModalVisible(false)}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                border: 'none'
                            }}
                        >
                            我知道了
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProductCategoryManagement;
