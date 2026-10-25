/**
 * 通知推送相关类型定义
 */

// ==================== 钉钉配置 ====================

export interface DingtalkConfig {
    id: string;
    webhookUrl: string;
    hasSecret: boolean;
    robotName: string;
    enabled: boolean;
    lastTestAt?: string;
    lastTestResult?: boolean;
    lastErrorMessage?: string;
    rateLimitPerMinute: number;
    createdAt: string;
    updatedAt: string;
}

export interface DingtalkConfigRequest {
    webhookUrl?: string;
    secret?: string;
    robotName?: string;
    enabled?: boolean;
    rateLimitPerMinute?: number;
}

// ==================== 通知类型 ====================

export enum NotificationType {
    // 商品
    PRODUCT_CREATED = 'PRODUCT_CREATED',
    PRODUCT_UPDATED = 'PRODUCT_UPDATED',
    // 评论
    COMMENT_CREATED = 'COMMENT_CREATED',
    // 文章
    ARTICLE_CREATED = 'ARTICLE_CREATED',
    ARTICLE_UPDATED = 'ARTICLE_UPDATED',
    // 分类
    CATEGORY_CREATED = 'CATEGORY_CREATED',
    CATEGORY_UPDATED = 'CATEGORY_UPDATED',
    // 穿搭
    OUTFIT_CREATED = 'OUTFIT_CREATED',
    OUTFIT_UPDATED = 'OUTFIT_UPDATED',
    WARDROBE_IDLE_REMINDER = 'WARDROBE_IDLE_REMINDER',
    // 化妆
    COSMETIC_PURCHASED = 'COSMETIC_PURCHASED',
    MAKEUP_LOGGED = 'MAKEUP_LOGGED',
    COSMETIC_IDLE_REMINDER = 'COSMETIC_IDLE_REMINDER',
    // 待办
    TODO_CREATED = 'TODO_CREATED',
    TODO_COMPLETED = 'TODO_COMPLETED',
    TODO_DELAYED = 'TODO_DELAYED',
    TODO_CHANGED = 'TODO_CHANGED',
    // 打卡
    CHECKIN_PLAN_CREATED = 'CHECKIN_PLAN_CREATED',
    CHECKIN_SUCCESS = 'CHECKIN_SUCCESS',
    CHECKIN_REMINDER = 'CHECKIN_REMINDER',
    // 里程碑
    MILESTONE_PROGRESS = 'MILESTONE_PROGRESS',
    MILESTONE_ACHIEVED = 'MILESTONE_ACHIEVED',
    // 穿搭推荐
    DAILY_OUTFIT_SUGGESTION = 'DAILY_OUTFIT_SUGGESTION',
}

// 通知类型配置
export interface NotificationTypeConfig {
    label: string;
    category: string;
    icon: string;
    color: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
    // 商品
    [NotificationType.PRODUCT_CREATED]: { label: '新增商品', category: '商品', icon: '🛍️', color: '#fa541c' },
    [NotificationType.PRODUCT_UPDATED]: { label: '修改商品', category: '商品', icon: '✏️', color: '#fa8c16' },
    // 评论
    [NotificationType.COMMENT_CREATED]: { label: '新增评论', category: '评论', icon: '💬', color: '#52c41a' },
    // 文章
    [NotificationType.ARTICLE_CREATED]: { label: '新增文章', category: '文章', icon: '📝', color: '#1890ff' },
    [NotificationType.ARTICLE_UPDATED]: { label: '更新文章', category: '文章', icon: '📖', color: '#2f54eb' },
    // 分类
    [NotificationType.CATEGORY_CREATED]: { label: '新增分类', category: '分类', icon: '📁', color: '#722ed1' },
    [NotificationType.CATEGORY_UPDATED]: { label: '修改分类', category: '分类', icon: '📂', color: '#9254de' },
    // 穿搭
    [NotificationType.OUTFIT_CREATED]: { label: '新增穿搭', category: '穿搭', icon: '👗', color: '#eb2f96' },
    [NotificationType.OUTFIT_UPDATED]: { label: '修改穿搭', category: '穿搭', icon: '👔', color: '#f759ab' },
    [NotificationType.WARDROBE_IDLE_REMINDER]: { label: '衣橱闲置提醒', category: '穿搭', icon: '👚', color: '#ff85c0' },
    // 化妆
    [NotificationType.COSMETIC_PURCHASED]: { label: '化妆品购买', category: '化妆', icon: '💄', color: '#ff4d4f' },
    [NotificationType.MAKEUP_LOGGED]: { label: '化妆记录', category: '化妆', icon: '💅', color: '#ff7a45' },
    [NotificationType.COSMETIC_IDLE_REMINDER]: { label: '化妆品闲置', category: '化妆', icon: '🧴', color: '#ffa940' },
    // 待办
    [NotificationType.TODO_CREATED]: { label: '新增待办', category: '待办', icon: '📋', color: '#13c2c2' },
    [NotificationType.TODO_COMPLETED]: { label: '完成待办', category: '待办', icon: '✅', color: '#52c41a' },
    [NotificationType.TODO_DELAYED]: { label: '延期待办', category: '待办', icon: '⏰', color: '#faad14' },
    [NotificationType.TODO_CHANGED]: { label: '变更待办', category: '待办', icon: '🔄', color: '#1890ff' },
    // 打卡
    [NotificationType.CHECKIN_PLAN_CREATED]: { label: '新增打卡计划', category: '打卡', icon: '🎯', color: '#722ed1' },
    [NotificationType.CHECKIN_SUCCESS]: { label: '打卡成功', category: '打卡', icon: '🔥', color: '#fa541c' },
    [NotificationType.CHECKIN_REMINDER]: { label: '未打卡提醒', category: '打卡', icon: '⚠️', color: '#faad14' },
    // 里程碑
    [NotificationType.MILESTONE_PROGRESS]: { label: '里程碑进度', category: '里程碑', icon: '📊', color: '#1890ff' },
    [NotificationType.MILESTONE_ACHIEVED]: { label: '里程碑达成', category: '里程碑', icon: '🏆', color: '#fadb14' },
    // 穿搭推荐
    [NotificationType.DAILY_OUTFIT_SUGGESTION]: { label: '今天穿什么', category: '穿搭推荐', icon: '🌟', color: '#eb2f96' },
};

// 获取所有分类
export const getNotificationCategories = (): string[] => {
    const categories = new Set<string>();
    Object.values(NOTIFICATION_TYPE_CONFIG).forEach(config => categories.add(config.category));
    return Array.from(categories);
};

// 按分类获取通知类型
export const getNotificationTypesByCategory = (category: string): NotificationType[] => {
    return Object.entries(NOTIFICATION_TYPE_CONFIG)
        .filter(([_, config]) => config.category === category)
        .map(([type]) => type as NotificationType);
};

// ==================== 渠道配置 ====================

export interface NotificationChannelConfig {
    id: string;
    notificationType: NotificationType;
    typeCode: string;
    typeDescription: string;
    typeCategory: string;
    emailEnabled: boolean;
    dingtalkEnabled: boolean;
    hasCustomTemplate: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ChannelConfigUpdateRequest {
    notificationType: NotificationType;
    emailEnabled?: boolean;
    dingtalkEnabled?: boolean;
    dingtalkMessageTemplate?: string;
}

export interface BatchChannelUpdateRequest {
    configs: ChannelConfigUpdateRequest[];
}

// ==================== 发送日志 ====================

export interface NotificationSendLog {
    id: string;
    notificationType: NotificationType;
    typeDescription: string;
    channel: 'EMAIL' | 'DINGTALK';
    channelDescription: string;
    title: string;
    contentSummary?: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    statusDescription: string;
    errorMessage?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    sentAt?: string;
    createdAt: string;
}

// ==================== 统计信息 ====================

export interface NotificationStats {
    totalCount: number;
    emailCount: number;
    dingtalkCount: number;
    successCount: number;
    failedCount: number;
    todayCount: number;
    todaySuccessCount: number;
    todayFailedCount: number;
    emailEnabledTypes: number;
    dingtalkEnabledTypes: number;
    dingtalkServiceEnabled: boolean;
}
