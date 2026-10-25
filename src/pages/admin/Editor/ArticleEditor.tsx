// src/pages/admin/Editor/ArticleEditor.tsx
import React, { useState, useEffect } from 'react';
import { Input, Button, Form, Row, Col, Card, Select, Switch, message, Spin, ConfigProvider, Progress } from 'antd';
import { SaveOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createArticle, updateArticle, fetchArticleById, clearCurrentArticle } from '@/store/slices/articleSlice';
import { CoverImageSelector } from '@/components/Editor/CoverImageSelector';
import { useUpload } from '@/hooks/api/useUpload';
import * as adminTagService from '@/services/adminTagService';
import { ArticleVisibility, ArticleStatus } from '@/constants/article';
import type { ArticleCreateRequest, ArticleUpdateRequest } from '@/types/article';
import type { FileWithPreview } from '@/components/Upload/ImageUploader';
import MarkdownEditor from '@/components/Editor/MarkdownEditor';
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";
import { elevatedGlassCardStyle } from '@/constants/styles';

const { Option } = Select;

const ArticleEditor: React.FC = () => {

    const { id: articleId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentArticle, loading } = useAppSelector((state) => state.article);
    const { uploadFile } = useUpload();
    const [form] = Form.useForm();
    const [tags, setTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingFileName, setUploadingFileName] = useState('');

    const [pendingCoverFile, setPendingCoverFile] = useState<FileWithPreview | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string>('');

    const isEditing = !!articleId;
    const titleText = isEditing && currentArticle
        ? currentArticle.title
        : '新建文章';

    usePageTitle(titleText);
    useEffect(() => {
        adminTagService.getAdminTags({ size: 1000 }).then(res => {
            if (res.success) setTags(res.data.content.map(t => t.name));
        });

        if (isEditing) {
            dispatch(fetchArticleById(articleId));
        }

        return () => { dispatch(clearCurrentArticle()); };
    }, [articleId, dispatch, isEditing]);

    useEffect(() => {
        if (isEditing && currentArticle) {
            const existingCoverUrl = currentArticle.coverImage || '';
            setCoverImageUrl(existingCoverUrl);
            setPendingCoverFile(null);

            form.setFieldsValue({
                ...currentArticle,
                tags: currentArticle.tags?.map(t => t.name) || [],
            });
        }
    }, [currentArticle, form, isEditing]);

    const handleCoverImageChange = (file: FileWithPreview | null, url: string) => {
        setPendingCoverFile(file);

        if (file && file.preview) {
            setCoverImageUrl(file.preview);
        } else if (url) {
            setCoverImageUrl(url);
        } else if (!file && !url) {
            setCoverImageUrl('');
        }
    };

    const uploadCoverImage = async (): Promise<string> => {
        if (!pendingCoverFile) {
            return coverImageUrl;
        }

        if (!pendingCoverFile || !(pendingCoverFile instanceof File)) {
            const hasFileProps = pendingCoverFile &&
                typeof (pendingCoverFile as any).name === 'string' &&
                typeof (pendingCoverFile as any).size === 'number' &&
                typeof (pendingCoverFile as any).type === 'string';

            if (!hasFileProps) {
                message.error('封面文件格式错误');
                return coverImageUrl;
            }
        }

        setUploadingFileName((pendingCoverFile as any).name);
        setUploadProgress(0);

        try {
            const uploadedUrl = await uploadFile(pendingCoverFile as File, 'image', {
                onProgress: (percent: number) => {
                    setUploadProgress(percent);
                }
            });

            if ((pendingCoverFile as any).preview?.startsWith('blob:')) {
                URL.revokeObjectURL((pendingCoverFile as any).preview);
            }

            return uploadedUrl || '';
        } catch (error: any) {
            message.error(`封面图片上传失败: ${error.message}`);
            throw error;
        }
    };

    const onFinish = async (values: ArticleCreateRequest & ArticleUpdateRequest) => {
        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            let finalCoverImageUrl = '';

            if (pendingCoverFile && pendingCoverFile instanceof File) {
                finalCoverImageUrl = await uploadCoverImage();
            } else if (!pendingCoverFile && coverImageUrl && !coverImageUrl.startsWith('data:')) {
                finalCoverImageUrl = coverImageUrl;
            }

            const submitData = {
                ...values,
                coverImage: finalCoverImageUrl
            };

            const action = isEditing
                ? dispatch(updateArticle({ id: articleId!, data: submitData }))
                : dispatch(createArticle(submitData));

            const result = await action.unwrap();

            setPendingCoverFile(null);
            setCoverImageUrl(finalCoverImageUrl);

            message.success(`文章${isEditing ? '更新' : '创建'}成功！`);

            if (!isEditing && result.id) {
                navigate(`/admin/editor/${result.id}`);
            } else if (isEditing) {
                dispatch(fetchArticleById(articleId));
            }
        } catch (error: any) {
            message.error(error.message || '操作失败');
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
            setUploadingFileName('');
        }
    };

    const labelStyle: React.CSSProperties = {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 500,
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    };

    const cardStyle: React.CSSProperties = elevatedGlassCardStyle;

    const glassTheme = {
        token: {
            colorText: 'rgba(255, 255, 255, 0.85)',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
            colorTextQuaternary: 'rgba(255, 255, 255, 0.7)',
            colorBgElevated: 'rgba(50, 50, 50, 0.85)',
            borderRadius: 8,
        },
        components: {
            Input: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
                colorText: 'rgba(255, 255, 255, 0.9)',
            },
            Select: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
                controlItemBgHover: 'rgba(255, 255, 255, 0.1)',
                controlItemBgActive: 'rgba(255, 255, 255, 0.15)',
                colorFillSecondary: 'rgba(255, 255, 255, 0.2)',
                colorText: 'rgba(255, 255, 255, 0.9)',
            },
            Switch: {
                colorPrimary: '#36d1dc',
                colorPrimaryHover: '#5b86e5',
            }
        },
    };

    const pageLoading = isEditing && loading && !currentArticle;
    if (pageLoading) return <Spin tip="加载文章数据..." size="large" />;

    const hasUnsavedFiles = !!pendingCoverFile;

    return (
        <div style={{ minHeight: '100vh', padding: '24px', background: 'transparent' }}>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{
                visibility: ArticleVisibility.PUBLIC,
                commentsEnabled: true,
                status: ArticleStatus.DRAFT
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: 24
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <h1 style={{
                            color: 'white',
                            fontSize: 'clamp(20px, 5vw, 28px)',
                            margin: 0,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                        }}>
                            {isEditing ? '编辑文章' : '撰写新文章'}
                        </h1>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={isSubmitting}
                            style={{
                                background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                                border: 'none',
                                height: '40px',
                                padding: '0 24px',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(54, 209, 220, 0.4)'
                            }}
                        >
                            {isSubmitting ? '处理中...' : (isEditing ? '更新文章' : '保存文章')}
                        </Button>
                    </div>
                    {hasUnsavedFiles && (
                        <div style={{
                            background: 'rgba(255, 193, 7, 0.15)',
                            border: '1px solid rgba(255, 193, 7, 0.4)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: 'rgba(255, 193, 7, 0.9)',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <CloudUploadOutlined />
                            封面图片待上传
                        </div>
                    )}
                </div>

                {isSubmitting && uploadProgress > 0 && (
                    <Card
                        style={{
                            ...cardStyle,
                            marginBottom: 24
                        }}
                        styles={{
                            body: {
                                padding: '16px',
                                background: 'transparent'
                            }
                        }}
                    >
                        <div style={{ textAlign: 'center', color: 'white' }}>
                            <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                                正在上传封面图片: <strong>{uploadingFileName}</strong>
                            </div>
                            <Progress
                                percent={Math.round(uploadProgress)}
                                status="active"
                                strokeColor={{ '0%': '#36d1dc', '100%': '#5b86e5' }}
                                style={{ maxWidth: '400px', margin: '0 auto' }}
                            />
                        </div>
                    </Card>
                )}

                <Row gutter={24}>
                    <Col xs={24} lg={18}>
                        <Card
                            style={cardStyle}
                            styles={{
                                body: {
                                    padding: '24px',
                                    background: 'transparent'
                                }
                            }}
                            bordered={false}
                        >
                            <ConfigProvider theme={glassTheme}>
                                <Form.Item name="title" rules={[{ required: true, message: '请输入文章标题' }]}>
                                    <Input
                                        placeholder="文章标题..."
                                        variant="borderless"
                                        disabled={isSubmitting}
                                        style={{
                                            fontSize: '24px',
                                            color: 'rgba(255, 255, 255, 0.95)',
                                            background: 'transparent',
                                            padding: 0,
                                            fontWeight: 500
                                        }}
                                    />
                                </Form.Item>
                            </ConfigProvider>
                            <Form.Item name="content" rules={[{ required: true, message: '请输入文章内容' }]}>
                                <MarkdownEditor
                                    value={form.getFieldValue('content')}
                                    onChange={(md) => form.setFieldsValue({ content: md })}
                                    disabled={isSubmitting}
                                />
                            </Form.Item>
                        </Card>
                    </Col>
                    <Col xs={24} lg={6}>
                        <Card
                            title={<span style={labelStyle}>发布设置</span>}
                            style={{ ...cardStyle, marginBottom: 24 }}
                            styles={{
                                header: {
                                    background: 'rgba(54, 209, 220, 0.1)',
                                    borderBottom: '1px solid rgba(54, 209, 220, 0.2)',
                                    borderRadius: '16px 16px 0 0'
                                },
                                body: {
                                    background: 'transparent'
                                }
                            }}
                        >
                            <ConfigProvider theme={glassTheme}>
                                <Form.Item name="status" label={<span style={labelStyle}>状态</span>}>
                                    <Select disabled={isSubmitting}>
                                        <Option value={ArticleStatus.DRAFT}>草稿</Option>
                                        <Option value={ArticleStatus.PUBLISHED}>发布</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="visibility" label={<span style={labelStyle}>可见性</span>}>
                                    <Select disabled={isSubmitting}>
                                        <Option value={ArticleVisibility.PUBLIC}>公开</Option>
                                        <Option value={ArticleVisibility.LOGIN_REQUIRED}>登录可见</Option>
                                        <Option value={ArticleVisibility.ADMIN_ONLY}>仅管理员</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="slug" label={<span style={labelStyle}>路径标识</span>}>
                                    <Input placeholder="留空则自动生成" disabled={isSubmitting} />
                                </Form.Item>
                                <Form.Item name="tags" label={<span style={labelStyle}>标签</span>}>
                                    <Select
                                        mode="tags"
                                        placeholder="添加标签"
                                        tokenSeparators={[',']}
                                        options={tags.map(tag => ({ value: tag }))}
                                        disabled={isSubmitting}
                                    />
                                </Form.Item>
                                <Form.Item name="commentsEnabled" valuePropName="checked">
                                    <Switch
                                        checkedChildren="开启评论"
                                        unCheckedChildren="关闭评论"
                                        disabled={isSubmitting}
                                    />
                                </Form.Item>
                                <Form.Item name="pinned" valuePropName="checked">
                                    <Switch
                                        checkedChildren="设为置顶"
                                        unCheckedChildren="普通文章"
                                        disabled={isSubmitting}
                                    />
                                </Form.Item>
                            </ConfigProvider>
                        </Card>
                        <Card
                            title={<span style={labelStyle}>封面图</span>}
                            style={cardStyle}
                            styles={{
                                header: {
                                    background: 'rgba(54, 209, 220, 0.1)',
                                    borderBottom: '1px solid rgba(54, 209, 220, 0.2)',
                                    borderRadius: '16px 16px 0 0'
                                },
                                body: {
                                    background: 'transparent'
                                }
                            }}
                        >
                            <Form.Item name="coverImage">
                                <CoverImageSelector
                                    value={coverImageUrl}
                                    onChange={handleCoverImageChange}
                                    disabled={isSubmitting}
                                    mode="delayed"
                                />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default ArticleEditor;
