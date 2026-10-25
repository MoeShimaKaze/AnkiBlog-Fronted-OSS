import { useState, useEffect } from 'react';
import { Article } from '@/types/article';
import { ApiResponse, PageResponse } from '@/types/api';
import { getArticles, getArticleBySlug } from '@/services/articles';

type ArticlesResponse = PageResponse<Article>;

interface ArticlesParams {
    page?: number;
    size?: number;
    tag?: string;
    keyword?: string;
    sort?: string | string[]; // 支持字符串或字符串数组
}

export const useArticles = (params: ArticlesParams = {}) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fetchArticles = async () => {
        setLoading(true);
        setError(null);

        try {
            let queryParams: any = {
                page: params.page,
                size: params.size,
                search: params.keyword || undefined,
                keyword: params.keyword || undefined,
            };

            // 处理排序参数 - 如果是数组，需要特殊处理
            if (params.sort) {
                if (Array.isArray(params.sort)) {
                    // 不直接传递数组，而是在axios请求时处理
                    queryParams._sortArray = params.sort;
                } else {
                    queryParams.sort = params.sort;
                }
            }

            const response: ApiResponse<ArticlesResponse> = await getArticles(queryParams);

            if (response && response.success && response.data) {
                const data = response.data;
                setArticles(data.content || []);
                setTotal(data.totalElements || 0);
            } else {
                console.warn('文章响应异常:', response);
                setArticles([]);
                setTotal(0);
                setError(response?.message || '响应数据格式错误');
            }
        } catch (err: any) {
            console.error('获取文章失败:', err);
            setArticles([]);
            setTotal(0);

            if (err.response?.status === 404) {
                setError('未找到相关文章');
            } else if (err.response?.status >= 500) {
                setError('服务器错误，请稍后重试');
            } else if (err.code === 'NETWORK_ERROR' || !err.response) {
                setError('网络连接失败，请检查网络');
            } else {
                setError(err.response?.data?.message || '获取文章失败');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [JSON.stringify(params)]);

    return {
        articles,
        loading,
        total,
        error,
        refetch: fetchArticles,
    };
};

export const useArticle = (slug: string) => {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setArticle(null);
            setError(null);
            return;
        }

        const fetchArticle = async () => {
            setLoading(true);
            setError(null);

            try {
                const response: ApiResponse<Article> = await getArticleBySlug(slug);

                if (response && response.success && response.data) {
                    // 直接使用后端返回的数据，已匹配 Article 类型
                    setArticle(response.data);
                } else {
                    setArticle(null);
                    setError(response?.message || '文章数据格式错误');
                }
            } catch (err: any) {
                console.error('获取文章详情失败:', err);
                setArticle(null);

                if (err.response?.status === 404) {
                    setError('文章不存在');
                } else if (err.response?.status >= 500) {
                    setError('服务器错误，请稍后重试');
                } else {
                    setError(err.response?.data?.message || '获取文章详情失败');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug]);

    return {
        article,
        loading,
        error,
    };
};