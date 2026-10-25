/**
 * 待办详情面板组件
 */
import React, { useState, useEffect } from 'react';
import {
    Input,
    Button,
    Checkbox,
    DatePicker,
    Select,
    Popconfirm,
    Divider,
    message
} from 'antd';
import {
    CloseOutlined,
    SunOutlined,
    StarOutlined,
    StarFilled,
    CalendarOutlined,
    PlusOutlined,
    DeleteOutlined,
    LinkOutlined
} from '@ant-design/icons';
import type { TodoItem, TodoStep } from '@/types/todo';
import { PRIORITY_CONFIG } from '@/types/todo';
import * as todoService from '@/services/todoService';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface TodoDetailPanelProps {
    item: TodoItem;
    onClose: () => void;
    onUpdate: (id: string, data: any) => void;
    onToggleComplete: (item: TodoItem) => void;
    onToggleImportant: (item: TodoItem) => void;
    onToggleMyDay: (item: TodoItem) => void;
    onDelete: (id: string) => void;
}

const TodoDetailPanel: React.FC<TodoDetailPanelProps> = ({
    item,
    onClose,
    onUpdate,
    onToggleComplete,
    onToggleImportant,
    onToggleMyDay,
    onDelete,
}) => {
    const [title, setTitle] = useState(item.title);
    const [note, setNote] = useState(item.note || '');
    const [newStepTitle, setNewStepTitle] = useState('');
    const [steps, setSteps] = useState<TodoStep[]>(item.steps || []);

    // 同步item变化
    useEffect(() => {
        setTitle(item.title);
        setNote(item.note || '');
        setSteps(item.steps || []);
    }, [item]);

    // 保存标题
    const handleSaveTitle = () => {
        if (title.trim() && title !== item.title) {
            onUpdate(item.id, { title: title.trim() });
        }
    };

    // 保存备注
    const handleSaveNote = () => {
        if (note !== item.note) {
            onUpdate(item.id, { note });
        }
    };

    // 添加步骤
    const handleAddStep = async () => {
        if (!newStepTitle.trim()) return;
        try {
            const response = await todoService.addTodoStep(item.id, { title: newStepTitle.trim() });
            if (response.success) {
                setSteps([...steps, response.data]);
                setNewStepTitle('');
            }
        } catch (error) {
            message.error('添加步骤失败');
        }
    };

    // 切换步骤完成状态
    const handleToggleStep = async (stepId: string) => {
        try {
            const response = await todoService.toggleTodoStep(stepId);
            if (response.success) {
                setSteps(steps.map(s => s.id === stepId ? response.data : s));
            }
        } catch (error) {
            message.error('更新步骤失败');
        }
    };

    // 删除步骤
    const handleDeleteStep = async (stepId: string) => {
        try {
            await todoService.deleteTodoStep(stepId);
            setSteps(steps.filter(s => s.id !== stepId));
        } catch (error) {
            message.error('删除步骤失败');
        }
    };

    return (
        <div className="todo-detail-panel">
            {/* 头部 */}
            <div className="todo-detail-header">
                <Checkbox
                    checked={item.isCompleted}
                    onChange={() => onToggleComplete(item)}
                />
                <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
            </div>

            {/* 内容 */}
            <div className="todo-detail-content">
                {/* 标题 */}
                <div className="todo-detail-section">
                    <Input
                        className="todo-detail-title-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onPressEnter={handleSaveTitle}
                        maxLength={200}
                        style={{
                            textDecoration: item.isCompleted ? 'line-through' : 'none',
                            color: item.isCompleted ? 'rgba(255, 255, 255, 0.5)' : 'white'
                        }}
                    />
                </div>

                {/* 快捷操作 */}
                <div className="todo-detail-section">
                    <Button
                        type={item.isMyDay ? 'primary' : 'default'}
                        ghost={item.isMyDay}
                        icon={<SunOutlined />}
                        onClick={() => onToggleMyDay(item)}
                        style={{ marginRight: 8 }}
                    >
                        {item.isMyDay ? '已添加到我的一天' : '添加到我的一天'}
                    </Button>
                    <Button
                        type="text"
                        icon={item.isImportant ? <StarFilled style={{ color: '#eb2f96' }} /> : <StarOutlined />}
                        onClick={() => onToggleImportant(item)}
                    >
                        {item.isImportant ? '取消重要' : '标记为重要'}
                    </Button>
                </div>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* 步骤 */}
                <div className="todo-detail-section">
                    <div className="todo-detail-section-title">步骤</div>
                    <div className="todo-step-list">
                        {steps.map(step => (
                            <div key={step.id} className="todo-step-item">
                                <Checkbox
                                    className="todo-step-checkbox"
                                    checked={step.isCompleted}
                                    onChange={() => handleToggleStep(step.id)}
                                />
                                <span className={`todo-step-title ${step.isCompleted ? 'completed' : ''}`}>
                                    {step.title}
                                </span>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteStep(step.id)}
                                    style={{ opacity: 0.5 }}
                                />
                            </div>
                        ))}
                        <div className="todo-step-add">
                            <Input
                                placeholder="添加步骤"
                                prefix={<PlusOutlined />}
                                value={newStepTitle}
                                onChange={(e) => setNewStepTitle(e.target.value)}
                                onPressEnter={handleAddStep}
                                bordered={false}
                                maxLength={200}
                            />
                        </div>
                    </div>
                </div>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* 截止日期 */}
                <div className="todo-detail-section">
                    <div className="todo-detail-section-title">截止日期</div>
                    <DatePicker
                        value={item.dueDate ? dayjs(item.dueDate) : null}
                        onChange={(date) => onUpdate(item.id, { dueDate: date?.format('YYYY-MM-DD') || null })}
                        placeholder="设置截止日期"
                        style={{ width: '100%' }}
                        suffixIcon={<CalendarOutlined />}
                    />
                </div>

                {/* 优先级 */}
                <div className="todo-detail-section">
                    <div className="todo-detail-section-title">优先级</div>
                    <Select
                        value={item.priority}
                        onChange={(value) => onUpdate(item.id, { priority: value })}
                        style={{ width: '100%' }}
                        options={Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({
                            value: key,
                            label: (
                                <span style={{ color: config.color }}>
                                    {config.label}
                                </span>
                            )
                        }))}
                    />
                </div>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* 备注 */}
                <div className="todo-detail-section">
                    <div className="todo-detail-section-title">备注</div>
                    <TextArea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onBlur={handleSaveNote}
                        placeholder="添加备注..."
                        autoSize={{ minRows: 3, maxRows: 8 }}
                        style={{ resize: 'none' }}
                    />
                </div>

                {/* 文章关联 */}
                {item.articleLinkType !== 'NONE' && (
                    <>
                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <div className="todo-detail-section">
                            <div className="todo-detail-section-title">
                                <LinkOutlined /> 文章关联
                            </div>
                            {item.articleLinkType === 'REMIND' && item.articleId && (
                                <div style={{ color: '#60a5fa' }}>
                                    关联文章: {item.articleTitle || item.articleId}
                                </div>
                            )}
                            {item.articleLinkType === 'PLAN' && item.plannedArticleTitle && (
                                <div>
                                    <div style={{ color: '#4ade80' }}>
                                        计划创建文章: {item.plannedArticleTitle}
                                    </div>
                                    {item.createdArticleId && (
                                        <div style={{ marginTop: 8, color: '#60a5fa' }}>
                                            已创建文章 ID: {item.createdArticleId}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* 底部 */}
            <div className="todo-detail-footer">
                <span>创建于 {dayjs(item.createdAt).format('M月D日')}</span>
                <Popconfirm
                    title="确定删除此待办？"
                    onConfirm={() => onDelete(item.id)}
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                        删除
                    </Button>
                </Popconfirm>
            </div>
        </div>
    );
};

export default TodoDetailPanel;
