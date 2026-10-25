// src/components/admin/Settings/TemplateManagerCard.tsx
import React, { useState } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tooltip,
    Popconfirm,
    Badge,
    Modal,
    Input
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    CopyOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { SiteProfile } from '@/services/siteSettings';
import { modalGlassCardStyle } from '@/constants/styles';

interface TemplateManagerCardProps {
    templates: SiteProfile[];
    loading: boolean;
    onActivate: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string, name: string) => void;
    onCreate: () => void;
}

const TemplateManagerCard: React.FC<TemplateManagerCardProps> = ({
                                                                     templates,
                                                                     loading,
                                                                     onActivate,
                                                                     onDelete,
                                                                     onDuplicate,
                                                                     onCreate
                                                                 }) => {
    const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<any>(null);
    const [newTemplateName, setNewTemplateName] = useState('');

    const handleDuplicateOk = () => {
        if (currentTemplate && newTemplateName.trim()) {
            onDuplicate(currentTemplate.id, newTemplateName.trim());
            setDuplicateModalVisible(false);
            setNewTemplateName('');
            setCurrentTemplate(null);
        }
    };

    const handleDuplicateCancel = () => {
        setDuplicateModalVisible(false);
        setNewTemplateName('');
        setCurrentTemplate(null);
    };

    const columns = [
        {
            title: '模板名称',
            dataIndex: 'templateName',
            key: 'templateName',
            render: (text: string, record: any) => (
                <Space>
                    <span className="text-white">{text}</span>
                    {record.isActiveTemplate && (
                        <Badge status="success" text={<span className="text-green-400">当前激活</span>} />
                    )}
                </Space>
            ),
        },
        {
            title: '描述',
            dataIndex: 'templateDescription',
            key: 'templateDescription',
            render: (text: string) => <span className="text-white/70">{text}</span>,
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => <span className="text-white/70">{new Date(date).toLocaleString()}</span>,
        },
        {
            title: '操作',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    {!record.isActiveTemplate && (
                        <Tooltip title="激活模板">
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => onActivate(record.id)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="复制模板">
                        <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => {
                                setCurrentTemplate(record);
                                setNewTemplateName(`${record.templateName}_副本`);
                                setDuplicateModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    {!record.isActiveTemplate && (
                        <Popconfirm
                            title={<span style={{ color: 'white' }}>确认删除此模板吗？</span>}
                            onConfirm={() => onDelete(record.id)}
                            okText="确认"
                            cancelText="取消"
                            overlayClassName="glass-popconfirm"
                            okButtonProps={{
                                style: {
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    border: 'none',
                                    color: 'white'
                                }
                            }}
                            cancelButtonProps={{
                                style: {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white'
                                }
                            }}
                        >
                            <Tooltip title="删除模板">
                                <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card
                title={
                    <div className="flex justify-between items-center">
                        <span className="text-white">站点模板管理</span>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onCreate}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                border: 'none'
                            }}
                        >
                            新建模板
                        </Button>
                    </div>
                }
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
            >
                <Table
                    columns={columns}
                    dataSource={templates}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    className="custom-table"
                />

                <style dangerouslySetInnerHTML={{
                    __html: `
                        .custom-table .ant-table {
                            background: transparent !important;
                        }
                        .custom-table .ant-table-thead > tr > th {
                            background: rgba(255, 255, 255, 0.1) !important;
                            color: white !important;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
                        }
                        .custom-table .ant-table-tbody > tr > td {
                            background: transparent !important;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                        }
                        .custom-table .ant-table-tbody > tr:hover > td {
                            background: rgba(255, 255, 255, 0.05) !important;
                        }
                        
                        /* Popconfirm 玻璃拟态样式 */
                        .glass-popconfirm .ant-popover-inner {
                            background: rgba(35, 35, 35, 0.95) !important;
                            backdrop-filter: saturate(180%) blur(20px) !important;
                            -webkit-backdrop-filter: saturate(180%) blur(20px) !important;
                            border-radius: 12px !important;
                            border: 1px solid rgba(255, 255, 255, 0.2) !important;
                            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
                        }
                        
                        .glass-popconfirm .ant-popover-arrow {
                            display: none !important;
                        }
                        
                        .glass-popconfirm .ant-popover-inner-content {
                            padding: 16px !important;
                        }
                        
                        .glass-popconfirm .ant-popconfirm-message {
                            color: white !important;
                            margin-bottom: 16px !important;
                        }
                        
                        .glass-popconfirm .ant-popconfirm-message-icon {
                            color: #faad14 !important;
                        }
                        
                        .glass-popconfirm .ant-popconfirm-buttons {
                            margin-bottom: 0 !important;
                        }
                        
                        .glass-popconfirm .ant-btn {
                            height: 32px !important;
                            border-radius: 6px !important;
                        }
                        
                        .glass-popconfirm .ant-btn:hover {
                            opacity: 0.8 !important;
                        }
                    `
                }} />
            </Card>

            <Modal
                open={duplicateModalVisible}
                title={null}
                footer={null}
                onCancel={handleDuplicateCancel}
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
                        <h3 style={{ color: 'white', margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>
                            复制模板
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontSize: '14px' }}>
                            请为新模板设置一个名称
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 500,
                            fontSize: '14px',
                            marginBottom: '8px'
                        }}>
                            新模板名称 <span style={{ color: '#ff4d4f' }}>*</span>
                        </label>
                        <Input
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="请输入新模板名称"
                            autoFocus
                            style={{
                                background: 'rgba(55, 65, 81, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '14px',
                                height: '40px'
                            }}
                            className="glass-input"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button
                            onClick={handleDuplicateCancel}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white'
                            }}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleDuplicateOk}
                            disabled={!newTemplateName.trim()}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                border: 'none'
                            }}
                        >
                            确认复制
                        </Button>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                        .glass-input::placeholder {
                            color: rgba(255, 255, 255, 0.5) !important;
                        }
                        
                        .glass-input:hover {
                            border-color: rgba(255, 255, 255, 0.5) !important;
                            background: rgba(75, 85, 99, 0.8) !important;
                        }
                        
                        .glass-input:focus {
                            border-color: #60a5fa !important;
                            background: rgba(75, 85, 99, 0.8) !important;
                            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
                            outline: none !important;
                        }
                    `
                }} />
            </Modal>
        </>
    );
};

export default TemplateManagerCard;
