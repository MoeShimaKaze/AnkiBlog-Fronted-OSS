// src/pages/admin/BackgroundManagement.tsx - 适配 VerificationModal 版本
import React, { useState, useEffect } from 'react'
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    InputNumber,
    Space,
    Tag,
    Card,
    Tooltip,
    message
} from 'antd'
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    ReloadOutlined,
    EyeOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useBackgroundSettings, useBackgroundActions } from '@/hooks/api/useBackground'
import type {
    BackgroundSettings,
    BackgroundSettingsRequest,
    BackgroundType
} from '@/types/background'
import { BACKGROUND_TYPE_OPTIONS, DEFAULT_APIS } from '@/types/background'
import { usePageTitle } from "@/hooks/business/usePageTitle.ts";
import VerificationModal from '@/components/Common/VerificationModal';
import { modalGlassCardStyle } from '@/constants/styles';

const { Option } = Select
const { TextArea } = Input

interface BackgroundFormData extends BackgroundSettingsRequest {
    id?: string
}

const BackgroundManagement: React.FC = () => {
    usePageTitle('图片API管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })

    const {
        loading,
        data,
        total,
        current,
        pageSize,
        fetchData,
        createItem,
        updateItem,
        toggleItem,
        deleteItem,
        setCurrent,
        setPageSize
    } = useBackgroundSettings()

    const { testing, refreshing, testApi, refreshImage } = useBackgroundActions()

    const [modalVisible, setModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState<BackgroundSettings | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [form] = Form.useForm<BackgroundFormData>()

    // 删除确认模态框状态
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<BackgroundSettings | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreate = () => {
        setEditingItem(null)
        setModalVisible(true)
        form.resetFields()
        form.setFieldsValue({
            active: false,
            autoChange: false,
            changeInterval: 30
        })
    }

    const handleEdit = (record: BackgroundSettings) => {
        setEditingItem(record)
        setModalVisible(true)
        form.setFieldsValue(record)
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()

            if (editingItem) {
                await updateItem(editingItem.id, values)
            } else {
                await createItem(values)
            }

            setModalVisible(false)
            form.resetFields()
        } catch (error) {
            // Form validation error or API error
        }
    }

    // 显示删除确认模态框
    const showDeleteConfirm = (record: BackgroundSettings) => {
        setItemToDelete(record)
        setDeleteModalVisible(true)
    }

    // 处理删除背景设置
    const handleDeleteItem = async () => {
        if (!itemToDelete) return

        setDeleteLoading(true)
        try {
            await deleteItem(itemToDelete.id)

            // 关闭模态框
            setDeleteModalVisible(false)
            setItemToDelete(null)
        } catch (error) {
            // Error handling is done in the hook
        } finally {
            setDeleteLoading(false)
        }
    }

    // 取消删除
    const handleCancelDelete = () => {
        setDeleteModalVisible(false)
        setItemToDelete(null)
    }

    const handleTestApi = async () => {
        try {
            const values = await form.validateFields(['value'])
            if (values.value) {
                await testApi(values.value)
            }
        } catch (error) {
            message.error('请先填写API地址')
        }
    }

    const handleRefresh = async () => {
        const imageUrl = await refreshImage()
        if (imageUrl) {
            setPreviewImage(imageUrl)
            setPreviewVisible(true)
        }
    }

    const handlePreviewImage = (imageUrl: string) => {
        setPreviewImage(imageUrl)
        setPreviewVisible(true)
    }

    const getTypeTag = (type: BackgroundType) => {
        const config = BACKGROUND_TYPE_OPTIONS.find(opt => opt.code === type)
        const colors: Record<BackgroundType, string> = {
            COLOR: 'blue',
            GRADIENT: 'purple',
            IMAGE: 'green',
            API: 'orange'
        }
        return <Tag color={colors[type]}>{config?.displayName}</Tag>
    }

    const getValueDisplay = (record: BackgroundSettings) => {
        const { type, value } = record

        if (!value) return '-'

        switch (type) {
            case 'COLOR':
                return (
                    <Space>
                        <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: value }}
                        />
                        <span className="font-mono text-sm">{value}</span>
                    </Space>
                )
            case 'GRADIENT':
                return (
                    <div className="flex items-center space-x-2">
                        <div
                            className="w-8 h-4 rounded border border-gray-300"
                            style={{ background: value }}
                        />
                        <span className="font-mono text-xs truncate max-w-32">{value}</span>
                    </div>
                )
            case 'IMAGE':
                return (
                    <Space>
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handlePreviewImage(value)}
                        >
                            预览
                        </Button>
                        <span className="font-mono text-xs truncate max-w-32">{value}</span>
                    </Space>
                )
            case 'API':
                return (
                    <Space>
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            loading={testing}
                            onClick={() => testApi(value)}
                        >
                            测试
                        </Button>
                        <span className="font-mono text-xs truncate max-w-32">{value}</span>
                    </Space>
                )
            default:
                return value
        }
    }

    const columns: ColumnsType<BackgroundSettings> = [
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type: BackgroundType) => getTypeTag(type)
        },
        {
            title: '值/预览',
            key: 'value',
            render: (_, record) => getValueDisplay(record)
        },
        {
            title: '状态',
            dataIndex: 'active',
            key: 'active',
            width: 80,
            render: (active: boolean) => (
                <Tag color={active ? 'success' : 'default'}>
                    {active ? '激活' : '未激活'}
                </Tag>
            )
        },
        {
            title: '自动切换',
            dataIndex: 'autoChange',
            key: 'autoChange',
            width: 100,
            render: (autoChange: boolean, record) => (
                <Space direction="vertical" size="small">
                    <Tag color={autoChange ? 'processing' : 'default'}>
                        {autoChange ? '是' : '否'}
                    </Tag>
                    {autoChange && record.changeInterval && (
                        <span className="text-xs text-gray-500">
                            {record.changeInterval}分钟
                        </span>
                    )}
                </Space>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (time: string) => new Date(time).toLocaleString()
        },
        {
            title: '操作',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="编辑">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.active ? '停用' : '激活'}>
                        <Button
                            size="small"
                            icon={record.active ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                            onClick={() => toggleItem(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteConfirm(record)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ]

    const renderFormContent = () => {
        const watchType = Form.useWatch('type', form)

        const glassInputStyle: React.CSSProperties = {
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
        }

        const labelStyle: React.CSSProperties = {
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
        }

        return (
            <>
                <Form.Item
                    name="type"
                    label={<span style={labelStyle}>背景类型</span>}
                    rules={[{ required: true, message: '请选择背景类型' }]}
                >
                    <Select
                        placeholder="选择背景类型"
                        style={glassInputStyle}
                        dropdownStyle={{
                            background: 'rgba(35, 35, 35, 0.9)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                        }}
                        dropdownRender={(menu) => (
                            <div style={{
                                background: 'rgba(35, 35, 35, 0.9)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                {menu}
                            </div>
                        )}
                    >
                        {BACKGROUND_TYPE_OPTIONS.map(option => (
                            <Option key={option.code} value={option.code} style={{
                                background: 'transparent',
                                color: 'white',
                            }}>
                                {option.displayName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {watchType && (
                    <Form.Item
                        name="value"
                        label={<span style={labelStyle}>
                            {watchType === 'COLOR' ? '颜色值' :
                                watchType === 'GRADIENT' ? '渐变CSS' :
                                    watchType === 'IMAGE' ? '图片URL' :
                                        'API地址'}
                        </span>}
                        rules={[
                            { max: 500, message: '长度不能超过500个字符' },
                            watchType === 'COLOR' ? { pattern: /^#[0-9A-Fa-f]{6}$/, message: '请输入有效的颜色值' } : {}
                        ]}
                    >
                        {watchType === 'GRADIENT' ? (
                            <TextArea
                                rows={3}
                                placeholder="如: linear-gradient(45deg, #ff6b6b, #4ecdc4)"
                                style={glassInputStyle}
                            />
                        ) : watchType === 'API' ? (
                            <Input
                                style={glassInputStyle}
                                placeholder="输入API地址"
                                suffix={
                                    <Button
                                        type="primary"
                                        size="small"
                                        loading={testing}
                                        onClick={handleTestApi}
                                    >
                                        测试
                                    </Button>
                                }
                            />
                        ) : (
                            <Input
                                placeholder={
                                    watchType === 'COLOR' ? '#ffffff' :
                                        watchType === 'IMAGE' ? 'https://example.com/image.jpg' :
                                            '输入值'
                                }
                                style={glassInputStyle}
                            />
                        )}
                    </Form.Item>
                )}

                {watchType === 'API' && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ ...labelStyle, fontSize: '14px', marginBottom: '8px' }}>预设API:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {DEFAULT_APIS.map((api, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>{api.description}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace' }}>{api.url}</div>
                                    </div>
                                    <Button
                                        size="small"
                                        onClick={() => form.setFieldValue('value', api.url)}
                                    >
                                        使用
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Form.Item
                    name="active"
                    label={<span style={labelStyle}>激活状态</span>}
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    name="autoChange"
                    label={<span style={labelStyle}>自动切换</span>}
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.autoChange !== curr.autoChange}
                >
                    {({ getFieldValue }) =>
                        getFieldValue('autoChange') && (
                            <Form.Item
                                name="changeInterval"
                                label={<span style={labelStyle}>切换间隔 (分钟)</span>}
                                rules={[{ required: true, message: '请输入切换间隔' }]}
                            >
                                <InputNumber min={1} max={1440} placeholder="30" style={glassInputStyle} />
                            </Form.Item>
                        )
                    }
                </Form.Item>
            </>
        )
    }

    return (
        <div className="p-6">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">背景设置管理</h1>
                    <Space>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            loading={refreshing}
                            onClick={handleRefresh}
                        >
                            刷新背景图片
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                        >
                            新增背景设置
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        current,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                        onChange: (page, size) => {
                            setCurrent(page)
                            setPageSize(size || 10)
                            fetchData({ page: page - 1, size: size || 10 })
                        }
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* 编辑/创建模态框 */}
            <Modal
                title={null}
                footer={null}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false)
                    form.resetFields()
                }}
                width={600}
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
                    <h4 style={{
                        color: 'white',
                        margin: 0,
                        marginBottom: '24px',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 600
                    }}>
                        {editingItem ? '编辑背景设置' : '新增背景设置'}
                    </h4>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            active: false,
                            autoChange: false,
                            changeInterval: 30
                        }}
                        onFinish={handleSubmit}
                    >
                        {renderFormContent()}
                    </Form>
                    <div style={{ textAlign: 'right', marginTop: '16px' }}>
                        <Button
                            onClick={() => {
                                setModalVisible(false)
                                form.resetFields()
                            }}
                            style={{ marginRight: 8 }}
                        >
                            取消
                        </Button>
                        <Button type="primary" onClick={() => form.submit()}>
                            提交
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* 图片预览模态框 */}
            <Modal
                title="图片预览"
                open={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width={800}
                centered
            >
                {previewImage && (
                    <img
                        src={previewImage}
                        alt="预览"
                        className="w-full h-auto max-h-96 object-contain"
                        onError={() => message.error('图片加载失败')}
                    />
                )}
            </Modal>

            {/* 删除确认模态框 */}
            <VerificationModal
                visible={deleteModalVisible}
                onCancel={handleCancelDelete}
                onSubmit={handleDeleteItem}
                isSubmitting={deleteLoading}
                title="确认删除背景设置"
                requireVerification={false}
                okText="确认删除"
                cancelText="取消"
                danger={true}
                content={
                    itemToDelete && (
                        <div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>类型：</strong>{BACKGROUND_TYPE_OPTIONS.find(opt => opt.code === itemToDelete.type)?.displayName}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>值：</strong><span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{itemToDelete.value || '未设置'}</span>
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 16px 0' }}>
                                <strong>状态：</strong>{itemToDelete.active ? '激活' : '未激活'}
                            </p>
                            <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>
                                ⚠️ 此操作不可撤销
                            </p>
                        </div>
                    )
                }
            />
        </div>
    )
}

export default BackgroundManagement
