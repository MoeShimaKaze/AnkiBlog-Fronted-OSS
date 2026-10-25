// 2. 友链管理页面 - FriendLinkManagement.tsx - 适配 VerificationModal 版本
import React, { useState, useEffect } from 'react';
import {
    Table, Button, Space, Tag, Modal, message, Card, Form, Input, Select, InputNumber, Switch,
    Typography, Spin, Tooltip
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import * as friendLinkService from '@/services/friendLinkService';
import type { FriendLink, FriendLinkCreateRequest, FriendLinkUpdateRequest } from '@/services/friendLinkService';
import VerificationModal from '@/components/Common/VerificationModal';
import { modalGlassCardStyle } from '@/constants/styles';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const statusColors = {
    PENDING: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
    DISABLED: 'default'
};

const statusNames = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    DISABLED: '已禁用'
};

// 操作类型枚举
enum ActionType {
    APPROVE = 'approve',
    REJECT = 'reject',
    DELETE = 'delete'
}

const FriendLinkModal: React.FC<{
    visible: boolean;
    onCancel: () => void;
    onFinish: (values: any) => Promise<boolean>;
    link: FriendLink | null;
}> = ({ visible, onCancel, onFinish, link }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            if (link) {
                form.setFieldsValue(link);
            } else {
                form.resetFields();
                form.setFieldsValue({ sortOrder: 0, category: '个人博客', reciprocal: false });
            }
        }
    }, [link, visible, form]);

    const handleOk = async () => {
        try {
            setIsSubmitting(true);
            const values = await form.validateFields();
            const success = await onFinish(values);
            if (success) {
                onCancel();
            }
        } catch (info) {
            console.log('Validate Failed:', info);
        } finally {
            setIsSubmitting(false);
        }
    };

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
        <Modal
            open={visible}
            title={null}
            footer={null}
            onCancel={onCancel}
            destroyOnClose
            centered
            closable={false}
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
                <Title level={4} style={{ color: 'white', margin: 0, marginBottom: '24px', textShadow: '1px 1px 3px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                    {link ? '编辑友链' : '添加友链'}
                </Title>
                <Form form={form} layout="vertical">
                    <Form.Item name="siteName" label={<span style={labelStyle}>站点名称</span>} rules={[{ required: true }]}>
                        <Input style={glassInputStyle} />
                    </Form.Item>
                    <Form.Item name="siteUrl" label={<span style={labelStyle}>站点URL</span>} rules={[{ required: true }, { type: 'url' }]}>
                        <Input style={glassInputStyle} />
                    </Form.Item>
                    <Form.Item name="description" label={<span style={labelStyle}>站点描述</span>}>
                        <TextArea rows={2} style={glassInputStyle} />
                    </Form.Item>
                    <Form.Item name="avatarUrl" label={<span style={labelStyle}>头像URL</span>}>
                        <Input style={glassInputStyle} />
                    </Form.Item>
                    <Form.Item name="ownerName" label={<span style={labelStyle}>站长名称</span>}>
                        <Input style={glassInputStyle} />
                    </Form.Item>
                    <Form.Item name="ownerEmail" label={<span style={labelStyle}>站长邮箱</span>} rules={[{ type: 'email' }]}>
                        <Input style={glassInputStyle} />
                    </Form.Item>
                    <Form.Item name="category" label={<span style={labelStyle}>分类</span>}>
                        <Select style={glassInputStyle}
                                dropdownStyle={{
                                    background: 'rgba(50, 50, 50, 0.85)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                }}
                        >
                            <Option value="个人博客">个人博客</Option>
                            <Option value="技术博客">技术博客</Option>
                            <Option value="生活博客">生活博客</Option>
                            <Option value="摄影博客">摄影博客</Option>
                            <Option value="其他">其他</Option>
                        </Select>
                    </Form.Item>
                    {link && (
                        <Form.Item name="status" label={<span style={labelStyle}>状态</span>}>
                            <Select style={glassInputStyle}
                                    dropdownStyle={{
                                        background: 'rgba(50, 50, 50, 0.85)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                    }}>
                                <Option value="PENDING">待审核</Option>
                                <Option value="APPROVED">已通过</Option>
                                <Option value="REJECTED">已拒绝</Option>
                                <Option value="DISABLED">已禁用</Option>
                            </Select>
                        </Form.Item>
                    )}
                    <Form.Item name="sortOrder" label={<span style={labelStyle}>排序值</span>}>
                        <InputNumber style={{ ...glassInputStyle, width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="reciprocal" label={<span style={labelStyle}>互换友链</span>} valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    {link && (
                        <Form.Item name="adminNote" label={<span style={labelStyle}>管理员备注</span>}>
                            <TextArea rows={2} style={glassInputStyle} />
                        </Form.Item>
                    )}
                </Form>
                <div style={{ textAlign: 'right', marginTop: '24px' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>取消</Button>
                    <Button type="primary" onClick={handleOk} loading={isSubmitting}>
                        {link ? '保存更改' : '确认创建'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const FriendLinkManagement: React.FC = () => {
    usePageTitle('友链管理', { siteName: 'AnkiBlog', siteTagline: 'Ankiの歇脚处' });

    const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingLink, setEditingLink] = useState<FriendLink | null>(null);

    // 确认操作模态框状态
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<{
        type: ActionType;
        link: FriendLink;
    } | null>(null);

    const loadFriendLinks = async () => {
        try {
            setLoading(true);
            const response = await friendLinkService.getAllFriendLinks();
            if (response.success) {
                setFriendLinks(response.data);
            }
        } catch (error) {
            message.error('加载友链失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFriendLinks();
    }, []);

    const handleCreate = async (values: FriendLinkCreateRequest) => {
        try {
            const response = await friendLinkService.createFriendLink(values);
            if (response.success) {
                message.success('友链创建成功');
                await loadFriendLinks();
                return true;
            }
        } catch (error) {
            message.error('创建失败');
        }
        return false;
    };

    const handleUpdate = async (id: string, values: FriendLinkUpdateRequest) => {
        try {
            const response = await friendLinkService.updateFriendLink(id, values);
            if (response.success) {
                message.success('友链更新成功');
                await loadFriendLinks();
                return true;
            }
        } catch (error) {
            message.error('更新失败');
        }
        return false;
    };

    // 显示确认操作模态框
    const showConfirmModal = (type: ActionType, link: FriendLink) => {
        setCurrentAction({ type, link });
        setConfirmModalVisible(true);
    };

    // 执行确认操作
    const handleConfirmAction = async () => {
        if (!currentAction) return;

        const { type, link } = currentAction;
        setConfirmLoading(true);

        try {
            switch (type) {
                case ActionType.APPROVE:
                    await friendLinkService.approveFriendLink(link.id);
                    message.success('友链已通过');
                    break;
                case ActionType.REJECT:
                    await friendLinkService.rejectFriendLink(link.id);
                    message.success('友链已拒绝');
                    break;
                case ActionType.DELETE:
                    await friendLinkService.deleteFriendLink(link.id);
                    message.success('友链已删除');
                    break;
            }
            await loadFriendLinks();
            setConfirmModalVisible(false);
            setCurrentAction(null);
        } catch (error) {
            message.error('操作失败');
        } finally {
            setConfirmLoading(false);
        }
    };

    // 取消确认操作
    const handleCancelConfirm = () => {
        setConfirmModalVisible(false);
        setCurrentAction(null);
    };

    // 获取确认模态框内容
    const getConfirmModalContent = () => {
        if (!currentAction) return null;

        const { type, link } = currentAction;
        const actionTexts = {
            [ActionType.APPROVE]: { title: '通过友链', action: '通过', color: '#52c41a' },
            [ActionType.REJECT]: { title: '拒绝友链', action: '拒绝', color: '#ff4d4f' },
            [ActionType.DELETE]: { title: '删除友链', action: '删除', color: '#ff4d4f' }
        };

        const config = actionTexts[type];

        return {
            title: config.title,
            content: (
                <div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                        <strong>站点名称：</strong>{link.siteName}
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                        <strong>站点URL：</strong>{link.siteUrl}
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 16px 0' }}>
                        <strong>站长名称：</strong>{link.ownerName || '未提供'}
                    </p>
                    {type === ActionType.DELETE && (
                        <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>
                            ⚠️ 此操作不可撤销
                        </p>
                    )}
                </div>
            ),
            okText: `确认${config.action}`,
            danger: type === ActionType.DELETE || type === ActionType.REJECT
        };
    };

    const columns: ColumnsType<FriendLink> = [
        {
            title: '站点信息',
            key: 'siteInfo',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {record.avatarUrl && (
                        <img src={record.avatarUrl} alt={record.siteName}
                             style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.siteName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{record.ownerName}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'URL',
            dataIndex: 'siteUrl',
            render: (url: string) => (
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
                    {url}
                </a>
            )
        },
        {
            title: '分类',
            dataIndex: 'category',
            render: (category: string) => <Tag>{category}</Tag>
        },
        {
            title: '状态',
            dataIndex: 'status',
            render: (status: keyof typeof statusColors) => (
                <Tag color={statusColors[status]}>{statusNames[status]}</Tag>
            )
        },
        {
            title: '点击数',
            dataIndex: 'clickCount',
            align: 'center'
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            align: 'center'
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    {record.status === 'PENDING' && (
                        <>
                            <Tooltip title="通过">
                                <Button type="text" icon={<CheckOutlined />} style={{ color: 'green' }}
                                        onClick={() => showConfirmModal(ActionType.APPROVE, record)} />
                            </Tooltip>
                            <Tooltip title="拒绝">
                                <Button type="text" icon={<CloseOutlined />} style={{ color: 'red' }}
                                        onClick={() => showConfirmModal(ActionType.REJECT, record)} />
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="编辑">
                        <Button type="text" icon={<EditOutlined />}
                                onClick={() => { setEditingLink(record); setModalVisible(true); }} />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Button type="text" danger icon={<DeleteOutlined />}
                                onClick={() => showConfirmModal(ActionType.DELETE, record)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
                <Spin size="large" tip="正在加载友链数据..." />
            </div>
        );
    }

    const confirmModalConfig = getConfirmModalContent();

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>友链管理</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large"
                        onClick={() => { setEditingLink(null); setModalVisible(true); }}>
                    添加友链
                </Button>
            </div>

            <Card className="glass-effect border-0 shadow-xl" bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={friendLinks}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    style={{ background: 'transparent' }}
                />
            </Card>

            <FriendLinkModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                link={editingLink}
                onFinish={async (values) => {
                    if (editingLink) {
                        return handleUpdate(editingLink.id, values);
                    }
                    return handleCreate(values);
                }}
            />

            {/* 确认操作模态框 */}
            {confirmModalConfig && (
                <VerificationModal
                    visible={confirmModalVisible}
                    onCancel={handleCancelConfirm}
                    onSubmit={handleConfirmAction}
                    isSubmitting={confirmLoading}
                    title={confirmModalConfig.title}
                    requireVerification={false}
                    okText={confirmModalConfig.okText}
                    cancelText="取消"
                    danger={confirmModalConfig.danger}
                    content={confirmModalConfig.content}
                />
            )}
        </div>
    );
};

export default FriendLinkManagement;
