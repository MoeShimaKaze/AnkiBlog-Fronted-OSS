// src/hooks/customPage/useCustomPageEditor.ts
import { useState } from 'react';
import { message } from 'antd';
import { CustomPage, CustomPageCreateRequest, CustomPageUpdateRequest } from '@/types/customPage.ts';
import * as customPageService from '@/services/customPageService.ts';

export const useCustomPageEditor = () => {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const createPage = async (data: CustomPageCreateRequest): Promise<CustomPage | null> => {
        setSaving(true);
        try {
            const response = await customPageService.createPage(data);
            if (response.success) {
                message.success('页面创建成功');
                return response.data;
            }
            return null;
        } catch (error: any) {
            message.error(error.message || '创建失败');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const updatePage = async (id: string, data: CustomPageUpdateRequest): Promise<CustomPage | null> => {
        setSaving(true);
        try {
            const response = await customPageService.updatePage(id, data);
            if (response.success) {
                message.success('页面更新成功');
                return response.data;
            }
            return null;
        } catch (error: any) {
            message.error(error.message || '更新失败');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const loadPage = async (id: string): Promise<CustomPage | null> => {
        setLoading(true);
        try {
            const response = await customPageService.getAdminPageById(id);
            if (response.success) {
                return response.data;
            }
            return null;
        } catch (error: any) {
            message.error(error.message || '加载页面失败');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const publishPage = async (id: string): Promise<boolean> => {
        try {
            await customPageService.publishPage(id);
            message.success('页面发布成功');
            return true;
        } catch (error: any) {
            message.error(error.message || '发布失败');
            return false;
        }
    };

    const unpublishPage = async (id: string): Promise<boolean> => {
        try {
            await customPageService.unpublishPage(id);
            message.success('页面已转为草稿');
            return true;
        } catch (error: any) {
            message.error(error.message || '操作失败');
            return false;
        }
    };

    return {
        saving,
        loading,
        createPage,
        updatePage,
        loadPage,
        publishPage,
        unpublishPage
    };
};