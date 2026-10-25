/**
 * 打卡模块 API 服务
 */
import api from './api';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
    GoalCategory,
    GoalCategoryRequest,
    Goal,
    GoalCreateRequest,
    GoalUpdateRequest,
    GoalDetail,
    LinkedTodo,
    CheckInRecord,
    CheckInRequest,
    CheckInResult,
    Milestone,
    MilestoneRequest,
    GoalStats,
    CalendarData,
    ReorderRequest,
    GoalTodoLinkRequest,
    GoalStatus
} from '@/types/checkIn';

// ==================== 分类管理 ====================

/**
 * 创建分类
 */
export const createGoalCategory = (data: GoalCategoryRequest): Promise<ApiResponse<GoalCategory>> => {
    return api.post('/admin/goal-categories', data);
};

/**
 * 获取所有分类
 */
export const getGoalCategories = (): Promise<ApiResponse<GoalCategory[]>> => {
    return api.get('/admin/goal-categories');
};

/**
 * 获取分类详情
 */
export const getGoalCategoryById = (id: string): Promise<ApiResponse<GoalCategory>> => {
    return api.get(`/admin/goal-categories/${id}`);
};

/**
 * 更新分类
 */
export const updateGoalCategory = (id: string, data: GoalCategoryRequest): Promise<ApiResponse<GoalCategory>> => {
    return api.put(`/admin/goal-categories/${id}`, data);
};

/**
 * 删除分类
 */
export const deleteGoalCategory = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/goal-categories/${id}`);
};

/**
 * 重新排序分类
 */
export const reorderGoalCategories = (data: ReorderRequest): Promise<ApiResponse<GoalCategory[]>> => {
    return api.put('/admin/goal-categories/reorder', data);
};

// ==================== 目标管理 ====================

/**
 * 创建目标
 */
export const createGoal = (data: GoalCreateRequest): Promise<ApiResponse<Goal>> => {
    return api.post('/admin/goals', data);
};

/**
 * 获取目标列表
 */
export const getGoals = (params?: {
    status?: GoalStatus;
    categoryId?: string;
}): Promise<ApiResponse<Goal[]>> => {
    return api.get('/admin/goals', { params });
};

/**
 * 获取目标详情
 */
export const getGoalDetail = (id: string): Promise<ApiResponse<GoalDetail>> => {
    return api.get(`/admin/goals/${id}`);
};

/**
 * 更新目标
 */
export const updateGoal = (id: string, data: GoalUpdateRequest): Promise<ApiResponse<Goal>> => {
    return api.put(`/admin/goals/${id}`, data);
};

/**
 * 删除目标
 */
export const deleteGoal = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/goals/${id}`);
};

/**
 * 暂停目标
 */
export const pauseGoal = (id: string): Promise<ApiResponse<Goal>> => {
    return api.post(`/admin/goals/${id}/pause`);
};

/**
 * 恢复目标
 */
export const resumeGoal = (id: string): Promise<ApiResponse<Goal>> => {
    return api.post(`/admin/goals/${id}/resume`);
};

/**
 * 归档目标
 */
export const archiveGoal = (id: string): Promise<ApiResponse<Goal>> => {
    return api.post(`/admin/goals/${id}/archive`);
};

/**
 * 重新排序目标
 */
export const reorderGoals = (data: ReorderRequest): Promise<ApiResponse<Goal[]>> => {
    return api.put('/admin/goals/reorder', data);
};

// ==================== 待办关联 ====================

/**
 * 关联待办
 */
export const linkTodosToGoal = (goalId: string, data: GoalTodoLinkRequest): Promise<ApiResponse<string>> => {
    return api.post(`/admin/goals/${goalId}/todos`, data);
};

/**
 * 取消关联待办
 */
export const unlinkTodoFromGoal = (goalId: string, todoId: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/goals/${goalId}/todos/${todoId}`);
};

/**
 * 获取关联的待办列表
 */
export const getLinkedTodos = (goalId: string): Promise<ApiResponse<LinkedTodo[]>> => {
    return api.get(`/admin/goals/${goalId}/todos`);
};

// ==================== 打卡操作 ====================

/**
 * 打卡
 */
export const checkIn = (goalId: string, data: CheckInRequest): Promise<ApiResponse<CheckInResult>> => {
    return api.post(`/admin/goals/${goalId}/check-in`, data);
};

/**
 * 修改打卡记录
 */
export const updateCheckIn = (id: string, data: CheckInRequest): Promise<ApiResponse<CheckInRecord>> => {
    return api.put(`/admin/check-ins/${id}`, data);
};

/**
 * 删除打卡记录
 */
export const deleteCheckIn = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/check-ins/${id}`);
};

/**
 * 获取打卡历史
 */
export const getCheckInHistory = (
    goalId: string,
    params?: { page?: number; size?: number }
): Promise<ApiResponse<PageResponse<CheckInRecord>>> => {
    return api.get(`/admin/goals/${goalId}/check-ins`, { params });
};

/**
 * 获取日历数据
 */
export const getCalendarData = (
    goalId: string,
    year: number,
    month: number
): Promise<ApiResponse<CalendarData>> => {
    return api.get(`/admin/goals/${goalId}/calendar`, { params: { year, month } });
};

/**
 * 获取今日打卡状态
 */
export const getTodayCheckIn = (goalId: string): Promise<ApiResponse<CheckInRecord | null>> => {
    return api.get(`/admin/goals/${goalId}/today`);
};

/**
 * 获取目标统计
 */
export const getGoalStats = (goalId: string): Promise<ApiResponse<GoalStats>> => {
    return api.get(`/admin/goals/${goalId}/stats`);
};

// ==================== 里程碑管理 ====================

/**
 * 创建里程碑
 */
export const createMilestone = (goalId: string, data: MilestoneRequest): Promise<ApiResponse<Milestone>> => {
    return api.post(`/admin/goals/${goalId}/milestones`, data);
};

/**
 * 获取里程碑列表
 */
export const getMilestones = (goalId: string): Promise<ApiResponse<Milestone[]>> => {
    return api.get(`/admin/goals/${goalId}/milestones`);
};

/**
 * 更新里程碑
 */
export const updateMilestone = (id: string, data: MilestoneRequest): Promise<ApiResponse<Milestone>> => {
    return api.put(`/admin/milestones/${id}`, data);
};

/**
 * 删除里程碑
 */
export const deleteMilestone = (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/admin/milestones/${id}`);
};

/**
 * 手动解锁里程碑
 */
export const unlockMilestone = (id: string): Promise<ApiResponse<Milestone>> => {
    return api.post(`/admin/milestones/${id}/unlock`);
};

/**
 * 重新排序里程碑
 */
export const reorderMilestones = (goalId: string, data: ReorderRequest): Promise<ApiResponse<Milestone[]>> => {
    return api.put(`/admin/goals/${goalId}/milestones/reorder`, data);
};

// ==================== 公开打卡API ====================

import type { PublicGoalSummary } from '@/types/checkIn';

/**
 * 获取公开的目标列表
 */
export const getPublicGoals = (status: GoalStatus = 'ACTIVE'): Promise<ApiResponse<Goal[]>> => {
    return api.get('/public/goals', { params: { status } });
};

/**
 * 获取公开目标详情
 */
export const getPublicGoalDetail = (id: string): Promise<ApiResponse<GoalDetail>> => {
    return api.get(`/public/goals/${id}`);
};

/**
 * 获取公开目标的日历数据
 */
export const getPublicCalendarData = (
    goalId: string,
    year: number,
    month: number
): Promise<ApiResponse<CalendarData>> => {
    return api.get(`/public/goals/${goalId}/calendar`, { params: { year, month } });
};

/**
 * 获取公开目标的里程碑列表
 */
export const getPublicMilestones = (goalId: string): Promise<ApiResponse<Milestone[]>> => {
    return api.get(`/public/goals/${goalId}/milestones`);
};

/**
 * 获取公开目标的统计信息
 */
export const getPublicGoalStats = (goalId: string): Promise<ApiResponse<GoalStats>> => {
    return api.get(`/public/goals/${goalId}/stats`);
};

/**
 * 获取公开打卡汇总统计
 */
export const getPublicGoalSummary = (): Promise<ApiResponse<PublicGoalSummary>> => {
    return api.get('/public/goals/summary');
};

/**
 * 管理员在公开页面打卡
 */
export const publicCheckIn = (goalId: string, data: CheckInRequest): Promise<ApiResponse<CheckInResult>> => {
    return api.post(`/public/goals/${goalId}/check-in`, data);
};
