import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Button,
    Space,
    Table,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Empty,
    ConfigProvider,
    ColorPicker
} from 'antd';
import {
    ArrowLeftOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { GoalCategory, GoalCategoryRequest } from '@/types/checkIn';
import {
    getGoalCategories,
    createGoalCategory,
    updateGoalCategory,
    deleteGoalCategory
} from '@/services/checkInService';

// 玻璃态主题配置
const glassTheme = {
    token: {
        colorText: 'rgba(255, 255, 255, 0.9)',
        colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
        colorBgElevated: 'rgba(35, 35, 45, 0.95)',
        borderRadius: 8,
    },
    components: {
        Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            activeBorderColor: '#1890ff',
        },
        Form: {
            labelColor: 'rgba(255, 255, 255, 0.85)',
        },
        Modal: {
            contentBg: 'rgba(35, 35, 45, 0.95)',
            headerBg: 'rgba(35, 35, 45, 0.95)',
            titleColor: 'rgba(255, 255, 255, 0.9)',
        },
        Table: {
            colorBgContainer: 'transparent',
            headerBg: 'rgba(255, 255, 255, 0.05)',
            rowHoverBg: 'rgba(255, 255, 255, 0.08)',
        },
    },
};

const CategoryManagePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<GoalCategory[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<GoalCategory | null>(null);
    const [form] = Form.useForm();
    const [selectedIcon, setSelectedIcon] = useState<string>('📁');
    const [selectedColor, setSelectedColor] = useState<string>('#1890ff');

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getGoalCategories();
            if (res.success) {
                setCategories(res.data || []);
            }
        } catch (error) {
            message.error('加载分类失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setSelectedIcon('📁');
        setSelectedColor('#1890ff');
        setModalOpen(true);
    };

    const handleEdit = (category: GoalCategory) => {
        setEditingCategory(category);
        form.setFieldsValue({
            name: category.name,
        });
        setSelectedIcon(category.icon || '📁');
        setSelectedColor(category.color || '#1890ff');
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await deleteGoalCategory(id);
            if (res.success) {
                message.success('删除成功');
                fetchCategories();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '删除失败');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data: GoalCategoryRequest = {
                name: values.name,
                icon: selectedIcon,
                color: selectedColor
            };

            let res;
            if (editingCategory) {
                res = await updateGoalCategory(editingCategory.id, data);
            } else {
                res = await createGoalCategory(data);
            }

            if (res.success) {
                message.success(editingCategory ? '更新成功' : '创建成功');
                setModalOpen(false);
                fetchCategories();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '操作失败');
        }
    };

    const iconOptions = ['📁', '🏃', '📚', '💼', '❤️', '🎯', '💪', '🎨', '🎵', '💰', '🏠', '✈️', '🎮', '📱', '💡'];

    const columns = [
        {
            title: '图标',
            dataIndex: 'icon',
            key: 'icon',
            width: 80,
            render: (icon: string) => <span style={{ fontSize: 24 }}>{icon || '📁'}</span>
        },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{name}</span>
        },
        {
            title: '颜色',
            dataIndex: 'color',
            key: 'color',
            width: 80,
            render: (color: string) => color ? (
                <span
                    style={{
                        display: 'inline-block',
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: color
                    }}
                />
            ) : '-'
        },
        {
            title: '目标数',
            dataIndex: 'goalCount',
            key: 'goalCount',
            width: 100,
            render: (count: number) => <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{count}</span>
        },
        {
            title: '操作',
            key: 'actions',
            width: 150,
            render: (_: any, record: GoalCategory) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <Popconfirm
                        title="确定删除此分类？"
                        description={record.goalCount > 0 ? '该分类下还有目标，请先移除' : undefined}
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                        disabled={record.goalCount > 0}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={record.goalCount > 0}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <ConfigProvider theme={glassTheme}>
            <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
                <div className="flex justify-between items-center mb-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/check-in')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
                        }}
                    >
                        返回
                    </Button>
                    <h1 className="text-white text-xl font-bold m-0">分类管理</h1>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        新建分类
                    </Button>
                </div>

                <Card
                    className="glass-effect border-0"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                    <Table
                        loading={loading}
                        dataSource={categories}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        locale={{
                            emptyText: (
                                <Empty
                                    description={<span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>暂无分类</span>}
                                />
                            )
                        }}
                    />
                </Card>

                <Modal
                    title={editingCategory ? '编辑分类' : '新建分类'}
                    open={modalOpen}
                    onCancel={() => setModalOpen(false)}
                    onOk={handleSubmit}
                    destroyOnClose
                    styles={{
                        content: {
                            background: 'rgba(35, 35, 45, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        },
                        header: {
                            background: 'transparent',
                        },
                    }}
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                        <Form.Item
                            name="name"
                            label="分类名称"
                            rules={[{ required: true, message: '请输入分类名称' }]}
                        >
                            <Input placeholder="如：健康、学习、工作" maxLength={50} />
                        </Form.Item>

                        <Form.Item label="图标">
                            <div className="flex gap-2 flex-wrap">
                                {iconOptions.map((icon) => (
                                    <button
                                        type="button"
                                        key={icon}
                                        className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg cursor-pointer transition-all border-2 ${
                                            selectedIcon === icon
                                                ? 'border-blue-500 bg-blue-500/20'
                                                : 'border-transparent bg-white/10 hover:bg-white/20'
                                        }`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedIcon(icon);
                                        }}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </Form.Item>

                        <Form.Item label="颜色">
                            <ColorPicker
                                value={selectedColor}
                                onChange={(color) => setSelectedColor(color.toHexString())}
                                showText
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default CategoryManagePage;
