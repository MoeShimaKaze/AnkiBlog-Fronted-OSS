// src/components/Admin/PageTypeManagement.tsx
import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
    getAllPageTypes,
    createPageType,
    updatePageType,
    deletePageType,
    PageTypeConfig,
    CreatePageTypeRequest,
    UpdatePageTypeRequest
} from '@/services/pageTypeConfig'

const PageTypeManagement: React.FC = () => {
    const [configs, setConfigs] = useState<PageTypeConfig[]>([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingConfig, setEditingConfig] = useState<PageTypeConfig | null>(null)
    const [form] = Form.useForm()

    const loadConfigs = async () => {
        setLoading(true)
        try {
            const response = await getAllPageTypes()
            if (response.success && response.data) {
                setConfigs(response.data)
            } else {
                message.error(response.message || '加载失败')
            }
        } catch (error) {
            message.error('加载页面类型配置失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadConfigs()
    }, [])

    const handleAdd = () => {
        setEditingConfig(null)
        form.resetFields()
        setModalVisible(true)
    }

    const handleEdit = (config: PageTypeConfig) => {
        setEditingConfig(config)
        form.setFieldsValue(config)
        setModalVisible(true)
    }

    const handleDelete = async (pageType: string) => {
        try {
            const response = await deletePageType(pageType)
            if (response.success) {
                message.success('删除成功')
                await loadConfigs()
            } else {
                message.error(response.message || '删除失败')
            }
        } catch (error) {
            message.error('删除失败')
        }
    }

    const handleSubmit = async (values: any) => {
        try {
            if (editingConfig) {
                const updateRequest: UpdatePageTypeRequest = {
                    displayName: values.displayName,
                    pathPattern: values.pathPattern,
                    priority: values.priority,
                    description: values.description
                }
                const response = await updatePageType(editingConfig.pageType, updateRequest)
                if (response.success) {
                    message.success('更新成功')
                } else {
                    message.error(response.message || '更新失败')
                    return
                }
            } else {
                const createRequest: CreatePageTypeRequest = {
                    pageType: values.pageType,
                    displayName: values.displayName,
                    pathPattern: values.pathPattern,
                    priority: values.priority || 0,
                    description: values.description
                }
                const response = await createPageType(createRequest)
                if (response.success) {
                    message.success('创建成功')
                } else {
                    message.error(response.message || '创建失败')
                    return
                }
            }
            setModalVisible(false)
            await loadConfigs()
        } catch (error) {
            message.error('操作失败')
        }
    }

    const columns = [
        {
            title: '页面类型',
            dataIndex: 'pageType',
            key: 'pageType',
            render: (text: string, record: PageTypeConfig) => (
                <Space>
                    <code>{text}</code>
                    {record.isSystem && <Tag color="blue">系统</Tag>}
                </Space>
            )
        },
        {
            title: '显示名称',
            dataIndex: 'displayName',
            key: 'displayName'
        },
        {
            title: '路径模式',
            dataIndex: 'pathPattern',
            key: 'pathPattern',
            render: (text: string) => <code>{text}</code>
        },
        {
            title: '优先级',
            dataIndex: 'priority',
            key: 'priority',
            sorter: (a: PageTypeConfig, b: PageTypeConfig) => a.priority - b.priority
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: PageTypeConfig) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    {!record.isSystem && (
                        <Popconfirm
                            title="确定删除此页面类型配置？"
                            onConfirm={() => handleDelete(record.pageType)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                            >
                                删除
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ]

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title="页面类型配置管理"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        添加页面类型
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={configs}
                    rowKey="pageType"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`
                    }}
                />
            </Card>

            <Modal
                title={editingConfig ? '编辑页面类型' : '添加页面类型'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="页面类型标识"
                        name="pageType"
                        rules={[
                            { required: true, message: '请输入页面类型标识' },
                            { pattern: /^[a-zA-Z][a-zA-Z0-9]*$/, message: '只能包含字母和数字，且以字母开头' }
                        ]}
                        tooltip="用于识别页面类型的唯一标识"
                    >
                        <Input
                            placeholder="例如：customPage"
                            disabled={!!editingConfig}
                        />
                    </Form.Item>

                    <Form.Item
                        label="显示名称"
                        name="displayName"
                        rules={[{ required: true, message: '请输入显示名称' }]}
                    >
                        <Input placeholder="例如：自定义页面" />
                    </Form.Item>

                    <Form.Item
                        label="路径模式"
                        name="pathPattern"
                        rules={[{ required: true, message: '请输入路径模式' }]}
                        tooltip="支持精确匹配、通配符(*)和参数(:param)"
                    >
                        <Input placeholder="例如：/custom/:id 或 /custom/*" />
                    </Form.Item>

                    <Form.Item
                        label="优先级"
                        name="priority"
                        tooltip="数值越大优先级越高，用于路径匹配顺序"
                    >
                        <InputNumber
                            placeholder="默认为0"
                            min={0}
                            max={1000}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="描述"
                        name="description"
                    >
                        <Input.TextArea
                            placeholder="页面类型的描述信息"
                            rows={3}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default PageTypeManagement

// 可以集成到现有的PageTitleManagement组件中
export { PageTypeManagement }