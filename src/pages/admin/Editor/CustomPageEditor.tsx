import React, { useState, useEffect } from 'react';
import {
    Form, Input, Select, Switch, Button, Card, Tabs, message,
    Row, Col, Space, Tooltip, Alert, Tag,
    ConfigProvider
} from 'antd';
import {
    SaveOutlined, EyeOutlined, CloudUploadOutlined,
    ArrowLeftOutlined, CodeOutlined, SettingOutlined,
    SecurityScanOutlined, GlobalOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import {CustomPage, CustomPageCreateRequest, CustomPageUpdateRequest } from '@/types/customPage';
import * as customPageService from '@/services/customPageService';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import CustomPagePreview from '@/components/CustomPage/CustomPagePreview';

const { Option } = Select;
const { TextArea } = Input;

const CustomPageEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = id !== 'new';

    usePageTitle(isEdit ? '编辑页面' : '创建页面', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    });

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState<CustomPage | null>(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [content, setContent] = useState('');
    const [customCss, setCustomCss] = useState('');
    const [customJs, setCustomJs] = useState('');

    const antdDarkTheme = {
        components: {
            Select: {
                colorBgElevated: 'rgba(35, 35, 45, 0.9)',
                colorText: 'rgba(255, 255, 255, 0.88)',
                optionSelectedBg: 'rgba(255, 255, 255, 0.15)',
                optionActiveBg: 'rgba(255, 255, 255, 0.08)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
            },
        },
    };
    useEffect(() => {
        if (isEdit && id) {
            loadPage(id);
        }
    }, [id, isEdit]);

    const loadPage = async (pageId: string) => {
        setLoading(true);
        try {
            const result = await customPageService.getAdminPageById(pageId);
            if (result.success) {
                setPage(result.data);
                setContent(result.data.content || '');
                setCustomCss(result.data.customCss || '');
                setCustomJs(result.data.customJs || '');
                form.setFieldsValue(result.data);
            }
        } catch (error) {
            console.error('Failed to load page:', error);
            message.error('加载页面失败');
            navigate('/admin/pages');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            const formData = {
                ...values,
                content,
                customCss,
                customJs
            };

            if (isEdit && id) {
                const updateData: CustomPageUpdateRequest = formData;
                await customPageService.updatePage(id, updateData);
                message.success('页面更新成功');
                await loadPage(id);
            } else {
                const createData: CustomPageCreateRequest = formData;
                const result = await customPageService.createPage(createData);
                if (result.success) {
                    message.success('页面创建成功');
                    navigate(`/admin/pages/edit/${result.data.id}`);
                }
            }
        } catch (error) {
            console.error('Failed to save page:', error);
            message.error('保存失败');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!isEdit || !id) return;

        try {
            await customPageService.publishPage(id);
            message.success('页面发布成功');
            await loadPage(id);
        } catch (error) {
            console.error('Failed to publish page:', error);
            message.error('发布失败');
        }
    };

    const validateSlug = (_: any, value: string) => {
        if (!value) {
            return Promise.reject('页面路径不能为空');
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
            return Promise.reject('页面路径只能包含小写字母、数字和连字符');
        }
        return Promise.resolve();
    };

    // 优化后的Alert样式
    const glassAlertStyle = {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        color: 'rgba(255, 255, 255, 0.95)',
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-white min-h-screen flex items-center justify-center">
                <div className="glass-effect p-8 rounded-2xl">
                    <div className="text-xl">加载中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 min-h-screen">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/admin/pages')}
                            className="bg-black/40 border-white/30 text-white hover:bg-black/60 hover:border-white/50"
                        >
                            <span className="hidden sm:inline">返回列表</span>
                        </Button>
                        <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg m-0">
                            {isEdit ? '编辑页面' : '创建页面'}
                        </h1>
                    </div>
                    <Space wrap>
                        {page && (
                            <CustomPagePreview
                                page={page}
                                trigger={
                                    <Button
                                        icon={<EyeOutlined />}
                                        className="bg-black/40 border-white/30 text-white hover:bg-black/60 hover:border-white/50"
                                    >
                                        <span className="hidden sm:inline">预览</span>
                                    </Button>
                                }
                            />
                        )}
                        {isEdit && page && !page.published && (
                            <Button
                                type="primary"
                                icon={<CloudUploadOutlined />}
                                onClick={handlePublish}
                                className="bg-gradient-to-r from-green-500 to-green-600 border-none hover:shadow-lg"
                            >
                                <span className="hidden sm:inline">发布</span>
                            </Button>
                        )}
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={saving}
                            onClick={() => form.submit()}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:shadow-lg"
                        >
                            <span className="hidden sm:inline">保存</span>
                        </Button>
                    </Space>
                </div>
                {page && (
                    <div className="flex flex-wrap gap-2">
                        <Tag color={page.published ? 'success' : 'processing'}>
                            {page.published ? '已发布' : '草稿'}
                        </Tag>
                        {page.featured && <Tag color="gold">推荐</Tag>}
                        {page.hasCustomCode && <Tag color="blue">自定义代码</Tag>}
                    </div>
                )}
            </div>

            <Card className="glass-effect border-0 shadow-xl">
                <ConfigProvider theme={antdDarkTheme}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        pageType: 'STATIC',
                        template: 'default',
                        published: false,
                        featured: false,
                        showInMenu: true,
                        menuOrder: 0,
                        sortOrder: 0,
                        commentsEnabled: false,
                        accessLevel: 'public',
                        redirectType: 301
                    }}
                    className="custom-page-form"
                >
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        className="custom-page-editor"
                        items={[
                            {
                                key: 'basic',
                                label: (
                                    <span className="text-white/90 font-medium">
                                        <SettingOutlined /> 基础信息
                                    </span>
                                ),
                                children: (
                                    <Row gutter={[24, 0]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="title"
                                                label={<span className="text-white/95 font-medium">页面标题</span>}
                                                rules={[
                                                    { required: true, message: '请输入页面标题' },
                                                    { max: 200, message: '标题长度不能超过200个字符' }
                                                ]}
                                            >
                                                <Input placeholder="输入页面标题" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="slug"
                                                label={<span className="text-white/95 font-medium">页面路径</span>}
                                                rules={[
                                                    { required: true, validator: validateSlug }
                                                ]}
                                            >
                                                <Input
                                                    placeholder="page-url"
                                                    addonBefore="/pages/"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item
                                                name="subtitle"
                                                label={<span className="text-white/95 font-medium">副标题</span>}
                                            >
                                                <Input placeholder="页面副标题（可选）" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                name="pageType"
                                                label={<span className="text-white/95 font-medium">页面类型</span>}
                                            >
                                                <Select>
                                                    <Option value="STATIC">静态页面</Option>
                                                    <Option value="DYNAMIC">动态页面</Option>
                                                    <Option value="PORTFOLIO">作品集</Option>
                                                    <Option value="LANDING">落地页</Option>
                                                    <Option value="REDIRECT">重定向页面</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                name="template"
                                                label={<span className="text-white/95 font-medium">页面模板</span>}
                                            >
                                                <Select>
                                                    <Option value="default">默认模板</Option>
                                                    <Option value="minimal">简约模板</Option>
                                                    <Option value="full-width">全宽模板</Option>
                                                    <Option value="custom">自定义模板</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                name="accessLevel"
                                                label={<span className="text-white/95 font-medium">访问级别</span>}
                                            >
                                                <Select>
                                                    <Option value="public">公开访问</Option>
                                                    <Option value="login_required">需要登录</Option>
                                                    <Option value="admin_only">仅管理员</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            },
                            {
                                key: 'content',
                                label: (
                                    <span className="text-white/90 font-medium">
                                        <CodeOutlined /> 内容编辑
                                    </span>
                                ),
                                children: (
                                    <div>
                                        <div className="mb-4">
                                            <label className="block text-white/95 font-medium mb-2">页面内容 (HTML)</label>
                                            <div className="border border-white/20 rounded-md overflow-hidden">
                                                <CodeMirror
                                                    value={content}
                                                    height="400px"
                                                    extensions={[html()]}
                                                    theme={oneDark}
                                                    placeholder="在这里编写HTML内容..."
                                                    onChange={(value) => setContent(value)}
                                                />
                                            </div>
                                        </div>

                                        <Alert
                                            message={
                                                <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: '600' }}>
                                                    <SecurityScanOutlined className="mr-2" />
                                                    安全提示
                                                </span>
                                            }
                                            description={
                                                <p style={{ color: 'rgba(255, 255, 255, 0.85)', margin: 0, lineHeight: '1.5' }}>
                                                    请确保HTML内容的安全性，避免使用危险的脚本标签。系统会对不安全的内容进行过滤。
                                                </p>
                                            }
                                            type="warning"
                                            showIcon={false}
                                            style={glassAlertStyle}
                                        />
                                    </div>
                                )
                            },
                            {
                                key: 'style',
                                label: (
                                    <span className="text-white/90 font-medium">
                                        <CodeOutlined /> 样式设计
                                    </span>
                                ),
                                children: (
                                    <div>
                                        <div className="mb-6">
                                            <label className="block text-white/95 font-medium mb-2">自定义CSS</label>
                                            <div className="border border-white/20 rounded-md overflow-hidden">
                                                <CodeMirror
                                                    value={customCss}
                                                    height="300px"
                                                    extensions={[css()]}
                                                    theme={oneDark}
                                                    placeholder="在这里编写CSS样式..."
                                                    onChange={(value) => setCustomCss(value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-white/95 font-medium mb-2">
                                                自定义JavaScript
                                                <Tooltip title="系统会检测并阻止不安全的代码">
                                                    <SecurityScanOutlined className="ml-2 text-amber-400" />
                                                </Tooltip>
                                            </label>
                                            <div className="border border-white/20 rounded-md overflow-hidden">
                                                <CodeMirror
                                                    value={customJs}
                                                    height="250px"
                                                    extensions={[javascript()]}
                                                    theme={oneDark}
                                                    placeholder="在这里编写JavaScript代码..."
                                                    onChange={(value) => setCustomJs(value)}
                                                />
                                            </div>
                                        </div>

                                        <Alert
                                            message={
                                                <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: '600' }}>
                                                    <SecurityScanOutlined className="mr-2" />
                                                    代码安全检查
                                                </span>
                                            }
                                            description={
                                                <p style={{ color: 'rgba(255, 255, 255, 0.85)', margin: 0, lineHeight: '1.5' }}>
                                                    为了网站安全，系统会自动检测并阻止潜在危险的JavaScript代码。如需使用高级功能，请联系管理员。
                                                </p>
                                            }
                                            type="info"
                                            showIcon={false}
                                            style={glassAlertStyle}
                                        />
                                    </div>
                                )
                            },
                            {
                                key: 'seo',
                                label: (
                                    <span className="text-white/90 font-medium">
                                        <GlobalOutlined /> SEO设置
                                    </span>
                                ),
                                children: (
                                    <Row gutter={[24, 0]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="seoTitle"
                                                label={<span className="text-white/95 font-medium">SEO标题</span>}
                                            >
                                                <Input placeholder="搜索引擎显示的标题" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="pageIcon"
                                                label={<span className="text-white/95 font-medium">页面图标</span>}
                                            >
                                                <Input placeholder="📄" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item
                                                name="seoDescription"
                                                label={<span className="text-white/95 font-medium">SEO描述</span>}
                                            >
                                                <TextArea
                                                    rows={3}
                                                    placeholder="搜索引擎显示的描述，建议160字符以内"
                                                    showCount
                                                    maxLength={160}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="seoKeywords"
                                                label={<span className="text-white/95 font-medium">关键词</span>}
                                            >
                                                <Input placeholder="关键词1, 关键词2, 关键词3" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="ogImage"
                                                label={<span className="text-white/95 font-medium">分享图片</span>}
                                            >
                                                <Input placeholder="https://example.com/image.jpg" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            },
                            {
                                key: 'settings',
                                label: (
                                    <span className="text-white/90 font-medium">
                                        <SettingOutlined /> 高级设置
                                    </span>
                                ),
                                children: (
                                    <Row gutter={[24, 16]}>
                                        <Col xs={12} md={8}>
                                            <Form.Item
                                                name="published"
                                                label={<span className="text-white/95 font-medium">发布状态</span>}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren="已发布" unCheckedChildren="草稿" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={8}>
                                            <Form.Item
                                                name="featured"
                                                label={<span className="text-white/95 font-medium">推荐页面</span>}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren="推荐" unCheckedChildren="普通" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={8}>
                                            <Form.Item
                                                name="showInMenu"
                                                label={<span className="text-white/95 font-medium">显示在菜单</span>}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="menuTitle"
                                                label={<span className="text-white/95 font-medium">菜单标题</span>}
                                            >
                                                <Input placeholder="在导航菜单中显示的标题" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Item
                                                name="menuOrder"
                                                label={<span className="text-white/95 font-medium">菜单排序</span>}
                                            >
                                                <Input type="number" placeholder="0" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Item
                                                name="sortOrder"
                                                label={<span className="text-white/95 font-medium">页面排序</span>}
                                            >
                                                <Input type="number" placeholder="0" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} md={8}>
                                            <Form.Item
                                                name="commentsEnabled"
                                                label={<span className="text-white/95 font-medium">启用评论</span>}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="redirectUrl"
                                                label={<span className="text-white/95 font-medium">重定向URL</span>}
                                            >
                                                <Input placeholder="仅重定向页面需要填写" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="redirectType"
                                                label={<span className="text-white/95 font-medium">重定向类型</span>}
                                            >
                                                <Select>
                                                    <Option value={301}>301 永久重定向</Option>
                                                    <Option value={302}>302 临时重定向</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            }
                        ]}
                    />
                </Form>
                </ConfigProvider>
            </Card>
        </div>
    );
};

export default CustomPageEditor;