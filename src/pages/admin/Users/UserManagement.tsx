import React, { useState, useEffect } from 'react';
import {
    Table, Button, Input, Space, Tag, Modal, message, Tooltip, Card, Avatar, Pagination, Select, Form, ConfigProvider
} from 'antd';
import {
    UserOutlined, CheckOutlined, DeleteOutlined, MailOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as userService from '@/services/userService';
import type { AdminUser } from '@/services/userService';
import { usePageTitle } from '@/hooks/business/usePageTitle';

const { Option } = Select;

const UserManagement: React.FC = () => {
    usePageTitle('用户管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [approvalModalVisible, setApprovalModalVisible] = useState(false);
    const [approvalUserId, setApprovalUserId] = useState<string | null>(null);
    const [approvalForm] = Form.useForm();
    const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 并行加载用户列表和获取当前管理员信息
                const [usersResult, adminInfo] = await Promise.all([
                    userService.getUsers({ page: currentPage - 1, size: pageSize, keyword: searchText }),
                    userService.getCurrentAdmin()
                ]);

                if (usersResult.success) {
                    setUsers(usersResult.data.content);
                    setTotal(usersResult.data.totalElements);
                }

                if (adminInfo.success) {
                    setCurrentAdminId(adminInfo.data.id);
                } else {
                    message.error('无法获取当前用户信息，部分功能可能受限');
                }

            } catch (error) {
                console.error('Failed to load data:', error);
                message.error('数据加载失败');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, pageSize, searchText]);

    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const sendDeleteCode = async (userId: string) => {
        try {
            const result = await userService.sendDeleteVerificationCode(userId);
            if (result.success) {
                message.success('删除验证码已发送至您的邮箱');
                setDeleteUserId(userId);
                setDeleteModalVisible(true);
            }
        } catch (error) {
            console.error('Failed to send delete code:', error);
            message.error('发送验证码失败');
        }
    };

    const confirmDelete = async () => {
        if (!deleteUserId || !verificationCode) {
            return message.error('请输入验证码');
        }
        setDeleteLoading(deleteUserId);
        try {
            const result = await userService.deleteUser(deleteUserId, verificationCode);
            if (result.success) {
                message.success('用户删除成功');
                setDeleteModalVisible(false);
                setVerificationCode('');
                setDeleteUserId(null);
                // 重新加载数据
                const usersResult = await userService.getUsers({ page: currentPage - 1, size: pageSize, keyword: searchText });
                if (usersResult.success) {
                    setUsers(usersResult.data.content);
                    setTotal(usersResult.data.totalElements);
                }
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            message.error('删除失败');
        } finally {
            setDeleteLoading(null);
        }
    };

    const showApprovalModal = (userId: string) => {
        setApprovalUserId(userId);
        setApprovalModalVisible(true);
        approvalForm.resetFields();
    };

    const handleApproval = async () => {
        if (!approvalUserId) return;
        try {
            const values = await approvalForm.validateFields();
            const result = await userService.approveUser(approvalUserId, values);
            if (result.success) {
                message.success('用户审核完成');
                setApprovalModalVisible(false);
                setApprovalUserId(null);
                approvalForm.resetFields();
                // 重新加载数据
                const usersResult = await userService.getUsers({ page: currentPage - 1, size: pageSize, keyword: searchText });
                if (usersResult.success) {
                    setUsers(usersResult.data.content);
                    setTotal(usersResult.data.totalElements);
                }
            }
        } catch (error) {
            console.error('Failed to approve user:', error);
            message.error('审核操作失败');
        }
    };

    const getRoleTag = (role: string) => {
        return role === 'ADMIN' ?
            <Tag color="red">管理员</Tag> :
            <Tag color="blue">用户</Tag>;
    };

    const getStatusTag = (status: string) => {
        const statusMap = { PENDING: { color: 'orange', text: '待审核' }, ACTIVE: { color: 'green', text: '正常' }, INACTIVE: { color: 'red', text: '已禁用' }, DELETED: { color: 'red', text: '已删除' } };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns: ColumnsType<AdminUser> = [
        {
            title: '用户',
            dataIndex: 'username',
            key: 'username',
            render: (_text, record) => (
                <Space>
                    <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
                    <div>
                        <div className="font-medium">{record.displayName || record.username}</div>
                        <div className="text-white/60 text-sm">{record.email}</div>
                    </div>
                </Space>
            ),
        },
        { title: '角色', dataIndex: 'role', key: 'role', width: 100, render: getRoleTag, align: 'center' },
        { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: getStatusTag, align: 'center' },
        { title: '邮箱验证', dataIndex: 'emailVerified', key: 'emailVerified', width: 100, align: 'center', render: (verified) => <Tag color={verified ? 'green' : 'red'}>{verified ? '已验证' : '未验证'}</Tag> },
        { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt', width: 150, align: 'center', render: (time) => <span>{new Date(time).toLocaleDateString('zh-CN')}</span> },
        { title: '最后登录', dataIndex: 'lastLoginAt', key: 'lastLoginAt', width: 150, align: 'center', render: (time) => <span>{time ? new Date(time).toLocaleDateString('zh-CN') : '从未登录'}</span> },
        {
            title: '操作',
            key: 'action',
            width: 200,
            align: 'center',
            render: (_, record) => {
                const isSelf = record.id === currentAdminId;
                const deleteButton = (
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        loading={deleteLoading === record.id}
                        onClick={() => sendDeleteCode(record.id)}
                        disabled={isSelf}
                    />
                );

                return (
                    <Space>
                        {record.status === 'PENDING' && (
                            <Tooltip title="审核用户">
                                <Button type="text" icon={<CheckOutlined />} className="text-green-400" onClick={() => showApprovalModal(record.id)} />
                            </Tooltip>
                        )}
                        <Tooltip title="发送邮件">
                            <Button type="text" icon={<MailOutlined />} className="text-blue-400" />
                        </Tooltip>

                        {isSelf ? (
                            <Tooltip title="不能删除自己的账户">
                                {deleteButton}
                            </Tooltip>
                        ) : (
                            <Tooltip title="删除用户">
                                {deleteButton}
                            </Tooltip>
                        )}
                    </Space>
                );
            }
        },
    ];

    const EmptyState = () => (
        <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <UserOutlined style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.6)' }} />
            <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: '24px 0 12px', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                {searchText ? '未找到相关用户' : '暂无用户'}
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', lineHeight: '1.5' }}>
                {searchText ? '请尝试使用其他关键词搜索' : '还没有用户注册，等待第一个用户的到来。'}
            </p>
        </div>
    );

    const glassMorphismTheme = {
        token: {
            colorText: 'rgba(255, 255, 255, 0.85)',
            colorTextHeading: 'rgba(255, 255, 255, 1)',
            colorBorderSecondary: 'rgba(255, 255, 255, 0.2)',
            colorBgElevated: 'rgba(35, 42, 62, 0.9)',
        },
        components: {
            Table: {
                colorBgContainer: 'transparent',
                headerBg: 'transparent',
                rowHoverBg: 'rgba(255, 255, 255, 0.1)',
                headerColor: 'rgba(255, 255, 255, 1)',
                headerSplitColor: 'rgba(255, 255, 255, 0.2)',
            },
            Pagination: {
                colorBgContainer: 'transparent',
                itemActiveBg: 'rgba(255, 255, 255, 0.15)',
            },
            Input: {
                colorBgContainer: 'rgba(0, 0, 0, 0.2)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
            },
            Select: {
                // ⭐ 核心修改：为 Select 组件主体指定背景色和边框
                colorBgContainer: 'rgba(0, 0, 0, 0.2)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                // 下拉菜单背景已由 token.colorBgElevated 全局设置
                // 选中项的背景色
                optionSelectedBg: 'rgba(255, 255, 255, 0.15)',
                // 清除按钮的悬浮颜色
                colorIconHover: 'rgba(255, 255, 255, 0.85)',
            },
        },
    };

    return (
        <ConfigProvider theme={glassMorphismTheme}>
            <div style={{ padding: '24px', minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>用户管理</h1>
                    <Input.Search
                        placeholder="搜索用户名、邮箱..."
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                        enterButton
                        allowClear
                    />
                </div>

                <Card className="glass-effect border-0 shadow-xl" bodyStyle={{ padding: '24px' }}>
                    {users.length > 0 || loading ? (
                        <>
                            <Table
                                columns={columns}
                                dataSource={users}
                                loading={loading}
                                rowKey="id"
                                pagination={false}
                            />
                            {total > 0 && (
                                <div style={{ padding: '24px 0 0', textAlign: 'center' }}>
                                    <Pagination
                                        current={currentPage}
                                        total={total}
                                        pageSize={pageSize}
                                        showSizeChanger
                                        onChange={(page, size) => { setCurrentPage(page); setPageSize(size || 10); }}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </Card>

                <Modal
                    title="确认删除用户"
                    open={deleteModalVisible}
                    onCancel={() => { setDeleteModalVisible(false); setVerificationCode(''); setDeleteUserId(null); }}
                    footer={[
                        <Button key="cancel" onClick={() => { setDeleteModalVisible(false); setVerificationCode(''); setDeleteUserId(null); }}>取消</Button>,
                        <Button key="confirm" type="primary" danger loading={!!deleteLoading} onClick={confirmDelete}>确认删除</Button>
                    ]}
                >
                    <p>删除用户是不可逆操作，请输入邮箱收到的验证码进行确认：</p>
                    <Input placeholder="请输入6位验证码" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} maxLength={6} style={{ marginTop: '8px' }}/>
                </Modal>

                <Modal
                    title="用户审核"
                    open={approvalModalVisible}
                    onCancel={() => { setApprovalModalVisible(false); setApprovalUserId(null); approvalForm.resetFields(); }}
                    footer={[
                        <Button key="cancel" onClick={() => { setApprovalModalVisible(false); setApprovalUserId(null); approvalForm.resetFields(); }}>取消</Button>,
                        <Button key="confirm" type="primary" onClick={handleApproval}>确认审核</Button>
                    ]}
                >
                    <Form form={approvalForm} layout="vertical">
                        <Form.Item label="审核状态" name="status" rules={[{ required: true, message: '请选择审核状态' }]}>
                            <Select placeholder="请选择审核状态">
                                <Option value="ACTIVE">通过审核</Option>
                                <Option value="INACTIVE">拒绝审核</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="审核原因" name="reason" rules={[{ required: true, message: '请输入审核原因' }]}>
                            <Input.TextArea rows={3} placeholder="请输入审核原因或备注" />
                        </Form.Item>
                        <Form.Item label="备注" name="notes">
                            <Input.TextArea rows={2} placeholder="可选：额外备注信息" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default UserManagement;