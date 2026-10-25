/**
 * 待办项列表组件
 */
import React, { useState } from 'react';
import { Input, Checkbox, Button, Empty } from 'antd';
import {
    PlusOutlined,
    StarOutlined,
    StarFilled,
    SunOutlined,
    CalendarOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import type { TodoItem, TodoViewType } from '@/types/todo';
import dayjs from 'dayjs';

interface TodoItemListProps {
    items: TodoItem[];
    title: string;
    viewType: TodoViewType;
    selectedItem: TodoItem | null;
    onSelectItem: (item: TodoItem) => void;
    onCreateItem: (title: string) => void;
    onToggleComplete: (item: TodoItem) => void;
    onToggleImportant: (item: TodoItem) => void;
    onToggleMyDay: (item: TodoItem) => void;
    onDeleteItem: (id: string) => void;
}

const TodoItemList: React.FC<TodoItemListProps> = ({
    items,
    title,
    viewType,
    selectedItem,
    onSelectItem,
    onCreateItem,
    onToggleComplete,
    onToggleImportant,
                                                       onDeleteItem,
}) => {
    const [newItemTitle, setNewItemTitle] = useState('');

    // 创建新待办
    const handleCreate = () => {
        if (newItemTitle.trim()) {
            onCreateItem(newItemTitle.trim());
            setNewItemTitle('');
        }
    };

    // 获取日期显示文本
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = dayjs(dateStr);
        const today = dayjs().startOf('day');
        const tomorrow = today.add(1, 'day');

        if (date.isSame(today, 'day')) return '今天';
        if (date.isSame(tomorrow, 'day')) return '明天';
        if (date.isBefore(today)) return date.format('M月D日') + ' (已过期)';
        return date.format('M月D日');
    };

    // 未完成的待办项
    const activeItems = items.filter(item => !item.isCompleted);
    // 已完成的待办项
    const completedItems = items.filter(item => item.isCompleted);

    return (
        <div className="todo-item-list">
            {/* 头部 */}
            <div className="todo-item-list-header">
                <h1 className="todo-item-list-title">{title}</h1>
                {viewType === 'my-day' && (
                    <div className="todo-item-list-date">
                        {dayjs().format('M月D日，dddd')}
                    </div>
                )}
            </div>

            {/* 待办项列表 */}
            <div className="todo-item-list-content">
                {activeItems.length === 0 && completedItems.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            viewType === 'my-day'
                                ? '今天还没有任务，添加一个吧'
                                : '暂无待办事项'
                        }
                    />
                ) : (
                    <>
                        {/* 未完成列表 */}
                        {activeItems.map(item => (
                            <div
                                key={item.id}
                                className={`todo-item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                                onClick={() => onSelectItem(item)}
                            >
                                <Checkbox
                                    className="todo-item-checkbox"
                                    checked={item.isCompleted}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onToggleComplete(item);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="todo-item-content">
                                    <div className="todo-item-title">{item.title}</div>
                                    <div className="todo-item-meta">
                                        {item.listName && (
                                            <span className="todo-item-meta-item">
                                                {item.listName}
                                            </span>
                                        )}
                                        {item.isMyDay && viewType !== 'my-day' && (
                                            <span className="todo-item-meta-item">
                                                <SunOutlined /> 我的一天
                                            </span>
                                        )}
                                        {item.dueDate && (
                                            <span className={`todo-item-meta-item ${item.isOverdue ? 'overdue' : ''}`}>
                                                <CalendarOutlined /> {formatDate(item.dueDate)}
                                            </span>
                                        )}
                                        {item.totalStepsCount > 0 && (
                                            <span className="todo-item-meta-item">
                                                {item.completedStepsCount}/{item.totalStepsCount} 步骤
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="todo-item-actions">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={item.isImportant ? <StarFilled style={{ color: '#eb2f96' }} /> : <StarOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleImportant(item);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* 已完成列表 */}
                        {completedItems.length > 0 && viewType !== 'completed' && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', padding: '8px 0', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                    已完成 ({completedItems.length})
                                </div>
                                {completedItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={`todo-item-card completed ${selectedItem?.id === item.id ? 'selected' : ''}`}
                                        onClick={() => onSelectItem(item)}
                                    >
                                        <Checkbox
                                            className="todo-item-checkbox"
                                            checked={item.isCompleted}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onToggleComplete(item);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="todo-item-content">
                                            <div className="todo-item-title">{item.title}</div>
                                        </div>
                                        <div className="todo-item-actions">
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteItem(item.id);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 仅已完成视图 */}
                        {viewType === 'completed' && completedItems.map(item => (
                            <div
                                key={item.id}
                                className={`todo-item-card completed ${selectedItem?.id === item.id ? 'selected' : ''}`}
                                onClick={() => onSelectItem(item)}
                            >
                                <Checkbox
                                    className="todo-item-checkbox"
                                    checked={item.isCompleted}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onToggleComplete(item);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="todo-item-content">
                                    <div className="todo-item-title">{item.title}</div>
                                    <div className="todo-item-meta">
                                        {item.completedAt && (
                                            <span className="todo-item-meta-item">
                                                完成于 {dayjs(item.completedAt).format('M月D日 HH:mm')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="todo-item-actions">
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteItem(item.id);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* 底部输入框 */}
            {viewType !== 'completed' && (
                <div className="todo-item-list-input">
                    <Input
                        className="todo-add-input"
                        placeholder="添加任务"
                        prefix={<PlusOutlined style={{ color: '#1890ff' }} />}
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        onPressEnter={handleCreate}
                        maxLength={200}
                    />
                </div>
            )}
        </div>
    );
};

export default TodoItemList;
