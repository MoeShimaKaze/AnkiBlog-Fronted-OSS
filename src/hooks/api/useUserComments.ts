import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
// 从正确的 service 文件导入
import { getUserComments } from '@/services/comments';
import type { UserComment, GetUserCommentsParams } from '@/services/comments';

export const useUserComments = () => {
    const [comments, setComments] = useState<UserComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchUserComments = useCallback(async (page: number, size: number) => {
        setLoading(true);
        try {
            const params: GetUserCommentsParams = {
                page: page - 1,
                size: size,
                sort: 'createdAt,desc',
            };
            const res = await getUserComments(params);
            if (res.success) {
                setComments(res.data.content);
                setTotal(res.data.totalElements);
                setCurrentPage(page);
                setPageSize(size);
            } else {
                message.error(res.message || '获取评论失败');
            }
        } catch (error) {
            console.error('Failed to load user comments:', error);
            message.error('获取评论失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    }, []);

    // 使用 useEffect 实现初始加载
    useEffect(() => {
        fetchUserComments(currentPage, pageSize);
    }, [fetchUserComments]); // useCallback 保证了 fetchUserComments 的稳定性

    return {
        comments,
        loading,
        total,
        currentPage,
        pageSize,
        fetchUserComments,
    };
};