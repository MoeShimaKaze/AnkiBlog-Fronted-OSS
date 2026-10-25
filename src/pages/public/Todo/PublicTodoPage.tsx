/**
 * 公开待办清单页面
 * 供用户浏览管理员的待办事项并关注
 * 管理员可在此页面直接创建和编辑待办
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Row, Col, Typography, Spin, Card, Pagination, Empty, Button, message,
    Tag, Progress, Checkbox, Modal, Form, Input, DatePicker, Select, Space,
    Tooltip, Popconfirm
} from 'antd';
import {
    CheckSquareOutlined,
    StarFilled,
    StarOutlined,
    CalendarOutlined,
    HeartOutlined,
    HeartFilled,
    SunOutlined,
    UnorderedListOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SettingOutlined
} from '@ant-design/icons';
import Navbar from '@/components/Common/Navbar';
import Footer from '@/components/Common/Footer';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import { useAuth } from '@/hooks/auth/useAuth';
import * as todoService from '@/services/todoService';
import type { TodoItem, TodoList } from '@/types/todo';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { primaryTextStyle, shadowedGlassCardStyle, shadowedSecondaryTextStyle } from '@/constants/styles';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const PublicTodoPage: React.FC = () => {
    usePageTitle('待办清单');

    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [items, setItems] = useState<TodoItem[]>([]);
    const [lists, setLists] = useState<TodoList[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);
    const [total, setTotal] = useState(0);
    const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
    const [followLoading, setFollowLoading] = useState<string | null>(null);

    // 管理员编辑相关状态
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();

    // 加载公开待办项
    const loadTodos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await todoService.getPublicTodoItems({
                page: currentPage - 1,
                size: pageSize
            });
            if (response.success) {
                setItems(response.data.content || []);
                setTotal(response.data.totalElements || 0);
            }
        } catch (error) {
            console.error('加载待办失败:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    // 加载管理员的待办列表（用于创建待办时选择列表）
    const loadLists = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const response = await todoService.getTodoLists();
            if (response.success) {
                // 只显示公开的列表
                setLists(response.data?.filter(list => list.isPublic) || []);
            }
        } catch (error) {
            console.error('加载列表失败:', error);
        }
    }, [isAdmin]);

    // 加载用户已关注的待办
    const loadFollowedItems = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await todoService.getFollowedItems({ size: 100 });
            if (response.success && response.data.content) {
                setFollowedIds(new Set(response.data.content.map(item => item.id)));
            }
        } catch (error) {
            console.error('加载关注列表失败:', error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadTodos();
    }, [loadTodos]);

    useEffect(() => {
        loadFollowedItems();
    }, [loadFollowedItems]);

    useEffect(() => {
        loadLists();
    }, [loadLists]);

    // 关注/取消关注
    const handleToggleFollow = async (item: TodoItem) => {
        if (!isAuthenticated) {
            message.warning('请先登录后再关注');
            return;
        }

        setFollowLoading(item.id);
        try {
            const isFollowed = followedIds.has(item.id);
            if (isFollowed) {
                await todoService.unfollowTodoItem(item.id);
                setFollowedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(item.id);
                    return newSet;
                });
                message.success('已取消关注');
            } else {
                await todoService.followTodoItem(item.id);
                setFollowedIds(prev => new Set(prev).add(item.id));
                message.success('关注成功');
            }
        } catch (error) {
            message.error('操作失败');
        } finally {
            setFollowLoading(null);
        }
    };

    // 管理员：切换完成状态
    const handleToggleComplete = async (item: TodoItem) => {
        if (!isAdmin) return;
        try {
            const response = item.isCompleted
                ? await todoService.uncompleteTodoItem(item.id)
                : await todoService.completeTodoItem(item.id);
            if (response.success) {
                message.success(item.isCompleted ? '已取消完成' : '已标记完成');
                loadTodos();
            }
        } catch (error) {
            message.error('操作失败');
        }
    };

    // 管理员：切换重要状态
    const handleToggleImportant = async (item: TodoItem) => {
        if (!isAdmin) return;
        try {
            const response = await todoService.toggleTodoImportant(item.id);
            if (response.success) {
                message.success(item.isImportant ? '已取消重要标记' : '已标记为重要');
                loadTodos();
            }
        } catch (error) {
            message.error('操作失败');
        }
    };

    // 管理员：打开创建/编辑模态框
    const handleOpenModal = (item?: TodoItem) => {
        if (item) {
            setEditingItem(item);
            form.setFieldsValue({
                title: item.title,
                note: item.note,
                priority: item.priority,
                dueDate: item.dueDate ? dayjs(item.dueDate) : null,
                listId: item.listId,
                isImportant: item.isImportant,
                isMyDay: item.isMyDay,
            });
        } else {
            setEditingItem(null);
            form.resetFields();
        }
        setModalVisible(true);
    };

    // 管理员：提交创建/编辑
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);

            const data = {
                title: values.title,
                note: values.note,
                priority: values.priority,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
                listId: values.listId,
                isImportant: values.isImportant,
                isMyDay: values.isMyDay,
            };

            if (editingItem) {
                const response = await todoService.updateTodoItem(editingItem.id, data);
                if (response.success) {
                    message.success('更新成功');
                }
            } else {
                const response = await todoService.createTodoItem(data);
                if (response.success) {
                    message.success('创建成功');
                }
            }

            setModalVisible(false);
            loadTodos();
        } catch (error) {
            console.error('提交失败:', error);
            message.error('操作失败');
        } finally {
            setSubmitLoading(false);
        }
    };

    // 管理员：删除待办
    const handleDelete = async (id: string) => {
        try {
            const response = await todoService.deleteTodoItem(id);
            if (response.success) {
                message.success('删除成功');
                loadTodos();
            }
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 格式化日期
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = dayjs(dateStr);
        const today = dayjs().startOf('day');
        const tomorrow = today.add(1, 'day');

        if (date.isSame(today, 'day')) return '今天';
        if (date.isSame(tomorrow, 'day')) return '明天';
        if (date.isBefore(today)) return date.format('M月D日') + ' (已过期)';
        return date.format('M月D日');
    };

    // 获取优先级颜色
    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            URGENT: '#ff4d4f',
            HIGH: '#f5222d',
            MEDIUM: '#fa8c16',
            LOW: '#52c41a',
        };
        return colors[priority] || '#8c8c8c';
    };

    const secondaryTextStyle = shadowedSecondaryTextStyle;

    const glassCardStyle: React.CSSProperties = {
        ...shadowedGlassCardStyle,
        height: '100%',
        transition: 'all 0.3s ease',
    };

    // 统计信息
    const completedCount = items.filter(item => item.isCompleted).length;
    const activeCount = items.filter(item => !item.isCompleted).length;

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundImage: `url('/background_placeholder.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* 背景遮罩层 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)',
                    zIndex: 0
                }}
            />

            <Navbar />

            {/* 主要内容区域 */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 24px 48px' }}>
                    {/* 页面标题 */}
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <Title
                            level={1}
                            style={{
                                ...primaryTextStyle,
                                fontSize: '42px',
                                fontWeight: 700,
                                marginBottom: '16px'
                            }}
                        >
                            <CheckSquareOutlined style={{ marginRight: '12px' }} />
                            待办清单
                        </Title>
                        <Paragraph style={{ ...secondaryTextStyle, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                            查看管理员的待办事项，关注感兴趣的任务，一起完成目标
                        </Paragraph>

                        {/* 管理员操作按钮 */}
                        {isAdmin && (
                            <Space style={{ marginTop: '24px' }}>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleOpenModal()}
                                    style={{
                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        border: 'none',
                                        height: '40px',
                                        paddingInline: '24px',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                                    }}
                                >
                                    创建待办
                                </Button>
                                <Link to="/admin/todos">
                                    <Button
                                        icon={<SettingOutlined />}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            color: 'white',
                                            height: '40px',
                                            paddingInline: '24px',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        管理后台
                                    </Button>
                                </Link>
                            </Space>
                        )}
                    </div>

                    {/* 统计卡片 */}
                    <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                        <Col xs={12} sm={6}>
                            <Card
                                style={{
                                    ...glassCardStyle,
                                    textAlign: 'center',
                                    padding: '16px'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <UnorderedListOutlined style={{ fontSize: '28px', color: '#60a5fa', marginBottom: '8px' }} />
                                <div style={{ ...primaryTextStyle, fontSize: '28px', fontWeight: 'bold' }}>{total}</div>
                                <div style={secondaryTextStyle}>全部任务</div>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card
                                style={{
                                    ...glassCardStyle,
                                    textAlign: 'center',
                                    padding: '16px'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <SunOutlined style={{ fontSize: '28px', color: '#fbbf24', marginBottom: '8px' }} />
                                <div style={{ ...primaryTextStyle, fontSize: '28px', fontWeight: 'bold' }}>{activeCount}</div>
                                <div style={secondaryTextStyle}>进行中</div>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card
                                style={{
                                    ...glassCardStyle,
                                    textAlign: 'center',
                                    padding: '16px'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <CheckSquareOutlined style={{ fontSize: '28px', color: '#4ade80', marginBottom: '8px' }} />
                                <div style={{ ...primaryTextStyle, fontSize: '28px', fontWeight: 'bold' }}>{completedCount}</div>
                                <div style={secondaryTextStyle}>已完成</div>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card
                                style={{
                                    ...glassCardStyle,
                                    textAlign: 'center',
                                    padding: '16px'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <HeartOutlined style={{ fontSize: '28px', color: '#f472b6', marginBottom: '8px' }} />
                                <div style={{ ...primaryTextStyle, fontSize: '28px', fontWeight: 'bold' }}>{followedIds.size}</div>
                                <div style={secondaryTextStyle}>已关注</div>
                            </Card>
                        </Col>
                    </Row>

                    {/* 待办项列表 */}
                    <Spin spinning={loading}>
                        {items.length === 0 && !loading ? (
                            <Card style={glassCardStyle} bodyStyle={{ padding: '80px 24px' }}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span style={secondaryTextStyle}>暂无公开的待办事项</span>
                                    }
                                >
                                    {isAdmin && (
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleOpenModal()}
                                            style={{
                                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                                border: 'none',
                                            }}
                                        >
                                            创建待办
                                        </Button>
                                    )}
                                </Empty>
                            </Card>
                        ) : (
                            <>
                                <Row gutter={[24, 24]}>
                                    {items.map(item => (
                                        <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                                            <Card
                                                hoverable
                                                style={{
                                                    ...glassCardStyle,
                                                    cursor: 'default',
                                                    opacity: item.isCompleted ? 0.7 : 1
                                                }}
                                                bodyStyle={{ padding: '20px' }}
                                            >
                                                {/* 卡片头部 */}
                                                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                    <Checkbox
                                                        checked={item.isCompleted}
                                                        disabled={!isAdmin}
                                                        onChange={() => handleToggleComplete(item)}
                                                        style={{ marginRight: '12px', marginTop: '4px' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <Text
                                                            style={{
                                                                ...primaryTextStyle,
                                                                fontSize: '16px',
                                                                fontWeight: 500,
                                                                textDecoration: item.isCompleted ? 'line-through' : 'none',
                                                                display: 'block',
                                                                marginBottom: '8px'
                                                            }}
                                                        >
                                                            {item.title}
                                                        </Text>
                                                    </div>
                                                    {isAdmin ? (
                                                        <Tooltip title={item.isImportant ? '取消重要' : '标记重要'}>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                onClick={() => handleToggleImportant(item)}
                                                                icon={item.isImportant ?
                                                                    <StarFilled style={{ color: '#f472b6', fontSize: '18px' }} /> :
                                                                    <StarOutlined style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px' }} />
                                                                }
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        item.isImportant && (
                                                            <StarFilled style={{ color: '#f472b6', fontSize: '18px' }} />
                                                        )
                                                    )}
                                                </div>

                                                {/* 标签 */}
                                                <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {item.isMyDay && (
                                                        <Tag color="gold" icon={<SunOutlined />}>我的一天</Tag>
                                                    )}
                                                    {item.dueDate && (
                                                        <Tag
                                                            color={item.isOverdue ? 'error' : 'processing'}
                                                            icon={<CalendarOutlined />}
                                                        >
                                                            {formatDate(item.dueDate)}
                                                        </Tag>
                                                    )}
                                                    {item.priority && (
                                                        <Tag color={getPriorityColor(item.priority)}>
                                                            {item.priority === 'URGENT' ? '紧急' : item.priority === 'HIGH' ? '高优先级' : item.priority === 'MEDIUM' ? '中优先级' : '低优先级'}
                                                        </Tag>
                                                    )}
                                                </div>

                                                {/* 步骤进度 */}
                                                {item.totalStepsCount > 0 && (
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <div style={{ ...secondaryTextStyle, fontSize: '12px', marginBottom: '4px' }}>
                                                            步骤进度: {item.completedStepsCount}/{item.totalStepsCount}
                                                        </div>
                                                        <Progress
                                                            percent={Math.round((item.completedStepsCount / item.totalStepsCount) * 100)}
                                                            size="small"
                                                            strokeColor="#4ade80"
                                                            trailColor="rgba(255,255,255,0.1)"
                                                            showInfo={false}
                                                        />
                                                    </div>
                                                )}

                                                {/* 备注预览 */}
                                                {item.note && (
                                                    <Paragraph
                                                        ellipsis={{ rows: 2 }}
                                                        style={{
                                                            ...secondaryTextStyle,
                                                            fontSize: '13px',
                                                            marginBottom: '12px'
                                                        }}
                                                    >
                                                        {item.note}
                                                    </Paragraph>
                                                )}

                                                {/* 操作按钮 */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: isAdmin ? 'space-between' : 'flex-end',
                                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                                    paddingTop: '12px'
                                                }}>
                                                    {/* 管理员操作 */}
                                                    {isAdmin && (
                                                        <Space size={4}>
                                                            <Tooltip title="编辑">
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<EditOutlined />}
                                                                    onClick={() => handleOpenModal(item)}
                                                                    style={{ color: 'rgba(255,255,255,0.7)' }}
                                                                />
                                                            </Tooltip>
                                                            <Popconfirm
                                                                title="确定删除此待办？"
                                                                onConfirm={() => handleDelete(item.id)}
                                                                okText="删除"
                                                                cancelText="取消"
                                                            >
                                                                <Tooltip title="删除">
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<DeleteOutlined />}
                                                                        style={{ color: 'rgba(255,255,255,0.7)' }}
                                                                    />
                                                                </Tooltip>
                                                            </Popconfirm>
                                                        </Space>
                                                    )}

                                                    {/* 关注按钮 - 非管理员可用 */}
                                                    {!isAdmin && (
                                                        <Button
                                                            type={followedIds.has(item.id) ? 'primary' : 'default'}
                                                            ghost={followedIds.has(item.id)}
                                                            icon={followedIds.has(item.id) ? <HeartFilled /> : <HeartOutlined />}
                                                            loading={followLoading === item.id}
                                                            onClick={() => handleToggleFollow(item)}
                                                            style={{
                                                                borderColor: followedIds.has(item.id) ? '#f472b6' : 'rgba(255,255,255,0.3)',
                                                                color: followedIds.has(item.id) ? '#f472b6' : 'rgba(255,255,255,0.8)',
                                                                background: followedIds.has(item.id) ? 'rgba(244, 114, 182, 0.1)' : 'rgba(255,255,255,0.1)'
                                                            }}
                                                        >
                                                            {followedIds.has(item.id) ? '已关注' : '关注'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                {/* 分页 */}
                                {total > pageSize && (
                                    <div style={{ textAlign: 'center', marginTop: '48px' }}>
                                        <Pagination
                                            current={currentPage}
                                            total={total}
                                            pageSize={pageSize}
                                            onChange={setCurrentPage}
                                            showSizeChanger={false}
                                            showTotal={(total) => (
                                                <span style={secondaryTextStyle}>共 {total} 个待办</span>
                                            )}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </Spin>
                </div>
            </div>

            <Footer />

            {/* 管理员创建/编辑模态框 */}
            <Modal
                title={editingItem ? '编辑待办' : '创建待办'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                confirmLoading={submitLoading}
                okText={editingItem ? '保存' : '创建'}
                cancelText="取消"
                width={520}
                className="todo-admin-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: '16px' }}
                >
                    <Form.Item
                        name="title"
                        label="待办标题"
                        rules={[{ required: true, message: '请输入待办标题' }]}
                    >
                        <Input placeholder="输入待办标题" maxLength={200} />
                    </Form.Item>

                    <Form.Item
                        name="note"
                        label="备注"
                    >
                        <TextArea rows={3} placeholder="添加备注信息" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="priority"
                                label="优先级"
                            >
                                <Select placeholder="选择优先级">
                                    <Select.Option value="LOW">低</Select.Option>
                                    <Select.Option value="MEDIUM">中</Select.Option>
                                    <Select.Option value="HIGH">高</Select.Option>
                                    <Select.Option value="URGENT">紧急</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dueDate"
                                label="截止日期"
                            >
                                <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="listId"
                        label="所属列表"
                        extra="只显示公开的列表，待办将自动公开"
                    >
                        <Select placeholder="选择列表" allowClear>
                            {lists.map(list => (
                                <Select.Option key={list.id} value={list.id}>
                                    {list.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="isImportant"
                                valuePropName="checked"
                            >
                                <Checkbox>标记为重要</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="isMyDay"
                                valuePropName="checked"
                            >
                                <Checkbox>添加到"我的一天"</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* 自定义样式 */}
            <style>{`
                .ant-pagination-item {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.3) !important;
                }
                .ant-pagination-item a {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .ant-pagination-item-active {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                    border: none !important;
                }
                .ant-pagination-item-active a {
                    color: white !important;
                }
                .ant-pagination-prev,
                .ant-pagination-next {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.3) !important;
                }
                .ant-pagination-prev .ant-pagination-item-link,
                .ant-pagination-next .ant-pagination-item-link {
                    color: rgba(255, 255, 255, 0.9) !important;
                    background: transparent !important;
                    border: none !important;
                }
                .ant-checkbox-inner {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .ant-checkbox-checked .ant-checkbox-inner {
                    background: #3b82f6 !important;
                    border-color: #3b82f6 !important;
                }
                .ant-checkbox-disabled .ant-checkbox-inner {
                    background: rgba(255, 255, 255, 0.05) !important;
                }
                .ant-checkbox-disabled.ant-checkbox-checked .ant-checkbox-inner {
                    background: rgba(59, 130, 246, 0.5) !important;
                }

                /* 模态框样式 */
                .todo-admin-modal .ant-modal-content {
                    background: rgba(30, 30, 30, 0.95) !important;
                    backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .todo-admin-modal .ant-modal-header {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                .todo-admin-modal .ant-modal-title {
                    color: white !important;
                }
                .todo-admin-modal .ant-modal-close {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                .todo-admin-modal .ant-form-item-label > label {
                    color: rgba(255, 255, 255, 0.85) !important;
                }
                .todo-admin-modal .ant-input,
                .todo-admin-modal .ant-input-affix-wrapper,
                .todo-admin-modal .ant-picker,
                .todo-admin-modal .ant-select-selector {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                }
                .todo-admin-modal .ant-input::placeholder,
                .todo-admin-modal .ant-select-selection-placeholder {
                    color: rgba(255, 255, 255, 0.4) !important;
                }
                .todo-admin-modal .ant-picker-suffix,
                .todo-admin-modal .ant-select-arrow {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .todo-admin-modal .ant-checkbox-wrapper {
                    color: rgba(255, 255, 255, 0.85) !important;
                }
                .todo-admin-modal .ant-form-item-extra {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .todo-admin-modal .ant-modal-footer {
                    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default PublicTodoPage;
