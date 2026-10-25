// src/components/Admin/PageTitleManagement.tsx - 修复版本
import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Space,
    message,
    Row,
    Col,
    Spin,
    Tabs,
    Table,
    Modal,
    InputNumber,
    Popconfirm,
    Tag
} from 'antd';
import {
    SaveOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import {
    getPageTitleConfig,
    updatePageTitleConfig,
    DynamicPageTitleTemplates, // 使用动态类型
    resetPageTitleTemplates
} from '@/services/pageTitle';
import {
    getAllPageTypes,
    createPageType,
    updatePageType,
    deletePageType,
    PageTypeConfig,
    CreatePageTypeRequest,
    UpdatePageTypeRequest
} from '@/services/pageTypeConfig';
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";
import { modalGlassCardStyle } from '@/constants/styles';

const { TabPane } = Tabs;

const PageTitleManagement: React.FC = () => {
    usePageTitle('页面标题管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })

    const [titleForm] = Form.useForm();
    const [titleLoading, setTitleLoading] = useState(true);
    const [titleSubmitting, setTitleSubmitting] = useState(false);
    const [allPageTypes, setAllPageTypes] = useState<PageTypeConfig[]>([]);

    const [typeConfigs, setTypeConfigs] = useState<PageTypeConfig[]>([]);
    const [typeLoading, setTypeLoading] = useState(false);
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [editingConfig, setEditingConfig] = useState<PageTypeConfig | null>(null);
    const [typeForm] = Form.useForm();

    const fetchTitleConfig = useCallback(async () => {
        setTitleLoading(true);
        try {
            const [titleRes, typesRes] = await Promise.all([
                getPageTitleConfig(),
                getAllPageTypes()
            ]);

            console.log('📥 获取页面标题配置:', titleRes);
            console.log('📥 获取页面类型列表:', typesRes);

            if (titleRes.success && titleRes.data) {
                const formData = {
                    defaultPageTitle: titleRes.data.defaultPageTitle,
                    templates: titleRes.data.templates || {},
                };
                console.log('📋 设置表单数据:', formData);
                console.log('🏷️ 模板数量:', Object.keys(formData.templates).length);

                titleForm.setFieldsValue(formData);
            } else {
                console.error('❌ 获取页面标题配置失败:', titleRes.message);
                message.error(titleRes.message || '获取页面标题配置失败');
            }

            if (typesRes.success && typesRes.data) {
                console.log('📝 设置页面类型:', typesRes.data.length, '个');
                setAllPageTypes(typesRes.data);
            } else {
                console.error('❌ 获取页面类型失败:', typesRes.message);
            }
        } catch (error) {
            console.error('❌ 网络请求失败:', error);
            message.error('网络错误，无法加载配置');
        } finally {
            setTitleLoading(false);
        }
    }, [titleForm]);

    const fetchTypeConfigs = useCallback(async () => {
        setTypeLoading(true);
        try {
            const response = await getAllPageTypes();
            if (response.success && response.data) {
                setTypeConfigs(response.data);
            } else {
                message.error(response.message || '加载失败');
            }
        } catch (error) {
            message.error('加载页面类型配置失败');
        } finally {
            setTypeLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchTitleConfig();
        void fetchTypeConfigs();
    }, [fetchTitleConfig, fetchTypeConfigs]);

    // 修复：使用动态类型处理表单提交
    const handleTitleSubmit = async (values: { templates: DynamicPageTitleTemplates }) => {
        setTitleSubmitting(true);
        try {
            console.log('📤 提交的模板数据:', values.templates);
            console.log('📊 模板字段数量:', Object.keys(values.templates || {}).length);

            // 过滤掉空值
            const filteredTemplates: DynamicPageTitleTemplates = {};
            Object.entries(values.templates || {}).forEach(([key, value]) => {
                if (value && value.trim()) {
                    filteredTemplates[key] = value.trim();
                }
            });

            console.log('🧹 过滤后的模板:', filteredTemplates);

            const res = await updatePageTitleConfig(filteredTemplates);
            if (res.success) {
                message.success('页面标题配置保存成功！');
                void fetchTitleConfig();
            } else {
                message.error(res.message || '保存失败');
            }
        } catch (error) {
            console.error('❌ 保存失败:', error);
            message.error('网络错误，保存失败');
        } finally {
            setTitleSubmitting(false);
        }
    };

    const handleTitleReset = async () => {
        setTitleLoading(true);
        try {
            const res = await resetPageTitleTemplates();
            if (res.success && res.data) {
                titleForm.setFieldsValue({
                    defaultPageTitle: res.data.defaultPageTitle,
                    templates: res.data.templates,
                });
                message.success('已重置为默认配置');
            } else {
                message.error(res.message || '重置失败');
            }
        } catch (error) {
            message.error('网络错误，重置失败');
        } finally {
            setTitleLoading(false);
        }
    };

    const handleTypeAdd = () => {
        setEditingConfig(null);
        typeForm.resetFields();
        setTypeModalVisible(true);
    };

    const handleTypeEdit = (config: PageTypeConfig) => {
        setEditingConfig(config);
        typeForm.setFieldsValue(config);
        setTypeModalVisible(true);
    };

    const handleTypeDelete = async (pageType: string) => {
        try {
            const response = await deletePageType(pageType);
            if (response.success) {
                message.success('删除成功');
                // 刷新两个列表
                await Promise.all([fetchTypeConfigs(), fetchTitleConfig()]);
            } else {
                message.error(response.message || '删除失败');
            }
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleTypeSubmit = async (values: any) => {
        try {
            if (editingConfig) {
                const updateRequest: UpdatePageTypeRequest = {
                    displayName: values.displayName,
                    pathPattern: values.pathPattern,
                    priority: values.priority,
                    description: values.description
                };
                const response = await updatePageType(editingConfig.pageType, updateRequest);
                if (response.success) {
                    message.success('更新成功');
                } else {
                    message.error(response.message || '更新失败');
                    return;
                }
            } else {
                const createRequest: CreatePageTypeRequest = {
                    pageType: values.pageType,
                    displayName: values.displayName,
                    pathPattern: values.pathPattern,
                    priority: values.priority || 0,
                    description: values.description
                };
                const response = await createPageType(createRequest);
                if (response.success) {
                    message.success('创建成功');
                } else {
                    message.error(response.message || '创建失败');
                    return;
                }
            }
            setTypeModalVisible(false);
            // 刷新两个列表
            await Promise.all([fetchTypeConfigs(), fetchTitleConfig()]);
        } catch (error) {
            message.error('操作失败');
        }
    };

    const titleHelpText = (
        <div className="text-white/60 text-sm space-y-1">
            <div>• <strong>可用模板变量：</strong></div>
            <div>• <code className="bg-white/10 px-1 rounded">{'{siteName}'}</code> - 站点名称</div>
            <div>• <code className="bg-white/10 px-1 rounded">{'{tagline}'}</code> - 站点副标题</div>
            <div>• <code className="bg-white/10 px-1 rounded">{'{title}'}</code> - 文章/商品/页面主标题</div>
            <div>• <code className="bg-white/10 px-1 rounded">{'{category}'}</code> - 文章分类</div>
            <div>• <code className="bg-white/10 px-1 rounded">{'{tags}'}</code> - 文章标签 (逗号分隔)</div>
            <div>• <code className="bg-white/10 px-1 rounded">{'{userName}'}</code> - 用户昵称</div>
            <div>• <code className="bg-white/10 px-1 rounded">{'{query}'}</code> - 搜索关键词</div>
        </div>
    );

    const typeColumns = [
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
                        onClick={() => handleTypeEdit(record)}
                    >
                        编辑
                    </Button>
                    {!record.isSystem && (
                        <Popconfirm
                            title="确定删除此页面类型配置？"
                            onConfirm={() => handleTypeDelete(record.pageType)}
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
    ];

    const modalContentStyle: React.CSSProperties = {
        ...modalGlassCardStyle,
        padding: '24px'
    };

    const formLabelStyle: React.CSSProperties = {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 500,
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
    };

    const formHelpTextStyle: React.CSSProperties = {
        color: 'rgba(255,255,255,0.7)'
    };

    const translucentFieldStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'white'
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: 'rgba(255, 255, 255, 0.05)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', padding: '24px' }}>
                <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0, marginBottom: '8px', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                    页面标题管理
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', margin: 0, textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                    动态配置全站页面的SEO标题格式和路径匹配规则
                </p>
            </div>

            <Card className="glass-effect border-0 shadow-xl" styles={{ body: { padding: '0' } }}>
                <Tabs defaultActiveKey="templates" style={{ padding: '24px' }}>
                    <TabPane tab="标题模板" key="templates">
                        <Spin spinning={titleLoading} tip="正在加载配置...">
                            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '24px', marginBottom: '24px' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '16px' }}>
                                    {titleHelpText}
                                </div>
                            </div>

                            <Form form={titleForm} layout="vertical" onFinish={handleTitleSubmit}>
                                <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
                                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                                        标题模板配置
                                    </h3>

                                    <Form.Item
                                        label={<span className="text-white font-medium">全局默认标题</span>}
                                        name="defaultPageTitle"
                                        tooltip={{ title: '此项在"站点设置"中修改，此处仅为显示。当某个页面的模板为空时，会使用此标题。', icon: <InfoCircleOutlined /> }}
                                    >
                                        <Input
                                            placeholder="全局默认站点标题"
                                            disabled
                                            style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white', cursor: 'not-allowed' }}
                                        />
                                    </Form.Item>

                                    <Row gutter={[24, 16]}>
                                        {allPageTypes.length > 0 ? allPageTypes.map((pageType) => (
                                            <Col xs={24} md={12} key={pageType.pageType}>
                                                <Form.Item
                                                    label={
                                                        <span className="text-white font-medium">
                                                            {pageType.displayName}
                                                            {pageType.isSystem && <Tag color="blue" style={{ marginLeft: 8 }}>系统</Tag>}
                                                        </span>
                                                    }
                                                    name={['templates', pageType.pageType]}
                                                >
                                                    <Input
                                                        placeholder={`例如：${pageType.displayName} - {siteName}`}
                                                        style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white' }}
                                                        className="placeholder-white/50"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        )) : (
                                            <Col xs={24}>
                                                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>正在加载页面类型...</span>
                                            </Col>
                                        )}
                                    </Row>
                                </div>

                                <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', padding: '24px' }}>
                                    <Space size="large">
                                        <Button
                                            size="large"
                                            icon={<ReloadOutlined />}
                                            onClick={handleTitleReset}
                                            disabled={titleSubmitting}
                                            style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white' }}
                                        >
                                            重置为默认
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<SaveOutlined />}
                                            loading={titleSubmitting}
                                            htmlType="submit"
                                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)', padding: '0 32px' }}
                                        >
                                            保存设置
                                        </Button>
                                    </Space>
                                </div>
                            </Form>
                        </Spin>
                    </TabPane>

                    <TabPane tab="页面类型" key="types">
                        <div style={{ marginBottom: '16px' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleTypeAdd}
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                            >
                                添加页面类型
                            </Button>
                        </div>

                        <Table
                            columns={typeColumns}
                            dataSource={typeConfigs}
                            rowKey="pageType"
                            loading={typeLoading}
                            pagination={{
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `共 ${total} 条记录`
                            }}
                            style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title={null}
                footer={null}
                open={typeModalVisible}
                onCancel={() => setTypeModalVisible(false)}
                destroyOnClose
                centered
                closable={false}
                styles={{
                    content: { background: 'transparent', boxShadow: 'none', padding: 0 },
                    mask: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }
                }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={modalContentStyle}>
                    <h4 style={{
                        color: 'white',
                        margin: 0,
                        marginBottom: '24px',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        {editingConfig ? '编辑页面类型' : '添加页面类型'}
                    </h4>

                    <Form
                        form={typeForm}
                        layout="vertical"
                        onFinish={handleTypeSubmit}
                    >
                        <Form.Item
                            label={<span style={formLabelStyle}>页面类型标识</span>}
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
                                style={translucentFieldStyle}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={formLabelStyle}>显示名称</span>}
                            name="displayName"
                            rules={[{ required: true, message: '请输入显示名称' }]}
                        >
                            <Input
                                placeholder="例如：自定义页面"
                                style={translucentFieldStyle}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={formLabelStyle}>路径模式</span>}
                            name="pathPattern"
                            rules={[{ required: true, message: '请输入路径模式' }]}
                            tooltip="支持精确匹配、通配符(*)和参数(:param)"
                            help={<span style={formHelpTextStyle}>支持精确匹配、通配符(*)和参数(:param)</span>}
                        >
                            <Input
                                placeholder="例如：/custom/:id 或 /custom/*"
                                style={translucentFieldStyle}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={formLabelStyle}>优先级</span>}
                            name="priority"
                            help={<span style={formHelpTextStyle}>数值越大优先级越高，用于路径匹配顺序</span>}
                        >
                            <InputNumber
                                placeholder="默认为0"
                                min={0}
                                max={1000}
                                style={{
                                    ...translucentFieldStyle,
                                    width: '100%'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={formLabelStyle}>描述</span>}
                            name="description"
                        >
                            <Input.TextArea
                                placeholder="页面类型的描述信息"
                                rows={3}
                                style={translucentFieldStyle}
                            />
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: 'right', marginTop: '24px' }}>
                        <Button
                            onClick={() => setTypeModalVisible(false)}
                            style={{
                                marginRight: 8,
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white'
                            }}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => typeForm.submit()}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                            }}
                        >
                            {editingConfig ? '更新' : '创建'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PageTitleManagement;
