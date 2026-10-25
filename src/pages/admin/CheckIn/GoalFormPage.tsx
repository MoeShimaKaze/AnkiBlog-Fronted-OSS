import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Form,
    Input,
    Select,
    InputNumber,
    DatePicker,
    Button,
    Space,
    message,
    Divider,
    Row,
    Col,
    Popover,
    ConfigProvider,
    ColorPicker,
    Switch,
    Tooltip
} from 'antd';
import {
    ArrowLeftOutlined,
    PlusOutlined,
    DeleteOutlined,
    InfoCircleOutlined,
    ShoppingOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import type {
    GoalCategory,
    GoalCreateRequest,
    GoalUpdateRequest,
    MilestoneRequest,
    Milestone
} from '@/types/checkIn';
import {
    GOAL_TYPE_CONFIG,
    REPEAT_TYPE_CONFIG,
    MILESTONE_CONDITION_CONFIG,
    GOAL_ICONS
} from '@/types/checkIn';
import {
    createGoal,
    updateGoal,
    getGoalDetail,
    getGoalCategories
} from '@/services/checkInService';
import { getProducts } from '@/services/products';
import { getArticles } from '@/services/articles';

// 玻璃态主题配置
const glassTheme = {
    token: {
        colorText: 'rgba(255, 255, 255, 0.9)',
        colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
        colorBgElevated: 'rgba(35, 35, 45, 0.85)',
        borderRadius: 8,
    },
    components: {
        Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            activeBorderColor: '#1890ff',
        },
        Select: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            optionSelectedBg: 'rgba(255, 255, 255, 0.2)',
        },
        InputNumber: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
        },
        DatePicker: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
        },
        Form: {
            labelColor: 'rgba(255, 255, 255, 0.85)',
        },
        Divider: {
            colorSplit: 'rgba(255, 255, 255, 0.15)',
            colorText: 'rgba(255, 255, 255, 0.85)',
        },
        Card: {
            colorBgContainer: 'rgba(255, 255, 255, 0.08)',
            colorBorderSecondary: 'rgba(255, 255, 255, 0.1)',
        },
    },
};

const GoalFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<GoalCategory[]>([]);
    const [goalType, setGoalType] = useState<'DAILY' | 'ACCUMULATE'>('DAILY');
    const [milestones, setMilestones] = useState<MilestoneRequest[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<string>('🎯');
    const [selectedColor, setSelectedColor] = useState<string>('#1890ff');
    const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([]);
    const [articleOptions, setArticleOptions] = useState<{ value: string; label: string }[]>([]);

    const isEdit = !!id;

    const fetchCategories = useCallback(async () => {
        try {
            const res = await getGoalCategories();
            if (res.success) {
                setCategories(res.data || []);
            }
        } catch (error) {
            console.error('加载分类失败', error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await getProducts({ page: 0, size: 100, sort: 'createdAt,desc' });
            if (res.success && res.data?.content) {
                setProductOptions(res.data.content.map((p: any) => ({
                    value: p.id,
                    label: p.name
                })));
            }
        } catch (error) {
            console.error('加载商品列表失败', error);
        }
    }, []);

    const fetchArticles = useCallback(async () => {
        try {
            const res = await getArticles({
                page: 0,
                size: 100,
                _sortArray: ['pinned,desc', 'publishedAt,desc']
            });
            if (res.success && res.data?.content) {
                setArticleOptions(res.data.content.map((a: any) => ({
                    value: a.id,
                    label: a.title
                })));
            }
        } catch (error) {
            console.error('加载文章列表失败', error);
        }
    }, []);

    const fetchGoalDetail = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await getGoalDetail(id);
            if (res.success) {
                const goal = res.data;
                form.setFieldsValue({
                    name: goal.name,
                    description: goal.description,
                    categoryId: goal.categoryId,
                    goalType: goal.goalType,
                    targetValue: goal.targetValue,
                    targetUnit: goal.targetUnit,
                    stepValue: goal.stepValue,
                    repeatType: goal.repeatType,
                    startDate: goal.startDate ? dayjs(goal.startDate) : undefined,
                    endDate: goal.endDate ? dayjs(goal.endDate) : undefined,
                    encouragement: goal.encouragement,
                    isPublic: goal.isPublic !== false
                });
                setSelectedIcon(goal.icon || '🎯');
                setSelectedColor(goal.color || '#1890ff');
                setGoalType(goal.goalType);
                if (goal.milestones) {
                    setMilestones(goal.milestones.map((m: Milestone) => ({
                        name: m.name,
                        description: m.description,
                        icon: m.icon,
                        conditionType: m.conditionType,
                        conditionValue: m.conditionValue
                    })));
                }
            }
        } catch (error) {
            message.error('加载目标详情失败');
        } finally {
            setLoading(false);
        }
    }, [id, form]);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        fetchArticles();
        if (isEdit) {
            fetchGoalDetail();
        }
    }, [fetchCategories, fetchProducts, fetchArticles, fetchGoalDetail, isEdit]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const data: GoalCreateRequest | GoalUpdateRequest = {
                name: values.name,
                description: values.description,
                icon: selectedIcon,
                color: selectedColor,
                categoryId: values.categoryId,
                goalType: values.goalType,
                targetValue: values.targetValue,
                targetUnit: values.targetUnit,
                stepValue: values.stepValue || 0.5,
                repeatType: values.repeatType,
                startDate: values.startDate?.format('YYYY-MM-DD'),
                endDate: values.endDate?.format('YYYY-MM-DD'),
                encouragement: values.encouragement,
                isPublic: values.isPublic !== false,
                milestones: isEdit ? undefined : milestones
            };

            let res;
            if (isEdit) {
                res = await updateGoal(id!, data);
            } else {
                res = await createGoal(data as GoalCreateRequest);
            }

            if (res.success) {
                message.success(isEdit ? '更新成功' : '创建成功');
                navigate('/admin/check-in');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    const addMilestone = () => {
        setMilestones([
            ...milestones,
            {
                name: '',
                conditionType: 'TOTAL_DAYS',
                conditionValue: 7
            }
        ]);
    };

    const updateMilestone = (index: number, field: string, value: any) => {
        const newMilestones = [...milestones];
        (newMilestones[index] as any)[field] = value;
        setMilestones(newMilestones);
    };

    const removeMilestone = (index: number) => {
        setMilestones(milestones.filter((_, i) => i !== index));
    };

    const renderIconSelector = () => (
        <div className="grid grid-cols-8 gap-2 p-2" style={{ maxWidth: 320 }}>
            {GOAL_ICONS.map((icon) => (
                <button
                    type="button"
                    key={icon}
                    className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg cursor-pointer transition-all border-2 ${
                        selectedIcon === icon
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-transparent bg-white/10 hover:bg-white/20'
                    }`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedIcon(icon);
                    }}
                >
                    {icon}
                </button>
            ))}
        </div>
    );

    return (
        <ConfigProvider theme={glassTheme}>
            <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
                <div className="flex justify-between items-center mb-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/check-in')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
                        }}
                    >
                        返回
                    </Button>
                    <h1 className="text-white text-xl font-bold m-0">{isEdit ? '编辑目标' : '新建目标'}</h1>
                    <div style={{ width: 80 }} />
                </div>

                <Card
                    loading={loading}
                    className="glass-effect border-0"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            goalType: 'DAILY',
                            repeatType: 'DAILY',
                            stepValue: 0.5,
                            startDate: dayjs()
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label="图标和颜色">
                                    <Space size="large">
                                        <Popover content={renderIconSelector()} trigger="click" placement="bottom">
                                            <Button
                                                className="flex items-center gap-2"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                    color: 'rgba(255, 255, 255, 0.8)',
                                                }}
                                            >
                                                <span className="text-xl">{selectedIcon}</span>
                                                选择图标
                                            </Button>
                                        </Popover>
                                        <ColorPicker
                                            value={selectedColor}
                                            onChange={(color) => setSelectedColor(color.toHexString())}
                                            showText
                                        />
                                    </Space>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    name="name"
                                    label="目标名称"
                                    rules={[{ required: true, message: '请输入目标名称' }]}
                                >
                                    <Input placeholder="如：每日健身、加班30小时" maxLength={100} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="categoryId" label="分类">
                                    <Select
                                        placeholder="选择分类"
                                        allowClear
                                        options={categories.map(c => ({
                                            value: c.id,
                                            label: `${c.icon || ''} ${c.name}`
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="description" label="描述">
                            <Input.TextArea rows={2} placeholder="目标描述（可选）" maxLength={500} />
                        </Form.Item>

                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>打卡设置</span>
                        </Divider>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="goalType"
                                    label="打卡类型"
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        onChange={(value) => setGoalType(value)}
                                        options={Object.entries(GOAL_TYPE_CONFIG).map(([key, config]) => ({
                                            value: key,
                                            label: config.label
                                        }))}
                                    />
                                </Form.Item>
                            </Col>

                            {goalType === 'ACCUMULATE' && (
                                <>
                                    <Col span={8}>
                                        <Form.Item
                                            name="targetValue"
                                            label="目标值"
                                            rules={[{ required: true, message: '请输入目标值' }]}
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={1}
                                                placeholder="如：30"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="targetUnit" label="单位">
                                            <Input placeholder="如：小时、页、公里" maxLength={20} />
                                        </Form.Item>
                                    </Col>
                                </>
                            )}
                        </Row>

                        {goalType === 'ACCUMULATE' && (
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name="stepValue" label="步进值">
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={0.5}
                                            step={0.5}
                                            precision={1}
                                            placeholder="0.5"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="repeatType" label="重复周期">
                                    <Select
                                        options={Object.entries(REPEAT_TYPE_CONFIG).map(([key, config]) => ({
                                            value: key,
                                            label: config.label
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="startDate" label="开始日期">
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="endDate" label="结束日期">
                                    <DatePicker style={{ width: '100%' }} placeholder="可选" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="encouragement" label="鼓励语">
                            <Input placeholder="给自己加油打气的话" maxLength={200} />
                        </Form.Item>

                        <Form.Item
                            name="isPublic"
                            label="公开展示"
                            valuePropName="checked"
                            initialValue={true}
                            tooltip="开启后，该目标将在公开的打卡进度页面展示"
                        >
                            <Switch
                                checkedChildren="公开"
                                unCheckedChildren="私密"
                            />
                        </Form.Item>

                        {!isEdit && (
                            <>
                                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>里程碑</span>
                                </Divider>
                                <div className="flex flex-col gap-3">
                                    {milestones.map((milestone, index) => (
                                        <Card
                                            key={index}
                                            size="small"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)'
                                            }}
                                        >
                                            <Row gutter={8} align="middle">
                                                <Col span={6}>
                                                    <Input
                                                        placeholder="里程碑名称"
                                                        value={milestone.name}
                                                        onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <Select
                                                        style={{ width: '100%' }}
                                                        value={milestone.conditionType}
                                                        onChange={(value) => updateMilestone(index, 'conditionType', value)}
                                                        options={Object.entries(MILESTONE_CONDITION_CONFIG).map(([key, config]) => ({
                                                            value: key,
                                                            label: config.label
                                                        }))}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        placeholder="条件值"
                                                        min={1}
                                                        value={milestone.conditionValue}
                                                        onChange={(value) => updateMilestone(index, 'conditionValue', value)}
                                                    />
                                                </Col>
                                                <Col span={6}>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => removeMilestone(index)}
                                                    />
                                                </Col>
                                            </Row>
                                            {/* 二期功能：关联商品和文章 */}
                                            <Row gutter={8} align="middle" style={{ marginTop: 8 }}>
                                                <Col span={12}>
                                                    <Space style={{ width: '100%' }}>
                                                        <Tooltip title="解锁里程碑后展示关联的商品推荐">
                                                            <ShoppingOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />
                                                        </Tooltip>
                                                        <Select
                                                            size="small"
                                                            style={{ width: 150 }}
                                                            placeholder="关联商品（可选）"
                                                            allowClear
                                                            showSearch
                                                            optionFilterProp="label"
                                                            value={milestone.linkedProductId}
                                                            onChange={(value) => updateMilestone(index, 'linkedProductId', value)}
                                                            options={productOptions}
                                                        />
                                                    </Space>
                                                </Col>
                                                <Col span={12}>
                                                    <Space style={{ width: '100%' }}>
                                                        <Tooltip title="解锁里程碑后展示关联的文章">
                                                            <FileTextOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />
                                                        </Tooltip>
                                                        <Select
                                                            size="small"
                                                            style={{ width: 150 }}
                                                            placeholder="关联文章（可选）"
                                                            allowClear
                                                            showSearch
                                                            optionFilterProp="label"
                                                            value={milestone.linkedArticleId}
                                                            onChange={(value) => updateMilestone(index, 'linkedArticleId', value)}
                                                            options={articleOptions}
                                                        />
                                                    </Space>
                                                </Col>
                                            </Row>
                                            {/* 二期功能：自动创建文章选项 */}
                                            <Row gutter={8} align="middle" style={{ marginTop: 8 }}>
                                                <Col span={12}>
                                                    <Space>
                                                        <Switch
                                                            size="small"
                                                            checked={milestone.autoCreateArticle}
                                                            onChange={(checked) => updateMilestone(index, 'autoCreateArticle', checked)}
                                                        />
                                                        <span className="text-white/70 text-sm">
                                                            解锁时自动创建文章
                                                            <Tooltip title="达成里程碑时自动生成一篇打卡记录文章">
                                                                <InfoCircleOutlined style={{ marginLeft: 4, color: 'rgba(255,255,255,0.5)' }} />
                                                            </Tooltip>
                                                        </span>
                                                    </Space>
                                                </Col>
                                                {milestone.autoCreateArticle && (
                                                    <Col span={12}>
                                                        <Space>
                                                            <span className="text-white/70 text-sm">发布状态:</span>
                                                            <Select
                                                                size="small"
                                                                style={{ width: 100 }}
                                                                value={milestone.articleVisibility || 'DRAFT'}
                                                                onChange={(value) => updateMilestone(index, 'articleVisibility', value)}
                                                                options={[
                                                                    { value: 'DRAFT', label: '草稿' },
                                                                    { value: 'PUBLISHED', label: '发布' }
                                                                ]}
                                                            />
                                                        </Space>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Card>
                                    ))}
                                    <Button
                                        type="dashed"
                                        block
                                        icon={<PlusOutlined />}
                                        onClick={addMilestone}
                                        style={{
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            background: 'transparent'
                                        }}
                                    >
                                        添加里程碑
                                    </Button>
                                </div>
                            </>
                        )}

                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }} />

                        <Form.Item>
                            <Space>
                                <Button type="primary" loading={loading} onClick={handleSubmit}>
                                    {isEdit ? '保存修改' : '创建目标'}
                                </Button>
                                <Button
                                    onClick={() => navigate('/admin/check-in')}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                    }}
                                >
                                    取消
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default GoalFormPage;
