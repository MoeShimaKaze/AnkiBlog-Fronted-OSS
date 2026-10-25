// src/hooks/useSnapshots.ts
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { articleSnapshotService, productSnapshotService } from '@/services/snapshotService';
import type {
    ArticleSnapshot,
    ProductSnapshot,
    SnapshotListParams
} from '@/types/snapshot';

// 文章快照 Hook
export const useArticleSnapshots = (articleId: string) => {
    const [snapshots, setSnapshots] = useState<ArticleSnapshot[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fetchSnapshots = useCallback(async (params?: SnapshotListParams) => {
        if (!articleId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await articleSnapshotService.getSnapshots(articleId, params);
            if (response.success) {
                setSnapshots(response.data.content);
                setTotal(response.data.totalElements);
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            setError(err.message || '获取快照列表失败');
            message.error('获取快照列表失败');
        } finally {
            setLoading(false);
        }
    }, [articleId]);

    const createSnapshot = useCallback(async (description?: string) => {
        try {
            const response = await articleSnapshotService.createSnapshot(articleId, { description });
            if (response.success) {
                message.success('快照创建成功');
                await fetchSnapshots();
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            message.error(err.message || '快照创建失败');
            throw err;
        }
    }, [articleId, fetchSnapshots]);

    const deleteSnapshot = useCallback(async (snapshotId: string) => {
        try {
            const response = await articleSnapshotService.deleteSnapshot(articleId, snapshotId);
            if (response.success) {
                message.success('快照删除成功');
                await fetchSnapshots();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            message.error(err.message || '快照删除失败');
            throw err;
        }
    }, [articleId, fetchSnapshots]);

    return {
        snapshots,
        loading,
        total,
        error,
        fetchSnapshots,
        createSnapshot,
        deleteSnapshot,
        refetch: fetchSnapshots
    };
};

// 商品快照 Hook
export const useProductSnapshots = (productId: string) => {
    const [snapshots, setSnapshots] = useState<ProductSnapshot[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fetchSnapshots = useCallback(async (params?: SnapshotListParams) => {
        if (!productId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await productSnapshotService.getSnapshots(productId, params);
            if (response.success) {
                setSnapshots(response.data.content);
                setTotal(response.data.totalElements);
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            setError(err.message || '获取快照列表失败');
            message.error('获取快照列表失败');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const createSnapshot = useCallback(async (description?: string) => {
        try {
            const response = await productSnapshotService.createSnapshot(productId, { description });
            if (response.success) {
                message.success('快照创建成功');
                await fetchSnapshots();
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            message.error(err.message || '快照创建失败');
            throw err;
        }
    }, [productId, fetchSnapshots]);

    const deleteSnapshot = useCallback(async (snapshotId: string) => {
        try {
            const response = await productSnapshotService.deleteSnapshot(productId, snapshotId);
            if (response.success) {
                message.success('快照删除成功');
                await fetchSnapshots();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            message.error(err.message || '快照删除失败');
            throw err;
        }
    }, [productId, fetchSnapshots]);

    return {
        snapshots,
        loading,
        total,
        error,
        fetchSnapshots,
        createSnapshot,
        deleteSnapshot,
        refetch: fetchSnapshots
    };
};

// 单个快照获取 Hook
export const useSnapshot = () => {
    const [snapshot, setSnapshot] = useState<ArticleSnapshot | ProductSnapshot | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchArticleSnapshot = useCallback(async (articleId: string, versionNumber: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await articleSnapshotService.getSnapshot(articleId, versionNumber);
            if (response.success) {
                setSnapshot(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            setError(err.message || '获取快照失败');
            message.error('获取快照失败');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProductSnapshot = useCallback(async (productId: string, versionNumber: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await productSnapshotService.getSnapshot(productId, versionNumber);
            if (response.success) {
                setSnapshot(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            setError(err.message || '获取快照失败');
            message.error('获取快照失败');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        snapshot,
        loading,
        error,
        fetchArticleSnapshot,
        fetchProductSnapshot,
        clearSnapshot: () => setSnapshot(null)
    };
};