/**
 * 待办清单管理页面
 * 仿照Microsoft To Do的UI设计
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message, Spin, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import TodoSidebar from '@/components/Todo/TodoSidebar';
import TodoItemList from '@/components/Todo/TodoItemList';
import TodoDetailPanel from '@/components/Todo/TodoDetailPanel';
import type { TodoList, TodoItem, TodoViewType, TodoStats } from '@/types/todo';
import * as todoService from '@/services/todoService';
import './TodoManagement.css';

const { Sider, Content } = Layout;

const TodoManagement: React.FC = () => {
    // 状态管理
    const [lists, setLists] = useState<TodoList[]>([]);
    const [items, setItems] = useState<TodoItem[]>([]);
    const [stats, setStats] = useState<TodoStats | null>(null);
    const [selectedItem, setSelectedItem] = useState<TodoItem | null>(null);
    const [currentView, setCurrentView] = useState<TodoViewType>('my-day');
    const [currentListId, setCurrentListId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);

    // 移动端状态
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sidebarDrawerVisible, setSidebarDrawerVisible] = useState(false);

    // 监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setSidebarDrawerVisible(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 加载列表数据
    const loadLists = useCallback(async () => {
        try {
            const response = await todoService.getTodoLists();
            if (response.success) {
                setLists(response.data || []);
            }
        } catch (error) {
            console.error('加载列表失败:', error);
        }
    }, []);

    // 加载统计数据
    const loadStats = useCallback(async () => {
        try {
            const response = await todoService.getTodoStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('加载统计失败:', error);
        }
    }, []);

    // 根据视图类型加载待办项
    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            switch (currentView) {
                case 'my-day':
                    response = await todoService.getMyDayItems();
                    break;
                case 'important':
                    response = await todoService.getImportantItems();
                    break;
                case 'planned':
                    response = await todoService.getPlannedItems();
                    break;
                case 'all':
                    response = await todoService.getAllActiveItems();
                    break;
                case 'completed':
                    const completedRes = await todoService.getCompletedItems({ size: 100 });
                    if (completedRes.success) {
                        setItems(completedRes.data?.content || []);
                    }
                    return;
                case 'list':
                    if (currentListId) {
                        const listRes = await todoService.getListItems(currentListId, { size: 100 });
                        if (listRes.success) {
                            setItems(listRes.data?.content || []);
                        }
                    }
                    return;
                default:
                    response = await todoService.getMyDayItems();
            }
            if (response?.success) {
                setItems(response.data || []);
            }
        } catch (error) {
            console.error('加载待办项失败:', error);
            message.error('加载待办项失败');
        } finally {
            setLoading(false);
        }
    }, [currentView, currentListId]);

    // 初始加载
    useEffect(() => {
        loadLists();
        loadStats();
    }, [loadLists, loadStats]);

    // 视图变化时重新加载
    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // 切换视图
    const handleViewChange = (viewType: TodoViewType, listId?: string) => {
        setCurrentView(viewType);
        setCurrentListId(listId || null);
        setSelectedItem(null);
        setDetailVisible(false);
        // 移动端切换视图后关闭侧边栏
        if (isMobile) {
            setSidebarDrawerVisible(false);
        }
    };

    // 选中待办项
    const handleSelectItem = (item: TodoItem) => {
        setSelectedItem(item);
        setDetailVisible(true);
    };

    // 创建待办项
    const handleCreateItem = async (title: string) => {
        try {
            const request: any = { title };

            // 根据当前视图设置默认属性
            if (currentView === 'my-day') {
                request.isMyDay = true;
            } else if (currentView === 'important') {
                request.isImportant = true;
            } else if (currentView === 'list' && currentListId) {
                request.listId = currentListId;
            }

            const response = await todoService.createTodoItem(request);
            if (response.success) {
                message.success('创建成功');
                loadItems();
                loadStats();
            }
        } catch (error) {
            console.error('创建待办项失败:', error);
            message.error('创建失败');
        }
    };

    // 更新待办项
    const handleUpdateItem = async (id: string, data: any) => {
        try {
            const response = await todoService.updateTodoItem(id, data);
            if (response.success) {
                loadItems();
                loadStats();
                if (selectedItem?.id === id) {
                    setSelectedItem(response.data);
                }
            }
        } catch (error) {
            console.error('更新待办项失败:', error);
            message.error('更新失败');
        }
    };

    // 切换完成状态
    const handleToggleComplete = async (item: TodoItem) => {
        try {
            const response = item.isCompleted
                ? await todoService.uncompleteTodoItem(item.id)
                : await todoService.completeTodoItem(item.id);
            if (response.success) {
                loadItems();
                loadStats();
                if (selectedItem?.id === item.id) {
                    setSelectedItem(response.data);
                }
            }
        } catch (error) {
            console.error('切换完成状态失败:', error);
        }
    };

    // 切换重要状态
    const handleToggleImportant = async (item: TodoItem) => {
        try {
            const response = await todoService.toggleTodoImportant(item.id);
            if (response.success) {
                loadItems();
                loadStats();
                if (selectedItem?.id === item.id) {
                    setSelectedItem(response.data);
                }
            }
        } catch (error) {
            console.error('切换重要状态失败:', error);
        }
    };

    // 切换"我的一天"状态
    const handleToggleMyDay = async (item: TodoItem) => {
        try {
            const response = await todoService.toggleTodoMyDay(item.id);
            if (response.success) {
                loadItems();
                loadStats();
                if (selectedItem?.id === item.id) {
                    setSelectedItem(response.data);
                }
            }
        } catch (error) {
            console.error('切换我的一天状态失败:', error);
        }
    };

    // 删除待办项
    const handleDeleteItem = async (id: string) => {
        try {
            const response = await todoService.deleteTodoItem(id);
            if (response.success) {
                message.success('删除成功');
                loadItems();
                loadStats();
                if (selectedItem?.id === id) {
                    setSelectedItem(null);
                    setDetailVisible(false);
                }
            }
        } catch (error) {
            console.error('删除待办项失败:', error);
            message.error('删除失败');
        }
    };

    // 创建列表
    const handleCreateList = async (name: string) => {
        try {
            const response = await todoService.createTodoList({ name });
            if (response.success) {
                message.success('列表创建成功');
                loadLists();
            }
        } catch (error) {
            console.error('创建列表失败:', error);
            message.error('创建列表失败');
        }
    };

    // 删除列表
    const handleDeleteList = async (id: string) => {
        try {
            const response = await todoService.deleteTodoList(id);
            if (response.success) {
                message.success('列表删除成功');
                loadLists();
                if (currentListId === id) {
                    handleViewChange('my-day');
                }
            }
        } catch (error) {
            console.error('删除列表失败:', error);
            message.error('删除列表失败');
        }
    };

    // 获取当前视图标题
    const getViewTitle = () => {
        switch (currentView) {
            case 'my-day':
                return '我的一天';
            case 'important':
                return '重要';
            case 'planned':
                return '计划内';
            case 'all':
                return '所有任务';
            case 'completed':
                return '已完成';
            case 'list':
                const list = lists.find(l => l.id === currentListId);
                return list?.name || '列表';
            default:
                return '待办事项';
        }
    };

    // 渲染侧边栏内容
    const renderSidebarContent = () => (
        <TodoSidebar
            lists={lists}
            stats={stats}
            currentView={currentView}
            currentListId={currentListId}
            onViewChange={handleViewChange}
            onCreateList={handleCreateList}
            onDeleteList={handleDeleteList}
        />
    );

    // 渲染详情面板内容
    const renderDetailContent = () => selectedItem && (
        <TodoDetailPanel
            item={selectedItem}
            onClose={() => {
                setDetailVisible(false);
                setSelectedItem(null);
            }}
            onUpdate={handleUpdateItem}
            onToggleComplete={handleToggleComplete}
            onToggleImportant={handleToggleImportant}
            onToggleMyDay={handleToggleMyDay}
            onDelete={handleDeleteItem}
        />
    );

    return (
        <Layout className="todo-management">
            {/* 移动端菜单按钮 */}
            {isMobile && (
                <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setSidebarDrawerVisible(true)}
                    className="todo-mobile-menu-btn"
                />
            )}

            {/* 桌面端侧边栏 */}
            {!isMobile && (
                <Sider
                    width={280}
                    className="todo-sidebar-container"
                    trigger={null}
                >
                    {renderSidebarContent()}
                </Sider>
            )}

            {/* 移动端侧边栏抽屉 */}
            <Drawer
                open={sidebarDrawerVisible}
                onClose={() => setSidebarDrawerVisible(false)}
                placement="left"
                width={280}
                closable={false}
                className="todo-mobile-drawer"
                styles={{
                    body: { padding: 0, background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(15px)' },
                    header: { display: 'none' }
                }}
            >
                {renderSidebarContent()}
            </Drawer>

            <Content className="todo-content">
                <Spin spinning={loading}>
                    <TodoItemList
                        items={items}
                        title={getViewTitle()}
                        viewType={currentView}
                        selectedItem={selectedItem}
                        onSelectItem={handleSelectItem}
                        onCreateItem={handleCreateItem}
                        onToggleComplete={handleToggleComplete}
                        onToggleImportant={handleToggleImportant}
                        onToggleMyDay={handleToggleMyDay}
                        onDeleteItem={handleDeleteItem}
                    />
                </Spin>
            </Content>

            {/* 桌面端详情面板 */}
            {!isMobile && detailVisible && selectedItem && (
                <Sider width={360} className="todo-detail-container">
                    {renderDetailContent()}
                </Sider>
            )}

            {/* 移动端详情抽屉 */}
            <Drawer
                open={isMobile && detailVisible && !!selectedItem}
                onClose={() => {
                    setDetailVisible(false);
                    setSelectedItem(null);
                }}
                placement="right"
                width="100%"
                closable={false}
                className="todo-mobile-drawer todo-detail-drawer"
                styles={{
                    body: { padding: 0, background: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(15px)' },
                    header: { display: 'none' }
                }}
            >
                {renderDetailContent()}
            </Drawer>
        </Layout>
    );
};

export default TodoManagement;
