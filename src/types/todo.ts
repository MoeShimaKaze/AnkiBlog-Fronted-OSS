/**
 * 待办清单模块类型定义
 */

// ==================== 枚举类型 ====================

export type ListType = 'SYSTEM' | 'CUSTOM';
export type SystemListType = 'MY_DAY' | 'IMPORTANT' | 'PLANNED' | 'ALL';
export type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ArticleLinkType = 'NONE' | 'REMIND' | 'PLAN';

// ==================== 待办列表 ====================

export interface TodoList {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    listType: ListType;
    systemType?: SystemListType;
    sortOrder: number;
    isPublic: boolean;
    activeItemCount: number;
    totalItemCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface TodoListCreateRequest {
    name: string;
    icon?: string;
    color?: string;
    isPublic?: boolean;
}

export interface TodoListUpdateRequest {
    name?: string;
    icon?: string;
    color?: string;
    isPublic?: boolean;
    sortOrder?: number;
}

// ==================== 待办项 ====================

export interface TodoItem {
    id: string;
    listId?: string;
    listName?: string;
    creatorId: string;
    title: string;
    note?: string;
    status: TodoStatus;
    priority: TodoPriority;
    isCompleted: boolean;
    completedAt?: string;
    dueDate?: string;
    reminderAt?: string;
    isMyDay: boolean;
    isImportant: boolean;
    isOverdue: boolean;
    sortOrder: number;

    // 文章关联
    articleLinkType: ArticleLinkType;
    articleId?: string;
    articleTitle?: string;
    plannedArticleTitle?: string;
    plannedArticleTags?: string;
    createdArticleId?: string;

    // 步骤信息
    steps: TodoStep[];
    completedStepsCount: number;
    totalStepsCount: number;

    // 关注者信息
    followersCount: number;
    isFollowed: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface TodoItemCreateRequest {
    listId?: string;
    title: string;
    note?: string;
    priority?: TodoPriority;
    dueDate?: string;
    reminderAt?: string;
    isMyDay?: boolean;
    isImportant?: boolean;
    articleLinkType?: ArticleLinkType;
    articleId?: string;
    plannedArticleTitle?: string;
    plannedArticleTags?: string;
    steps?: string[];
}

export interface TodoItemUpdateRequest {
    title?: string;
    note?: string;
    status?: TodoStatus;
    priority?: TodoPriority;
    dueDate?: string;
    reminderAt?: string;
    isMyDay?: boolean;
    isImportant?: boolean;
    listId?: string;
    sortOrder?: number;
    articleLinkType?: ArticleLinkType;
    articleId?: string;
    plannedArticleTitle?: string;
    plannedArticleTags?: string;
}

// ==================== 步骤 ====================

export interface TodoStep {
    id: string;
    itemId: string;
    title: string;
    isCompleted: boolean;
    completedAt?: string;
    sortOrder: number;
    createdAt: string;
}

export interface TodoStepRequest {
    title: string;
    sortOrder?: number;
}

// ==================== 统计 ====================

export interface TodoStats {
    totalTodoCount: number;
    activeTodoCount: number;
    completedTodoCount: number;
    overdueTodoCount: number;
    myDayCount: number;
    importantCount: number;
    plannedCount: number;
    followedCount: number;
}

// ==================== 配置常量 ====================

export const PRIORITY_CONFIG: Record<TodoPriority, { label: string; color: string; bgColor: string }> = {
    LOW: { label: '低', color: '#8c8c8c', bgColor: '#f5f5f5' },
    MEDIUM: { label: '中', color: '#1890ff', bgColor: '#e6f7ff' },
    HIGH: { label: '高', color: '#faad14', bgColor: '#fffbe6' },
    URGENT: { label: '紧急', color: '#ff4d4f', bgColor: '#fff2f0' }
};

export const STATUS_CONFIG: Record<TodoStatus, { label: string; color: string }> = {
    PENDING: { label: '待处理', color: '#8c8c8c' },
    IN_PROGRESS: { label: '进行中', color: '#1890ff' },
    COMPLETED: { label: '已完成', color: '#52c41a' },
    CANCELLED: { label: '已取消', color: '#ff4d4f' }
};

export const SYSTEM_LIST_CONFIG: Record<SystemListType, { name: string; icon: string; color: string }> = {
    MY_DAY: { name: '我的一天', icon: 'sun', color: '#f5a623' },
    IMPORTANT: { name: '重要', icon: 'star', color: '#eb2f96' },
    PLANNED: { name: '计划内', icon: 'calendar', color: '#52c41a' },
    ALL: { name: '所有任务', icon: 'unordered-list', color: '#1890ff' }
};

// ==================== 视图类型 ====================

export type TodoViewType = 'my-day' | 'important' | 'planned' | 'all' | 'completed' | 'list';

export interface TodoViewState {
    viewType: TodoViewType;
    listId?: string;
    listName?: string;
}
