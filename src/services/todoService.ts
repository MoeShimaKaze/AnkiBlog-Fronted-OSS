/**
 * 待办清单 API 服务
 */
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
    TodoList,
    TodoListCreateRequest,
    TodoListUpdateRequest,
    TodoItem,
    TodoItemCreateRequest,
    TodoItemUpdateRequest,
    TodoStep,
    TodoStepRequest,
    TodoStats
} from '@/types/todo';

// ==================== 管理员接口 - 列表操作 ====================

/**
 * 创建待办列表
 */
export const createTodoList = (data: TodoListCreateRequest): Promise<ApiResponse<TodoList>> => {
    return api.post('/admin/todos/lists', data);
};

/**
 * 获取所有待办列表
 */
export const getTodoLists = (): Promise<ApiResponse<TodoList[]>> => {
    return api.get('/admin/todos/lists');
};

/**
 * 获取列表详情
 */
export const getTodoListById = (id: string): Promise<ApiResponse<TodoList>> => {
    return api.get(`/admin/todos/lists/${id}`);
};

/**
 * 更新待办列表
 */
export const updateTodoList = (id: string, data: TodoListUpdateRequest): Promise<ApiResponse<TodoList>> => {
    return api.put(`/admin/todos/lists/${id}`, data);
};

/**
 * 删除待办列表
 */
export const deleteTodoList = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/todos/lists/${id}`);
};

// ==================== 管理员接口 - 待办项操作 ====================

/**
 * 创建待办项
 */
export const createTodoItem = (data: TodoItemCreateRequest): Promise<ApiResponse<TodoItem>> => {
    return api.post('/admin/todos/items', data);
};

/**
 * 获取待办项详情
 */
export const getTodoItemById = (id: string): Promise<ApiResponse<TodoItem>> => {
    return api.get(`/admin/todos/items/${id}`);
};

/**
 * 更新待办项
 */
export const updateTodoItem = (id: string, data: TodoItemUpdateRequest): Promise<ApiResponse<TodoItem>> => {
    return api.put(`/admin/todos/items/${id}`, data);
};

/**
 * 完成待办项
 */
export const completeTodoItem = (id: string): Promise<ApiResponse<TodoItem>> => {
    return api.post(`/admin/todos/items/${id}/complete`);
};

/**
 * 取消完成待办项
 */
export const uncompleteTodoItem = (id: string): Promise<ApiResponse<TodoItem>> => {
    return api.post(`/admin/todos/items/${id}/uncomplete`);
};

/**
 * 切换重要状态
 */
export const toggleTodoImportant = (id: string): Promise<ApiResponse<TodoItem>> => {
    return api.post(`/admin/todos/items/${id}/toggle-important`);
};

/**
 * 切换"我的一天"状态
 */
export const toggleTodoMyDay = (id: string): Promise<ApiResponse<TodoItem>> => {
    return api.post(`/admin/todos/items/${id}/toggle-my-day`);
};

/**
 * 删除待办项
 */
export const deleteTodoItem = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/todos/items/${id}`);
};

// ==================== 管理员接口 - 智能列表 ====================

/**
 * 获取"我的一天"待办项
 */
export const getMyDayItems = (): Promise<ApiResponse<TodoItem[]>> => {
    return api.get('/admin/todos/my-day');
};

/**
 * 获取"重要"待办项
 */
export const getImportantItems = (): Promise<ApiResponse<TodoItem[]>> => {
    return api.get('/admin/todos/important');
};

/**
 * 获取"计划内"待办项
 */
export const getPlannedItems = (): Promise<ApiResponse<TodoItem[]>> => {
    return api.get('/admin/todos/planned');
};

/**
 * 获取所有未完成待办项
 */
export const getAllActiveItems = (): Promise<ApiResponse<TodoItem[]>> => {
    return api.get('/admin/todos/all');
};

/**
 * 获取已完成待办项
 */
export const getCompletedItems = (
    params: { page?: number; size?: number } = {}
): Promise<ApiResponse<PageResponse<TodoItem>>> => {
    return api.get('/admin/todos/completed', { params });
};

/**
 * 获取列表中的待办项
 */
export const getListItems = (
    listId: string,
    params: { page?: number; size?: number } = {}
): Promise<ApiResponse<PageResponse<TodoItem>>> => {
    return api.get(`/admin/todos/lists/${listId}/items`, { params });
};

/**
 * 搜索待办项
 */
export const searchTodoItems = (
    keyword: string,
    params: { page?: number; size?: number } = {}
): Promise<ApiResponse<PageResponse<TodoItem>>> => {
    return api.get('/admin/todos/search', { params: { keyword, ...params } });
};

// ==================== 管理员接口 - 步骤操作 ====================

/**
 * 添加步骤
 */
export const addTodoStep = (itemId: string, data: TodoStepRequest): Promise<ApiResponse<TodoStep>> => {
    return api.post(`/admin/todos/items/${itemId}/steps`, data);
};

/**
 * 更新步骤
 */
export const updateTodoStep = (stepId: string, data: TodoStepRequest): Promise<ApiResponse<TodoStep>> => {
    return api.put(`/admin/todos/steps/${stepId}`, data);
};

/**
 * 切换步骤完成状态
 */
export const toggleTodoStep = (stepId: string): Promise<ApiResponse<TodoStep>> => {
    return api.post(`/admin/todos/steps/${stepId}/toggle`);
};

/**
 * 删除步骤
 */
export const deleteTodoStep = (stepId: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/todos/steps/${stepId}`);
};

// ==================== 管理员接口 - 统计 ====================

/**
 * 获取统计信息
 */
export const getTodoStats = (): Promise<ApiResponse<TodoStats>> => {
    return api.get('/admin/todos/stats');
};

// ==================== 用户接口 - 关注功能 ====================

/**
 * 关注待办项
 */
export const followTodoItem = (itemId: string): Promise<ApiResponse<string>> => {
    return api.post(`/user/todos/items/${itemId}/follow`);
};

/**
 * 取消关注待办项
 */
export const unfollowTodoItem = (itemId: string): Promise<ApiResponse<string>> => {
    return api.delete(`/user/todos/items/${itemId}/follow`);
};

/**
 * 获取关注的待办项列表
 */
export const getFollowedItems = (
    params: { page?: number; size?: number } = {}
): Promise<ApiResponse<PageResponse<TodoItem>>> => {
    return api.get('/user/todos/followed', { params });
};

/**
 * 用户完成关注的待办项
 */
export const userCompleteTodoItem = (id: string): Promise<ApiResponse<TodoItem>> => {
    return api.post(`/user/todos/items/${id}/complete`);
};

/**
 * 用户取消完成关注的待办项
 */
export const userUncompleteTodoItem = (id: string): Promise<ApiResponse<TodoItem>> => {
    return api.post(`/user/todos/items/${id}/uncomplete`);
};

/**
 * 用户切换步骤完成状态
 */
export const userToggleTodoStep = (stepId: string): Promise<ApiResponse<TodoStep>> => {
    return api.post(`/user/todos/steps/${stepId}/toggle`);
};

/**
 * 获取用户统计信息
 */
export const getUserTodoStats = (): Promise<ApiResponse<TodoStats>> => {
    return api.get('/user/todos/stats');
};

// ==================== 公开接口 - 待办浏览 ====================

/**
 * 获取公开的待办项列表
 */
export const getPublicTodoItems = (
    params: { page?: number; size?: number } = {}
): Promise<ApiResponse<PageResponse<TodoItem>>> => {
    return api.get('/public/todos', { params });
};

/**
 * 获取公开的待办项详情
 */
export const getPublicTodoItemById = (id: string): Promise<ApiResponse<TodoItem>> => {
    return api.get(`/public/todos/${id}`);
};
