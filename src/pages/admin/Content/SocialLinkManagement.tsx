import React, { useState, useEffect } from 'react';
import {
    Table, Button, Space, Tag, Modal, message, Card, Form, Input, Select, InputNumber, Switch,
    Typography, Spin, Tooltip, ColorPicker
} from 'antd';
import type { Color } from 'antd/es/color-picker';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import * as socialLinkService from '@/services/socialLinks';
import { SocialLink, SocialLinkCreateRequest, SocialLinkUpdateRequest, platformTypes } from '@/services/socialLinks';
import VerificationModal from '@/components/Common/VerificationModal';
import { modalGlassCardStyle } from '@/constants/styles';

const { Title } = Typography;
const { Option } = Select;

const IconRenderer: React.FC<{ icon: string; color: string; size?: number }> = ({ icon, color, size = 16 }) => {
    if (icon.startsWith('/') || icon.startsWith('http')) {
        if (icon.endsWith('.svg')) {
            return (
                <div style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    maskImage: `url(${icon})`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskImage: `url(${icon})`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                }} />
            );
        }
        return <img src={icon} alt="icon" style={{ width: `${size}px`, height: `${size}px`, verticalAlign: 'middle', borderRadius: '3px' }} />;
    }
    return <i className={icon} style={{ color, fontSize: `${size}px`, verticalAlign: 'middle', width: size, textAlign: 'center' }} />;
};

const SocialLinkModal: React.FC<{
    visible: boolean;
    onCancel: () => void;
    onFinish: (values: any) => Promise<boolean>;
    link: SocialLink | null;
}> = ({ visible, onCancel, onFinish, link }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            if (link) {
                // [修复 TS2339] 创建一个结构与表单字段完全匹配的新对象来填充表单
                const formPayload = {
                    platform: link.platform,
                    title: link.title,
                    url: link.url,
                    description: link.description,
                    groupName: link.groupName,
                    active: link.active,
                    sortOrder: link.sortOrder,
                    openInNewTab: link.openInNewTab,
                    featured: link.featured,
                    // 检查 link.icon 是否为自定义图标，并用它填充 customIcon 字段
                    customIcon: (link.icon && (link.icon.startsWith('/') || link.icon.startsWith('http'))) ? link.icon : '',
                    // 使用 link.color 填充 customColor 字段
                    customColor: link.color,
                };
                form.setFieldsValue(formPayload);
            } else {
                form.resetFields();
                form.setFieldsValue({ sortOrder: 0, active: true });
            }
        }
    }, [link, visible, form]);

    const handleOk = async () => {
        try {
            setIsSubmitting(true);
            const values = await form.validateFields();
            const finalValues = {
                ...values,
                customColor: values.customColor
                    ? (typeof values.customColor === 'string' ? values.customColor : (values.customColor as Color).toHexString())
                    : null,
            };
            const success = await onFinish(finalValues);
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

    const glassDropdownStyle: React.CSSProperties = {
        background: 'rgba(50, 50, 50, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
    };

    return (
        <Modal
            open={visible}
            title={null}
            footer={null}
            onCancel={onCancel}
            // [修复 TS6385] 移除已弃用的 destroyOnClose 属性
            centered
            closable={false}
            styles={{
                content: { background: 'transparent', boxShadow: 'none', padding: 0 },
                mask: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' },
                // [修复 TS6385] 将 bodyStyle 的配置移入 styles.body
                body: { padding: 0 },
            }}
        >
            <div style={{
                ...modalGlassCardStyle,
                padding: '24px',
            }}>
                <Title level={4} style={{ color: 'white', margin: 0, marginBottom: '24px', textShadow: '1px 1px 3px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                    {link ? '编辑社交链接' : '添加社交链接'}
                </Title>
                <Form form={form} layout="vertical">
                    <Form.Item name="platform" label={<span style={labelStyle}>平台</span>} rules={[{ required: true, message: '请选择平台' }]}>
                        <Select
                            placeholder="选择一个平台"
                            style={glassInputStyle}
                            dropdownStyle={glassDropdownStyle}
                        >
                            {Object.entries(platformTypes).map(([key, value]) => (
                                <Option key={key} value={key} style={{ background: 'transparent', color: 'rgba(255,255,255,0.85)' }}>
                                    <Space>
                                        <i className={value.iconClass} style={{ color: value.brandColor, width: 16, textAlign: 'center' }}></i>
                                        {value.displayName}
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="title" label={<span style={labelStyle}>显示标题</span>}>
                        <Input style={glassInputStyle} placeholder="留空将自动填充平台名称" />
                    </Form.Item>
                    <Form.Item name="url" label={<span style={labelStyle}>URL</span>} rules={[{ required: true, message: '请输入URL' }]}>
                        <Input style={glassInputStyle} placeholder="https://..." />
                    </Form.Item>
                    <Form.Item name="customIcon" label={<span style={labelStyle}>自定义图标URL</span>} help={<span style={{color: 'rgba(255,255,255,0.7)'}}>留空则使用默认图标。支持外部URL或本地public路径。</span>}>
                        <Input style={glassInputStyle} placeholder="https://example.com/icon.svg 或 /icons/my-icon.svg" />
                    </Form.Item>
                    <Form.Item name="customColor" label={<span style={labelStyle}>自定义颜色</span>} help={<span style={{color: 'rgba(255,255,255,0.7)'}}>留空则使用平台默认颜色。</span>}>
                        <ColorPicker showText style={glassInputStyle} />
                    </Form.Item>
                    <Form.Item name="description" label={<span style={labelStyle}>描述</span>}>
                        <Input.TextArea rows={2} style={glassInputStyle} placeholder="链接描述（可选）" />
                    </Form.Item>
                    <Form.Item name="groupName" label={<span style={labelStyle}>分组名称</span>}>
                        <Input style={glassInputStyle} placeholder="用于归类显示（可选）" />
                    </Form.Item>
                    <Form.Item name="sortOrder" label={<span style={labelStyle}>排序值</span>} help={<span style={{ color: 'rgba(255,255,255,0.7)' }}>值越小越靠前</span>}>
                        <InputNumber style={{ ...glassInputStyle, width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="active" label={<span style={labelStyle}>启用状态</span>} valuePropName="checked">
                        <Switch />
                    </Form.Item>
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

const SocialLinkManagement: React.FC = () => {
    usePageTitle('社交媒体管理', { siteName: 'AnkiBlog', siteTagline: 'Ankiの歇脚处' });

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

    // 删除确认模态框状态
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState<SocialLink | null>(null);

    const loadSocialLinks = async () => {
        try {
            setLoading(true);
            const response = await socialLinkService.getAllSocialLinks();
            if (response.success) {
                setSocialLinks(response.data);
            }
        } catch (error) {
            message.error('加载社交链接失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSocialLinks();
    }, []);

    const handleCreate = async (values: SocialLinkCreateRequest) => {
        try {
            const response = await socialLinkService.createSocialLink(values);
            if (response.success) {
                message.success('社交链接创建成功');
                await loadSocialLinks();
                return true;
            }
        } catch (error) {
            message.error('创建失败');
        }
        return false;
    };

    const handleUpdate = async (id: string, values: SocialLinkUpdateRequest) => {
        try {
            const response = await socialLinkService.updateSocialLink(id, values);
            if (response.success) {
                message.success('社交链接更新成功');
                await loadSocialLinks();
                return true;
            }
        } catch (error) {
            message.error('更新失败');
        }
        return false;
    };

    // 显示删除确认模态框
    const showDeleteConfirm = (link: SocialLink) => {
        setLinkToDelete(link);
        setDeleteModalVisible(true);
    };

    // 处理删除社交链接
    const handleDeleteLink = async () => {
        if (!linkToDelete) return;

        setDeleteLoading(true);
        try {
            await socialLinkService.deleteSocialLink(linkToDelete.id);
            message.success('社交链接已删除');
            await loadSocialLinks();

            // 关闭模态框
            setDeleteModalVisible(false);
            setLinkToDelete(null);
        } catch (error) {
            message.error('删除失败');
        } finally {
            setDeleteLoading(false);
        }
    };

    // 取消删除
    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
        setLinkToDelete(null);
    };

    const columns: ColumnsType<SocialLink> = [
        {
            title: '平台',
            key: 'platform',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconRenderer icon={record.icon} color={record.color} />
                    <span>{record.title}</span>
                </div>
            )
        },
        {
            title: 'URL',
            dataIndex: 'url',
            render: (url: string) => (
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
                    {url.length > 50 ? `${url.substring(0, 50)}...` : url}
                </a>
            )
        },
        {
            title: '分组',
            dataIndex: 'groupName',
            render: (groupName: string) => groupName ? <Tag>{groupName}</Tag> : '-'
        },
        {
            title: '状态',
            dataIndex: 'active',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>{active ? '启用' : '禁用'}</Tag>
            )
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
                    <Tooltip title="编辑">
                        <Button type="text" icon={<EditOutlined />}
                                onClick={() => { setEditingLink(record); setModalVisible(true); }} />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Button type="text" danger icon={<DeleteOutlined />}
                                onClick={() => showDeleteConfirm(record)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
                <Spin size="large" tip="正在加载社交链接数据..." />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>社交媒体管理</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large"
                        onClick={() => { setEditingLink(null); setModalVisible(true); }}>
                    添加社交链接
                </Button>
            </div>

            <Card className="glass-effect border-0 shadow-xl" bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={socialLinks}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    style={{ background: 'transparent' }}
                />
            </Card>

            <SocialLinkModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                link={editingLink}
                onFinish={async (values) => {
                    if (editingLink) {
                        return handleUpdate(editingLink.id, values);
                    }
                    return handleCreate(values as SocialLinkCreateRequest);
                }}
            />

            {/* 删除确认模态框 */}
            <VerificationModal
                visible={deleteModalVisible}
                onCancel={handleCancelDelete}
                onSubmit={handleDeleteLink}
                isSubmitting={deleteLoading}
                title="确认删除社交链接"
                requireVerification={false}
                okText="确认删除"
                cancelText="取消"
                danger={true}
                content={
                    linkToDelete && (
                        <div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>平台：</strong>{linkToDelete.title}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>URL：</strong>{linkToDelete.url}
                            </p>
                            {linkToDelete.groupName && (
                                <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 16px 0' }}>
                                    <strong>分组：</strong>{linkToDelete.groupName}
                                </p>
                            )}
                            <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>
                                ⚠️ 此操作不可撤销
                            </p>
                        </div>
                    )
                }
            />
        </div>
    );
};

export default SocialLinkManagement;
