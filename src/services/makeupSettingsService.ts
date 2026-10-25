/**
 * 化妆品模块设置 API 服务
 */
import api from './api';
import type { ApiResponse } from '@/types/api';
import type { MakeupSettings, MakeupSettingsRequest } from '@/types/makeup';

/**
 * 获取设置
 */
export const getMakeupSettings = (): Promise<ApiResponse<MakeupSettings>> => {
    return api.get('/admin/makeup-settings');
};

/**
 * 更新设置
 */
export const updateMakeupSettings = (data: MakeupSettingsRequest): Promise<ApiResponse<MakeupSettings>> => {
    return api.put('/admin/makeup-settings', data);
};
