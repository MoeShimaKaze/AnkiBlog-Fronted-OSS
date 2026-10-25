/**
 * 待办清单侧边栏组件
 */
import React, { useState } from 'react';
import { Input, Button, Modal, Popconfirm } from 'antd';
import {
    SunOutlined,
    StarOutlined,
    CalendarOutlined,
    UnorderedListOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    DeleteOutlined,
    FolderOutlined
} from '@ant-design/icons';
import type { TodoList, TodoStats, TodoViewType, SystemListType } from '@/types/todo';

interface TodoSidebarProps {
    lists: TodoList[];
    stats: TodoStats | null;
    currentView: TodoViewType;
    currentListId: string | null;
    onViewChange: (viewType: TodoViewType, listId?: string) => void;
    onCreateList: (name: string) => void;
    onDeleteList: (id: string) => void;
}

const SYSTEM_VIEWS: { type: TodoViewType; systemType?: SystemListType; name: string; icon: React.ReactNode; color: string }[] = [
    { type: 'my-day', systemType: 'MY_DAY', name: '我的一天', icon: <SunOutlined />, color: '#f5a623' },
    { type: 'important', systemType: 'IMPORTANT', name: '重要', icon: <StarOutlined />, color: '#eb2f96' },
    { type: 'planned', systemType: 'PLANNED', name: '计划内', icon: <CalendarOutlined />, color: '#52c41a' },
    { type: 'all', systemType: 'ALL', name: '所有任务', icon: <UnorderedListOutlined />, color: '#1890ff' },
    { type: 'completed', name: '已完成', icon: <CheckCircleOutlined />, color: '#8c8c8c' },
];

const TodoSidebar: React.FC<TodoSidebarProps> = ({
    lists,
    stats,
    currentView,
    currentListId,
    onViewChange,
    onCreateList,
    onDeleteList,
}) => {
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [newListName, setNewListName] = useState('');

    // 获取视图对应的数量
    const getViewCount = (viewType: TodoViewType): number => {
        if (!stats) return 0;
        switch (viewType) {
            case 'my-day':
                return stats.myDayCount;
            case 'important':
                return stats.importantCount;
            case 'planned':
                return stats.plannedCount;
            case 'all':
                return stats.activeTodoCount;
            case 'completed':
                return stats.completedTodoCount;
            default:
                return 0;
        }
    };

    // 处理创建列表
    const handleCreateList = () => {
        if (newListName.trim()) {
            onCreateList(newListName.trim());
            setNewListName('');
            setCreateModalVisible(false);
        }
    };

    // 自定义列表
    const customLists = lists.filter(l => l.listType === 'CUSTOM');

    return (
        <div className="todo-sidebar">
            {/* 系统视图 */}
            <div className="todo-sidebar-menu">
                {SYSTEM_VIEWS.map(view => (
                    <div
                        key={view.type}
                        className={`todo-sidebar-item ${currentView === view.type && !currentListId ? 'active' : ''}`}
                        onClick={() => onViewChange(view.type)}
                    >
                        <div
                            className="todo-sidebar-item-icon"
                            style={{ background: `${view.color}20`, color: view.color }}
                        >
                            {view.icon}
                        </div>
                        <div className="todo-sidebar-item-content">
                            <span className="todo-sidebar-item-name">{view.name}</span>
                            {getViewCount(view.type) > 0 && (
                                <span className="todo-sidebar-item-count">{getViewCount(view.type)}</span>
                            )}
                        </div>
                    </div>
                ))}

                {/* 分隔线 */}
                {customLists.length > 0 && <div className="todo-sidebar-divider" />}

                {/* 自定义列表 */}
                {customLists.map(list => (
                    <div
                        key={list.id}
                        className={`todo-sidebar-item ${currentView === 'list' && currentListId === list.id ? 'active' : ''}`}
                        onClick={() => onViewChange('list', list.id)}
                    >
                        <div
                            className="todo-sidebar-item-icon"
                            style={{
                                background: list.color ? `${list.color}20` : 'rgba(0,0,0,0.04)',
                                color: list.color || '#595959'
                            }}
                        >
                            <FolderOutlined />
                        </div>
                        <div className="todo-sidebar-item-content">
                            <span className="todo-sidebar-item-name">{list.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {list.activeItemCount > 0 && (
                                    <span className="todo-sidebar-item-count">{list.activeItemCount}</span>
                                )}
                                <Popconfirm
                                    title="确定删除此列表？"
                                    description="列表中的待办项将被移除列表归属"
                                    onConfirm={(e) => {
                                        e?.stopPropagation();
                                        onDeleteList(list.id);
                                    }}
                                    onCancel={(e) => e?.stopPropagation()}
                                    okText="删除"
                                    cancelText="取消"
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ opacity: 0.5 }}
                                    />
                                </Popconfirm>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 底部新建列表按钮 */}
            <div className="todo-sidebar-footer">
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    block
                    onClick={() => setCreateModalVisible(true)}
                >
                    新建列表
                </Button>
            </div>

            {/* 创建列表弹窗 */}
            <Modal
                title="新建列表"
                open={createModalVisible}
                onOk={handleCreateList}
                onCancel={() => {
                    setCreateModalVisible(false);
                    setNewListName('');
                }}
                okText="创建"
                cancelText="取消"
            >
                <Input
                    placeholder="输入列表名称"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onPressEnter={handleCreateList}
                    maxLength={50}
                    autoFocus
                />
            </Modal>
        </div>
    );
};

export default TodoSidebar;
