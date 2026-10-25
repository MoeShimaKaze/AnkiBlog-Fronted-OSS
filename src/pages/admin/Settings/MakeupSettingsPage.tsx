/**
 * 化妆品模块设置页面
 * 配置化妆品分类、使用类型、闲置阈值等
 */
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Input, InputNumber, Switch, TreeSelect, message, Spin, Empty, Tag, Popconfirm, Modal, Form, Space } from 'antd';
import {
    SettingOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    DragOutlined,
    FolderOutlined,
    ClockCircleOutlined,
    TagsOutlined
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import { usePageTitle } from '@/hooks/business/usePageTitle';
import type { MakeupSettings, MakeupUsageType, MakeupUsageTypeRequest } from '@/types/makeup';
import * as makeupSettingsService from '@/services/makeupSettingsService';
import * as makeupUsageTypeService from '@/services/makeupUsageTypeService';
import * as adminCategoryService from '@/services/adminProductCategoryService';
import type { AdminCategoryListItem } from '@/services/adminProductCategoryService';
import { glassCardStyle } from '@/constants/styles';

// 可拖动的使用类型项
const DraggableUsageTypeItem: React.FC<{
    type: MakeupUsageType;
    index: number;
    onEdit: (type: MakeupUsageType) => void;
    onDelete: (id: string) => void;
}> = ({ type, index, onEdit, onDelete }) => {
    return (
        <Draggable draggableId={type.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                        ...provided.draggableProps.style,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: snapshot.isDragging ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        opacity: snapshot.isDragging ? 0.8 : 1,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div {...provided.dragHandleProps}>
                            <DragOutlined style={{ cursor: 'grab', color: 'rgba(255, 255, 255, 0.5)' }} />
                        </div>
                        {type.color && (
                            <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '4px',
                                background: type.color,
                            }} />
                        )}
                        <span style={{ color: 'white', fontWeight: 500 }}>{type.name}</span>
                        {type.usageCount !== undefined && type.usageCount > 0 && (
                            <Tag color="blue" style={{ marginLeft: '8px' }}>
                                使用 {type.usageCount} 次
                            </Tag>
                        )}
                    </div>
                    <Space>
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(type)}
                            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        />
                        <Popconfirm
                            title="确定删除此使用类型吗？"
                            onConfirm={() => onDelete(type.id)}
                            okText="删除"
                            cancelText="取消"
                        >
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                                disabled={type.usageCount !== undefined && type.usageCount > 0}
                            />
                        </Popconfirm>
                    </Space>
                </div>
            )}
        </Draggable>
    );
};

const MakeupSettingsPage: React.FC = () => {
    usePageTitle('化妆品设置', { siteName: 'AnkiBlog', siteTagline: 'Anki的歇脚处' });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [usageTypes, setUsageTypes] = useState<MakeupUsageType[]>([]);
    const [categories, setCategories] = useState<AdminCategoryListItem[]>([]);

    // 表单状态
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [idleThresholdDays, setIdleThresholdDays] = useState<number>(30);
    const [expiryReminderEnabled, setExpiryReminderEnabled] = useState<boolean>(true);
    const [expiryReminderDays, setExpiryReminderDays] = useState<number>(30);

    // 使用类型编辑弹窗
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [editingType, setEditingType] = useState<MakeupUsageType | null>(null);
    const [typeForm] = Form.useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [settingsRes, typesRes, categoriesRes] = await Promise.all([
                makeupSettingsService.getMakeupSettings(),
                makeupUsageTypeService.getAllUsageTypes(true),
                adminCategoryService.getCategoryTree()
            ]);

            if (settingsRes.success && settingsRes.data) {
                const settings: MakeupSettings = settingsRes.data;
                setSelectedCategoryIds(settings.categoryIds || []);
                setIdleThresholdDays(settings.idleThresholdDays || 30);
                setExpiryReminderEnabled(settings.expiryReminderEnabled ?? true);
                setExpiryReminderDays(settings.expiryReminderDays || 30);
            }

            if (typesRes.success) {
                setUsageTypes(typesRes.data || []);
            }

            if (categoriesRes.success) {
                setCategories(categoriesRes.data || []);
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const res = await makeupSettingsService.updateMakeupSettings({
                categoryIds: selectedCategoryIds,
                idleThresholdDays,
                expiryReminderEnabled,
                expiryReminderDays
            });

            if (res.success) {
                message.success('设置保存成功');
            } else {
                message.error('设置保存失败');
            }
        } catch (error) {
            console.error('保存设置失败:', error);
            message.error('保存设置失败');
        } finally {
            setSaving(false);
        }
    };

    const handleAddType = () => {
        setEditingType(null);
        typeForm.resetFields();
        setTypeModalVisible(true);
    };

    const handleEditType = (type: MakeupUsageType) => {
        setEditingType(type);
        typeForm.setFieldsValue({
            name: type.name,
            color: type.color || '#1890ff'
        });
        setTypeModalVisible(true);
    };

    const handleDeleteType = async (id: string) => {
        try {
            const res = await makeupUsageTypeService.deleteUsageType(id);
            if (res.success) {
                message.success('删除成功');
                setUsageTypes(prev => prev.filter(t => t.id !== id));
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '删除失败');
        }
    };

    const handleTypeModalOk = async () => {
        try {
            const values = await typeForm.validateFields();
            const data: MakeupUsageTypeRequest = {
                name: values.name,
                color: values.color
            };

            if (editingType) {
                const res = await makeupUsageTypeService.updateUsageType(editingType.id, data);
                if (res.success) {
                    message.success('更新成功');
                    setUsageTypes(prev => prev.map(t => t.id === editingType.id ? res.data : t));
                }
            } else {
                const res = await makeupUsageTypeService.createUsageType(data);
                if (res.success) {
                    message.success('创建成功');
                    setUsageTypes(prev => [...prev, res.data]);
                }
            }
            setTypeModalVisible(false);
        } catch (error: any) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            }
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;

        if (sourceIndex === destIndex) return;

        const newTypes = Array.from(usageTypes);
        const [removed] = newTypes.splice(sourceIndex, 1);
        newTypes.splice(destIndex, 0, removed);
        setUsageTypes(newTypes);

        // 保存排序
        try {
            await makeupUsageTypeService.updateSortOrders({
                orderedIds: newTypes.map(t => t.id)
            });
        } catch (error) {
            console.error('保存排序失败:', error);
        }
    };

    const handleInitDefaults = async () => {
        try {
            await makeupUsageTypeService.initDefaultUsageTypes();
            message.success('默认类型初始化成功');
            const typesRes = await makeupUsageTypeService.getAllUsageTypes(true);
            if (typesRes.success) {
                setUsageTypes(typesRes.data || []);
            }
        } catch (error) {
            message.error('初始化失败');
        }
    };

    const transformCategoryData = (data: AdminCategoryListItem[]): any[] => {
        return data.map(item => ({
            title: item.name,
            value: item.id,
            key: item.id,
            children: item.children ? transformCategoryData(item.children) : undefined
        }));
    };

    return (
        <Spin spinning={loading}>
            <div style={{ padding: '16px', minHeight: '100vh' }}>
                {/* 页面标题 */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{
                        color: 'white',
                        fontSize: 'clamp(20px, 5vw, 28px)',
                        fontWeight: 'bold',
                        margin: 0,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}>
                        <SettingOutlined style={{ marginRight: '12px' }} />
                        化妆品模块设置
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 0 0', fontSize: '14px' }}>
                        配置化妆品分类范围、使用类型和提醒阈值
                    </p>
                </div>

                <Row gutter={[16, 16]}>
                    {/* 基础设置 */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={<span style={{ color: 'white' }}><FolderOutlined style={{ marginRight: '8px' }} />分类与阈值设置</span>}
                            style={glassCardStyle}
                            extra={
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSaveSettings}
                                    loading={saving}
                                >
                                    保存设置
                                </Button>
                            }
                        >
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ marginBottom: '8px', color: 'rgba(255, 255, 255, 0.9)' }}>
                                    <FolderOutlined style={{ marginRight: '8px' }} />
                                    化妆品分类范围
                                </div>
                                <TreeSelect
                                    treeData={transformCategoryData(categories)}
                                    value={selectedCategoryIds}
                                    onChange={setSelectedCategoryIds}
                                    placeholder="选择化妆品所属分类"
                                    treeDefaultExpandAll
                                    multiple
                                    allowClear
                                    treeCheckable
                                    showCheckedStrategy={TreeSelect.SHOW_PARENT}
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                />
                                <div style={{ marginTop: '4px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                                    选择的分类及其子分类下的商品将被视为化妆品
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ marginBottom: '8px', color: 'rgba(255, 255, 255, 0.9)' }}>
                                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                    闲置提醒阈值
                                </div>
                                <InputNumber
                                    value={idleThresholdDays}
                                    onChange={(value) => setIdleThresholdDays(value || 30)}
                                    min={1}
                                    max={365}
                                    addonAfter="天"
                                    style={{ width: '200px' }}
                                />
                                <div style={{ marginTop: '4px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                                    超过该天数未使用的化妆品将被标记为闲置
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                        <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                        过期提醒
                                    </span>
                                    <Switch
                                        checked={expiryReminderEnabled}
                                        onChange={setExpiryReminderEnabled}
                                    />
                                </div>
                                {expiryReminderEnabled && (
                                    <InputNumber
                                        value={expiryReminderDays}
                                        onChange={(value) => setExpiryReminderDays(value || 30)}
                                        min={1}
                                        max={365}
                                        addonBefore="提前"
                                        addonAfter="天提醒"
                                        style={{ width: '250px' }}
                                    />
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* 使用类型管理 */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={<span style={{ color: 'white' }}><TagsOutlined style={{ marginRight: '8px' }} />使用类型管理</span>}
                            style={glassCardStyle}
                            extra={
                                <Space>
                                    {usageTypes.length === 0 && (
                                        <Button onClick={handleInitDefaults}>
                                            初始化默认
                                        </Button>
                                    )}
                                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddType}>
                                        添加类型
                                    </Button>
                                </Space>
                            }
                        >
                            {usageTypes.length > 0 ? (
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="usageTypes">
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {usageTypes.map((type, index) => (
                                                    <DraggableUsageTypeItem
                                                        key={type.id}
                                                        type={type}
                                                        index={index}
                                                        onEdit={handleEditType}
                                                        onDelete={handleDeleteType}
                                                    />
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            ) : (
                                <Empty
                                    description={<span style={{ color: 'rgba(255,255,255,0.6)' }}>暂无使用类型，点击"初始化默认"或"添加类型"</span>}
                                />
                            )}
                            <div style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                                拖拽调整顺序，使用类型用于分类化妆品用途（如：底妆、眼妆、唇妆等）
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* 使用类型编辑弹窗 */}
                <Modal
                    title={editingType ? '编辑使用类型' : '添加使用类型'}
                    open={typeModalVisible}
                    onOk={handleTypeModalOk}
                    onCancel={() => setTypeModalVisible(false)}
                    okText={editingType ? '保存' : '创建'}
                >
                    <Form form={typeForm} layout="vertical">
                        <Form.Item
                            name="name"
                            label="类型名称"
                            rules={[{ required: true, message: '请输入类型名称' }]}
                        >
                            <Input placeholder="如：底妆、眼妆、唇妆" />
                        </Form.Item>
                        <Form.Item name="color" label="标识颜色">
                            <Input type="color" style={{ width: '100px', height: '36px' }} />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Spin>
    );
};

export default MakeupSettingsPage;
