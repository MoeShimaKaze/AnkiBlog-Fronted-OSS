// src/hooks/customPage/useCustomPageOperations.ts
import { useState } from 'react';
import { message } from 'antd';
import * as customPageService from '@/services/customPageService.ts';

export const useCustomPageOperations = () => {
    const [loading, setLoading] = useState(false);

    const batchPublish = async (ids: string[]) => {
        setLoading(true);
        try {
            const promises = ids.map(id => customPageService.publishPage(id));
            await Promise.all(promises);
            message.success(`成功发布 ${ids.length} 个页面`);
            return true;
        } catch (error) {
            message.error('批量发布失败');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const batchUnpublish = async (ids: string[]) => {
        setLoading(true);
        try {
            const promises = ids.map(id => customPageService.unpublishPage(id));
            await Promise.all(promises);
            message.success(`成功将 ${ids.length} 个页面转为草稿`);
            return true;
        } catch (error) {
            message.error('批量操作失败');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const batchSetFeatured = async (ids: string[], featured: boolean) => {
        setLoading(true);
        try {
            const promises = ids.map(id => customPageService.setFeatured(id, featured));
            await Promise.all(promises);
            message.success(`成功${featured ? '设为' : '取消'}推荐 ${ids.length} 个页面`);
            return true;
        } catch (error) {
            message.error('批量操作失败');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const batchDelete = async (ids: string[]) => {
        setLoading(true);
        try {
            const promises = ids.map(id => customPageService.deletePage(id));
            await Promise.all(promises);
            message.success(`成功删除 ${ids.length} 个页面`);
            return true;
        } catch (error) {
            message.error('批量删除失败');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        batchPublish,
        batchUnpublish,
        batchSetFeatured,
        batchDelete
    };
};