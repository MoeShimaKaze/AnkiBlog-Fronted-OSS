import React, { useState, useEffect } from 'react';
import {
    Input, Button, Form, Row, Col, Card, Select, Switch,
    InputNumber, message, Spin, TreeSelect, ConfigProvider,
    Progress
} from 'antd';
import { SaveOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createProduct, updateProduct, fetchProductById, clearCurrentProduct } from '@/store/slices/productSlice';
import ImageUploader, { FileWithPreview } from '@/components/Upload/ImageUploader';
import { useUpload } from '@/hooks/api/useUpload';
import * as adminCategoryService from '@/services/adminProductCategoryService';
import * as adminTagService from '@/services/adminTagService';
import type { ProductCreateRequest, ProductUpdateRequest } from '@/types/product';
import type { AdminCategoryListItem } from '@/services/adminProductCategoryService';
import {usePageTitle} from "@/hooks/business/usePageTitle.ts";

const { Option } = Select;

const ProductEditor: React.FC = () => {

    const { id: productId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentProduct, loading } = useAppSelector((state) => state.product);
    const { uploadFile } = useUpload();
    const [form] = Form.useForm();
    const [tags, setTags] = useState<string[]>([]);
    const [categories, setCategories] = useState<AdminCategoryListItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingFileName, setUploadingFileName] = useState('');

    const [pendingFiles, setPendingFiles] = useState<FileWithPreview[]>([]);
    const [existingUrls, setExistingUrls] = useState<string[]>([]);
    const [enableCropMode, setEnableCropMode] = useState(false);

    const isEditing = !!productId;

    /**
     * 从复杂文本中提取URL
     * 支持从淘宝、天猫、京东、拼多多等平台的分享文本中提取链接
     */
    const extractUrlFromText = (text: string): string => {
        if (!text) return '';

        // 如果已经是纯URL，直接返回
        const trimmed = text.trim();
        if (/^https?:\/\/[^\s]+$/.test(trimmed)) {
            return trimmed;
        }

        // 匹配 URL 的正则表达式
        // 支持 http:// 和 https://，匹配到空格、中文字符或字符串结束
        const urlRegex = /https?:\/\/[^\s\u4e00-\u9fa5「」【】《》""'']+/gi;
        const matches = text.match(urlRegex);

        if (matches && matches.length > 0) {
            // 返回第一个匹配的URL，并清理末尾可能的标点符号
            let url = matches[0];
            // 清理末尾的常见标点
            url = url.replace(/[,，。.!！?？;；:：)）\]】}>」』"']+$/, '');
            return url;
        }

        return text.trim();
    };

    /**
     * 处理购买链接输入变化，自动提取URL
     */
    const handlePurchaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const extractedUrl = extractUrlFromText(inputValue);

        // 如果提取出的URL与输入不同，说明进行了提取
        if (extractedUrl !== inputValue && extractedUrl.startsWith('http')) {
            form.setFieldsValue({ purchaseUrl: extractedUrl });
            message.success('已自动提取链接');
        }
    };

    // 替换当前的usePageTitle调用
    const titleText = isEditing && currentProduct
        ? currentProduct.name
        : '新建商品';

    usePageTitle(titleText);

    const transformCategoryData = (data: AdminCategoryListItem[]): any[] => {
        return data.map(item => ({
            title: item.name,
            value: item.id,
            key: item.id,
            children: item.children ? transformCategoryData(item.children) : undefined
        }));
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [tagsRes, categoriesRes] = await Promise.all([
                    adminTagService.getAdminTags({ size: 1000 }),
                    adminCategoryService.getCategoryTree()
                ]);
                if (tagsRes.success) {
                    const tagNames = tagsRes.data.content.map(t => t.name);
                    console.log('加载的标签数据:', tagNames); // 调试日志
                    setTags(tagNames);
                }
                if (categoriesRes.success) setCategories(categoriesRes.data);
            } catch (error) {
                console.error('加载基础数据失败:', error);
            }
        };

        loadData();

        if (isEditing) {
            dispatch(fetchProductById(productId));
        }

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [productId, dispatch, isEditing]);

    useEffect(() => {
        if (isEditing && currentProduct) {
            console.log('当前商品数据:', currentProduct);

            const allImages = [currentProduct.mainImage, ...(currentProduct.images || [])].filter(Boolean) as string[];
            setExistingUrls(allImages);
            setPendingFiles([]);

            // 关键修复：正确映射API响应字段到表单字段
            const formValues = {
                ...currentProduct,
                // 修复分类字段映射 - 只使用category.id
                categoryId: currentProduct.category?.id,
                // 确保tags字段正确
                tags: Array.isArray(currentProduct.tags) ? currentProduct.tags : [],
                // 确保isPurchased字段正确映射
                isPurchased: currentProduct.isPurchased || false,
            };

            console.log('设置到表单的值:', formValues);
            console.log('分类ID:', formValues.categoryId);
            console.log('标签:', formValues.tags);

            form.setFieldsValue(formValues);
            form.validateFields(['images']);
        }
    }, [currentProduct, form, isEditing]);

    const handleImagesChange = (files: FileWithPreview[], urls: string[]) => {
        setPendingFiles(files);
        setExistingUrls(urls);
        form.validateFields(['images']);
    };

    const uploadPendingFiles = async (): Promise<string[]> => {
        if (pendingFiles.length === 0) return [];
        const uploadedUrls: string[] = [];
        const totalFiles = pendingFiles.length;

        for (let i = 0; i < totalFiles; i++) {
            const file = pendingFiles[i];
            setUploadingFileName(file.name);
            const baseProgress = (i / totalFiles) * 100;
            try {
                const url = await uploadFile(file, 'image', {
                    onProgress: (percent: number) => setUploadProgress(baseProgress + (percent / totalFiles))
                });
                if (url) {
                    uploadedUrls.push(url);
                } else {
                    message.error(`${file.name} 上传后未获取到URL`);
                }
            } catch (error: any) {
                message.error(`${file.name} 上传失败: ${error.message}`);
            }
        }
        return uploadedUrls;
    };

    const onFinish = async (values: any) => {
        console.log('表单提交的原始值:', values); // 调试日志
        console.log('提交的tags值:', values.tags); // 重点查看tags

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            const newUploadedUrls = await uploadPendingFiles();
            pendingFiles.forEach(file => {
                if (file.preview?.startsWith('blob:')) URL.revokeObjectURL(file.preview);
            });

            const allImageUrls = [...existingUrls, ...newUploadedUrls];
            const { images, publishImmediately, ...restValues } = values;

            // 确保tags字段被正确包含
            const payload = {
                ...restValues,
                tags: Array.isArray(values.tags) ? values.tags : [], // 确保tags是数组
                mainImage: allImageUrls[0] || '',
                images: allImageUrls.slice(1),
                status: publishImmediately ? 'ACTIVE' : (values.status || 'DRAFT'),
            };

            console.log('最终提交的payload:', payload); // 调试日志
            console.log('payload中的tags:', payload.tags); // 重点查看tags

            const action = isEditing
                ? dispatch(updateProduct({ id: productId!, data: payload as ProductUpdateRequest }))
                : dispatch(createProduct(payload as ProductCreateRequest));
            const result = await action.unwrap();

            // 清除状态
            setPendingFiles([]);
            setExistingUrls(allImageUrls); // 直接使用最新的图片数组
            message.success(`商品${isEditing ? '更新' : '创建'}成功！`);

            if (!isEditing && result.id) {
                navigate(`/admin/products/edit/${result.id}`);
            }

        } catch (error: any) {
            console.error('提交失败:', error);
            message.error(error.message || `商品${isEditing ? '更新' : '创建'}失败`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelStyle: React.CSSProperties = {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 500,
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    };

    const glassTheme = {
        token: {
            colorText: 'rgba(255, 255, 255, 0.9)',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
            colorTextQuaternary: 'rgba(255, 255, 255, 0.7)',
            colorBgElevated: 'rgba(35, 35, 45, 0.85)',
            borderRadius: 8,
            controlItemBgHover: 'rgba(255, 255, 255, 0.1)',
            controlItemBgActive: 'rgba(255, 255, 255, 0.2)',
        },
        components: {
            Input: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)'
            },
            InputNumber: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)'
            },
            Select: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
                optionSelectedBg: 'rgba(255, 255, 255, 0.2)',
                optionSelectedColor: 'rgba(255, 255, 255, 1)',
                optionSelectedFontWeight: '600',
                colorFillSecondary: 'rgba(255, 255, 255, 0.2)',
            },
            TreeSelect: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
                optionSelectedBg: 'rgba(255, 255, 255, 0.2)',
                optionSelectedColor: 'rgba(255, 255, 255, 1)',
            },
        },
    };

    const pageLoading = isEditing && loading && !currentProduct;
    if (pageLoading) {
        return <Spin tip="加载商品数据..." size="large" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
    }

    const hasUnsavedFiles = pendingFiles.length > 0;

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'DRAFT', featured: false, publishImmediately: false, tags: [], isPurchased: false }} >
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
                        {isEditing ? '编辑商品' : '添加新商品'}
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
                        {isSubmitting ? '处理中...' : (isEditing ? '更新商品' : '保存商品')}
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
                        {pendingFiles.length} 张图片待上传
                    </div>
                )}
            </div>

            {isSubmitting && uploadProgress > 0 && (
                <Card style={{ marginBottom: 24, background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }} bodyStyle={{ padding: '16px' }} className="glass-effect" >
                    <div style={{ textAlign: 'center', color: 'white' }}>
                        <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                            正在上传图片: <strong>{uploadingFileName}</strong>
                        </div>
                        <Progress percent={Math.round(uploadProgress)} status="active" strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} style={{ maxWidth: '400px', margin: '0 auto' }} />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                            正在处理第 {Math.floor(uploadProgress / 100 * pendingFiles.length) + 1} 张，共 {pendingFiles.length} 张图片
                        </div>
                    </div>
                </Card>
            )}

            <ConfigProvider theme={glassTheme}>
                <Row gutter={24}>
                    <Col xs={24} lg={18}>
                        <Card title={<span style={labelStyle}>基本信息</span>} className="glass-effect" style={{ marginBottom: 24 }}>
                            <Form.Item name="name" label={<span style={labelStyle}>商品名称</span>} rules={[{ required: true, message: '请输入商品名称' }]}>
                                <Input placeholder="请输入商品名称" disabled={isSubmitting} showCount maxLength={200} />
                            </Form.Item>
                            <Form.Item name="summary" label={<span style={labelStyle}>商品简短描述</span>} rules={[{ required: true, message: '请输入商品简短描述' }]}>
                                <Input.TextArea rows={3} placeholder="请输入商品的亮点、核心卖点等" disabled={isSubmitting} showCount maxLength={300} />
                            </Form.Item>
                            <Form.Item name="description" label={<span style={labelStyle}>商品详细描述</span>}>
                                <Input.TextArea rows={6} placeholder="请输入商品详细规格、故事背景等" disabled={isSubmitting} showCount maxLength={1000} />
                            </Form.Item>
                        </Card>

                        <Card title={<span style={labelStyle}>商品图片</span>} className="glass-effect">
                            <Form.Item style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={labelStyle}>上传图片 (拖拽可排序，第一张为封面)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ ...labelStyle, fontSize: '12px' }}>启用裁剪功能</span>
                                        <Switch
                                            size="small"
                                            checked={enableCropMode}
                                            onChange={setEnableCropMode}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 }}>
                                    {enableCropMode ? '开启后只能单张上传并支持裁剪' : '关闭后支持批量选择多张图片'}
                                </div>
                            </Form.Item>
                            <Form.Item>
                                <ImageUploader
                                    value={existingUrls}
                                    onChange={handleImagesChange}
                                    multiple={!enableCropMode}
                                    maxCount={8}
                                    enableCrop={enableCropMode}
                                    cropAspectRatio={1}
                                    enableDragSort={true}
                                    showPreview={true}
                                    uploadMode="delayed"
                                    disabled={isSubmitting}
                                />
                            </Form.Item>
                            <Form.Item name="images" hidden rules={[{ validator: async () => {
                                    if (existingUrls.length === 0 && pendingFiles.length === 0) {
                                        return Promise.reject(new Error('请至少上传一张商品图片'));
                                    }
                                    return Promise.resolve();
                                }}]}>
                                <Input />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={6}>
                        <Card title={<span style={labelStyle}>销售与分类</span>} className="glass-effect" style={{ marginBottom: 24 }}>
                            <Form.Item name="status" label={<span style={labelStyle}>状态</span>} rules={[{ required: true }]}>
                                <Select disabled={isSubmitting}>
                                    <Option value="DRAFT">草稿</Option>
                                    <Option value="ACTIVE">上架</Option>
                                    <Option value="OUT_OF_STOCK">缺货</Option>
                                    <Option value="DISCONTINUED">下架</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="publishImmediately" valuePropName="checked">
                                <Switch checkedChildren="立即上架" unCheckedChildren="保存草稿" disabled={isSubmitting} onChange={(checked) => form.setFieldsValue({ status: checked ? 'ACTIVE' : 'DRAFT' })} />
                            </Form.Item>
                            <Form.Item name="price" label={<span style={labelStyle}>价格</span>} rules={[{ required: true, type: 'number', min: 0.01 }]}>
                                <InputNumber prefix="¥" style={{ width: '100%' }} precision={2} disabled={isSubmitting} />
                            </Form.Item>
                            <Form.Item name="originalPrice" label={<span style={labelStyle}>原价 (选填)</span>}>
                                <InputNumber prefix="¥" style={{ width: '100%' }} precision={2} disabled={isSubmitting} />
                            </Form.Item>
                            <Form.Item name="purchaseUrl" label={<span style={labelStyle}>购买链接</span>} rules={[{ type: 'url', message: '请输入有效的URL' }]} extra={<span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>支持直接粘贴淘宝/天猫/京东等平台的分享文本，自动提取链接</span>}>
                                <Input placeholder="粘贴分享文本或输入链接..." disabled={isSubmitting} onBlur={handlePurchaseUrlChange} />
                            </Form.Item>
                        </Card>
                        <Card title={<span style={labelStyle}>组织</span>} className="glass-effect" >
                            <Form.Item name="categoryId" label={<span style={labelStyle}>商品分类</span>} rules={[{ required: true }]}>
                                <TreeSelect treeData={transformCategoryData(categories)} placeholder="选择分类" treeDefaultExpandAll disabled={isSubmitting} loading={categories.length === 0} />
                            </Form.Item>
                            <Form.Item
                                name="tags"
                                label={<span style={labelStyle}>标签</span>}
                                // 添加额外的表单项属性来确保正确处理
                                getValueFromEvent={(value) => {
                                    console.log('标签选择事件:', value); // 调试日志
                                    return Array.isArray(value) ? value : [];
                                }}
                            >
                                <Select
                                    mode="tags"
                                    placeholder="添加标签"
                                    options={tags.map(t => ({ value: t, label: t }))}
                                    disabled={isSubmitting}
                                    // 添加调试事件
                                    onChange={(value) => {
                                        console.log('标签变更:', value);
                                    }}
                                    onSelect={(value) => {
                                        console.log('标签选中:', value);
                                    }}
                                    onDeselect={(value) => {
                                        console.log('标签取消选中:', value);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item name="featured" valuePropName="checked">
                                <Switch checkedChildren="设为推荐" unCheckedChildren="普通商品" disabled={isSubmitting} />
                            </Form.Item>
                            <Form.Item name="isPurchased" valuePropName="checked" label={<span style={labelStyle}>衣橱管理</span>}>
                                <Switch checkedChildren="已购买" unCheckedChildren="未购买" disabled={isSubmitting} />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </ConfigProvider>
        </Form>
    );
};

export default ProductEditor;