// src/hooks/useSiteSettingsPage.ts
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

// 导入站点设置服务
import {
    getSiteProfile,
    updateSiteProfile,
    SiteProfile,
    getAllSiteTemplates,
    getSiteTemplateById,
    createSiteTemplate,
    activateSiteTemplate,
    deleteSiteTemplate,
    duplicateSiteTemplate
} from '@/services/siteSettings.ts';

export interface UseSiteSettingsPageReturn {
    // 数据状态
    profile: SiteProfile | null;
    templates: SiteProfile[];

    // 加载状态
    loading: boolean;
    templatesLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    // 数据操作方法
    refreshData: () => Promise<void>;
    fetchData: () => Promise<void>;
    fetchTemplates: () => Promise<void>;

    // 站点配置操作
    submitProfileUpdate: (formData: any) => Promise<void>;

    // 模板管理操作
    activateTemplate: (id: string) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    duplicateTemplate: (id: string, newTemplateName: string) => Promise<void>;
    createTemplate: (formData: any) => Promise<void>;
    getCurrentTemplate: () => SiteProfile | null;
    getTemplateById: (id: string) => Promise<SiteProfile | null>;
}

export const useSiteSettingsPage = (): UseSiteSettingsPageReturn => {
    // 站点配置状态
    const [profile, setProfile] = useState<SiteProfile | null>(null);
    const [templates, setTemplates] = useState<SiteProfile[]>([]);

    // 加载状态
    const [loading, setLoading] = useState(true);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ========== 数据获取相关 ==========

    // 获取站点配置
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const profileRes = await getSiteProfile();

            if (profileRes.success && profileRes.data) {
                setProfile(profileRes.data);
            } else {
                throw new Error(profileRes.message || '获取站点配置失败');
            }
        } catch (err: any) {
            setError(err.message);
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // 获取所有模板
    const fetchTemplates = useCallback(async () => {
        try {
            setTemplatesLoading(true);
            const res = await getAllSiteTemplates();
            if (res.success && res.data) {
                setTemplates(res.data);
            } else {
                throw new Error(res.message || '获取模板列表失败');
            }
        } catch (err: any) {
            message.error(err.message);
        } finally {
            setTemplatesLoading(false);
        }
    }, []);

    // 初始化数据加载
    useEffect(() => {
        fetchData();
        fetchTemplates();
    }, [fetchData, fetchTemplates]);

    // ========== 站点配置管理 ==========

    const submitProfileUpdate = async (formData: any) => {
        setIsSubmitting(true);
        try {
            const res = await updateSiteProfile(formData);
            if (res.success) {
                message.success('站点配置保存成功！');
                await fetchData();
                await fetchTemplates(); // 刷新模板列表以显示最新状态
            } else {
                message.error(res.message || '保存失败');
                throw new Error(res.message || '保存失败');
            }
        } catch (error: any) {
            message.error(error.message || '保存失败');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // ========== 模板管理功能 ==========

    const activateTemplate = async (id: string) => {
        try {
            const res = await activateSiteTemplate(id);
            if (res.success) {
                message.success('模板激活成功');
                await fetchTemplates();
                await fetchData(); // 刷新当前配置以反映激活的模板
            } else {
                message.error(res.message || '激活模板失败');
            }
        } catch (error: any) {
            message.error(error.message || '激活模板失败');
        }
    };

    const deleteTemplate = async (id: string) => {
        try {
            const res = await deleteSiteTemplate(id);
            if (res.success) {
                message.success('模板删除成功');
                await fetchTemplates();
            } else {
                message.error(res.message || '删除模板失败');
            }
        } catch (error: any) {
            message.error(error.message || '删除模板失败');
        }
    };

    const duplicateTemplate = async (id: string, newTemplateName: string) => {
        try {
            const res = await duplicateSiteTemplate(id, newTemplateName);
            if (res.success) {
                message.success('模板复制成功');
                await fetchTemplates();
            } else {
                message.error(res.message || '复制模板失败');
            }
        } catch (error: any) {
            message.error(error.message || '复制模板失败');
        }
    };

    const createTemplate = async (formData: any) => {
        try {
            setIsSubmitting(true);
            const res = await createSiteTemplate(formData);
            if (res.success) {
                message.success('模板创建成功');
                await fetchTemplates();
                // 如果新建的模板被设为激活状态，刷新当前配置
                if (formData.isActiveTemplate) {
                    await fetchData();
                }
            } else {
                message.error(res.message || '创建模板失败');
                throw new Error(res.message || '创建模板失败');
            }
        } catch (error: any) {
            message.error(error.message || '创建模板失败');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // ========== 便捷方法 ==========

    const refreshData = useCallback(async () => {
        await Promise.all([fetchData(), fetchTemplates()]);
    }, [fetchData, fetchTemplates]);

    const getCurrentTemplate = useCallback(() => {
        return templates.find(t => t.isActiveTemplate) || null;
    }, [templates]);

    const getTemplateById = useCallback(async (id: string) => {
        try {
            const res = await getSiteTemplateById(id);
            if (res.success && res.data) {
                return res.data;
            } else {
                throw new Error(res.message || '获取模板详情失败');
            }
        } catch (error: any) {
            message.error(error.message || '获取模板详情失败');
            return null;
        }
    }, []);

    return {
        // 数据状态
        profile,
        templates,

        // 加载状态
        loading,
        templatesLoading,
        isSubmitting,
        error,

        // 数据操作方法
        refreshData,
        fetchData,
        fetchTemplates,

        // 站点配置操作
        submitProfileUpdate,

        // 模板管理操作
        activateTemplate,
        deleteTemplate,
        duplicateTemplate,
        createTemplate,
        getCurrentTemplate,
        getTemplateById,
    };
};