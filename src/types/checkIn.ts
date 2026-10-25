/**
 * 打卡模块类型定义
 */

// ==================== 枚举类型 ====================

export type GoalType = 'DAILY' | 'ACCUMULATE';
export type GoalStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type RepeatType = 'DAILY' | 'WEEKDAY' | 'WEEKEND' | 'CUSTOM';
export type MilestoneConditionType = 'TOTAL_DAYS' | 'STREAK_DAYS' | 'TOTAL_VALUE' | 'SINGLE_VALUE';

// ==================== 目标分类 ====================

export interface GoalCategory {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    sortOrder: number;
    goalCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface GoalCategoryRequest {
    name: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
}

// ==================== 目标 ====================

export interface Goal {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    coverImage?: string;

    categoryId?: string;
    categoryName?: string;

    goalType: GoalType;
    targetValue?: number;
    targetUnit?: string;
    stepValue?: number;

    repeatType?: RepeatType;
    repeatDays?: number[];
    startDate?: string;
    endDate?: string;

    reminderEnabled?: boolean;
    reminderTimes?: string[];
    encouragement?: string;

    totalCheckInDays: number;
    currentStreak: number;
    longestStreak: number;
    totalValue: number;
    lastCheckInDate?: string;
    progressPercentage: number;

    status: GoalStatus;
    sortOrder: number;
    isPublic: boolean;

    checkedInToday: boolean;
    shouldCheckInToday: boolean;

    milestoneCount: number;
    unlockedMilestoneCount: number;
    linkedTodoCount: number;

    createdAt: string;
    updatedAt: string;
}

export interface GoalCreateRequest {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    coverImage?: string;
    categoryId?: string;
    goalType: GoalType;
    targetValue?: number;
    targetUnit?: string;
    stepValue?: number;
    repeatType?: RepeatType;
    repeatDays?: number[];
    startDate?: string;
    endDate?: string;
    reminderEnabled?: boolean;
    reminderTimes?: string[];
    encouragement?: string;
    isPublic?: boolean;
    todoItemIds?: string[];
    milestones?: MilestoneRequest[];
}

export interface GoalUpdateRequest {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    coverImage?: string;
    categoryId?: string;
    goalType?: GoalType;
    targetValue?: number;
    targetUnit?: string;
    stepValue?: number;
    repeatType?: RepeatType;
    repeatDays?: number[];
    startDate?: string;
    endDate?: string;
    reminderEnabled?: boolean;
    reminderTimes?: string[];
    encouragement?: string;
    isPublic?: boolean;
    status?: GoalStatus;
    sortOrder?: number;
}

// ==================== 目标详情 ====================

export interface GoalDetail extends Omit<Goal, 'milestoneCount' | 'unlockedMilestoneCount' | 'linkedTodoCount'> {
    todayCheckIn?: CheckInRecord;
    milestones: Milestone[];
    linkedTodos: LinkedTodo[];
    recentCheckIns: CheckInRecord[];
}

export interface LinkedTodo {
    id: string;
    todoItemId: string;
    title: string;
    isCompleted: boolean;
}

// ==================== 打卡记录 ====================

export interface CheckInRecord {
    id: string;
    goalId: string;
    goalName?: string;
    checkInDate: string;
    checkInTime?: string;
    value?: number;
    note?: string;
    mood?: string;
    images?: string[];
    streakDaySnapshot?: number;
    isRetroactive: boolean;
    isToday: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CheckInRequest {
    date?: string;
    value?: number;
    note?: string;
    mood?: string;
    images?: string[];
}

export interface CheckInResult {
    checkInRecord: CheckInRecord;
    currentStreak: number;
    totalCheckInDays: number;
    totalValue: number;
    progressPercentage: number;
    newlyUnlockedMilestones: Milestone[];
    message: string;
}

// ==================== 里程碑 ====================

/** 关联内容简要信息 */
export interface LinkedContentInfo {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    type: 'PRODUCT' | 'ARTICLE';
}

export interface Milestone {
    id: string;
    goalId: string;
    name: string;
    description?: string;
    icon?: string;
    conditionType: MilestoneConditionType;
    conditionValue: number;
    conditionDescription: string;
    isUnlocked: boolean;
    unlockedAt?: string;
    sortOrder: number;
    remainingValue?: number;
    createdAt: string;
    updatedAt: string;

    // 二期功能：关联内容
    linkedProductId?: string;
    linkedArticleId?: string;
    autoCreateArticle?: boolean;
    articleVisibility?: 'DRAFT' | 'PUBLISHED';
    generatedArticleId?: string;

    // 关联内容详情（用于展示）
    linkedProduct?: LinkedContentInfo;
    linkedArticle?: LinkedContentInfo;
    generatedArticle?: LinkedContentInfo;
}

export interface MilestoneRequest {
    name: string;
    description?: string;
    icon?: string;
    conditionType: MilestoneConditionType;
    conditionValue: number;
    sortOrder?: number;

    // 二期功能：关联内容
    linkedProductId?: string;
    linkedArticleId?: string;
    autoCreateArticle?: boolean;
    articleVisibility?: 'DRAFT' | 'PUBLISHED';
}

// ==================== 统计 ====================

export interface GoalStats {
    goalId: string;
    goalName: string;
    totalCheckInDays: number;
    currentStreak: number;
    longestStreak: number;
    totalValue: number;
    progressPercentage: number;
    totalMilestones: number;
    unlockedMilestones: number;
    firstCheckInDate?: string;
    lastCheckInDate?: string;
    thisWeekCheckIns: number;
    thisMonthCheckIns: number;
    completionRate?: number;
    recentCheckIns?: DailyCheckIn[];
    monthlyStats?: Record<string, number>;
}

export interface DailyCheckIn {
    date: string;
    value?: number;
    checkedIn: boolean;
}

// ==================== 日历数据 ====================

export interface CalendarData {
    year: number;
    month: number;
    goalId: string;
    days: CalendarDay[];
}

export interface CalendarDay {
    date: string;
    checkedIn: boolean;
    value?: number;
    mood?: string;
    note?: string;
    checkInId?: string;
}

// ==================== 通用请求 ====================

export interface ReorderRequest {
    ids: string[];
}

export interface GoalTodoLinkRequest {
    todoItemIds: string[];
}

// ==================== 公开打卡统计 ====================

export interface PublicGoalSummary {
    activeGoalCount: number;
    totalCheckInDays: number;
    maxCurrentStreak: number;
    maxLongestStreak: number;
    thisMonthCheckIns: number;
    unlockedMilestoneCount: number;
    totalMilestoneCount: number;
    recentActiveGoals: GoalBrief[];
}

export interface GoalBrief {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    currentStreak: number;
    totalCheckInDays: number;
    checkedInToday: boolean;
}

// ==================== 配置常量 ====================

export const GOAL_TYPE_CONFIG: Record<GoalType, { label: string; description: string }> = {
    DAILY: { label: '每日打卡', description: '每天打卡一次，完成即可' },
    ACCUMULATE: { label: '累计打卡', description: '输入数值，累计达到目标' }
};

export const GOAL_STATUS_CONFIG: Record<GoalStatus, { label: string; color: string }> = {
    ACTIVE: { label: '进行中', color: '#52c41a' },
    PAUSED: { label: '已暂停', color: '#faad14' },
    COMPLETED: { label: '已完成', color: '#1890ff' },
    ARCHIVED: { label: '已归档', color: '#8c8c8c' }
};

export const REPEAT_TYPE_CONFIG: Record<RepeatType, { label: string; description: string }> = {
    DAILY: { label: '每天', description: '每天都需要打卡' },
    WEEKDAY: { label: '工作日', description: '周一至周五' },
    WEEKEND: { label: '周末', description: '周六周日' },
    CUSTOM: { label: '自定义', description: '自定义打卡日期' }
};

export const MILESTONE_CONDITION_CONFIG: Record<MilestoneConditionType, { label: string; description: string; unit: string }> = {
    TOTAL_DAYS: { label: '累计天数', description: '累计打卡达到指定天数', unit: '天' },
    STREAK_DAYS: { label: '连续天数', description: '连续打卡达到指定天数', unit: '天' },
    TOTAL_VALUE: { label: '累计值', description: '累计值达到指定数值', unit: '' },
    SINGLE_VALUE: { label: '单次值', description: '单次打卡值达到指定数值', unit: '' }
};

// 心情选项
export const MOOD_OPTIONS = [
    { emoji: '😊', label: '开心' },
    { emoji: '😐', label: '一般' },
    { emoji: '😫', label: '疲惫' },
    { emoji: '🎉', label: '庆祝' },
    { emoji: '💪', label: '努力' },
    { emoji: '😴', label: '困倦' },
    { emoji: '🔥', label: '热情' },
    { emoji: '⭐', label: '出色' }
];

// 预设图标
export const GOAL_ICONS = [
    '🎯', '📚', '🏃', '💪', '🧘', '🎨', '🎵', '✍️',
    '💻', '📝', '🌱', '💧', '🍎', '🛌', '⏰', '💰',
    '📖', '🎮', '🚴', '🏋️', '🧠', '❤️', '🌟', '🔥'
];

// 预设颜色
export const GOAL_COLORS = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
];
