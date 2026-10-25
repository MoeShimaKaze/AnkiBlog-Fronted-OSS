// src/hooks/user/useInteractions.ts - 修复版本
import { useState, useEffect } from 'react';
import { message } from 'antd';
import {
    toggleArticleLike,
    getArticleLikeStatus,
    getMyLikedArticles,
    toggleProductFavorite,
    getProductFavoriteStatus,
    getMyFavoriteProducts,
    type UserInteractionResponse
} from '@/services/interactions';
import { useAuth } from '@/hooks/auth/useAuth'; // 添加认证检查
import type { ApiResponse, PageResponse } from '@/types/api';
import type { Article } from '@/types/article';
import type { Product } from '@/types/product';

// 文章点赞Hook - 修复版本
export const useArticleLike = (articleId: string) => {
    const { isAuthenticated } = useAuth(); // 获取认证状态
    const [status, setStatus] = useState<UserInteractionResponse>({ liked: false, likeCount: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 只有在用户已认证且有文章ID时才获取状态
        if (articleId && isAuthenticated) {
            fetchStatus();
        }
    }, [articleId, isAuthenticated]);

    const fetchStatus = async () => {
        try {
            const response = await getArticleLikeStatus(articleId);
            if (response.success) setStatus(response.data);
        } catch (error: any) {
            // 对于401错误，静默处理，不显示错误信息
            if (error.response?.status !== 401) {
                console.error('获取文章点赞状态失败:', error);
            }
        }
    };

    const toggle = async () => {
        if (loading) return;
        if (!isAuthenticated) {
            message.warning('请先登录后再操作');
            return;
        }

        setLoading(true);
        try {
            const response = await toggleArticleLike(articleId);
            if (response.success) {
                setStatus(response.data);
                message.success(response.data.liked ? '点赞成功' : '取消点赞成功');
            } else {
                message.error(response.message || '操作失败');
            }
        } catch (error) {
            console.error('切换文章点赞状态失败:', error);
            message.error('操作失败');
        } finally {
            setLoading(false);
        }
    };

    return {
        isLiked: status.liked || false,
        likeCount: status.likeCount || 0,
        loading,
        toggle
    };
};

// 商品收藏Hook - 修复版本
export const useProductFavorite = (productId: string) => {
    const { isAuthenticated } = useAuth(); // 获取认证状态
    const [status, setStatus] = useState<UserInteractionResponse>({ favorited: false, favoriteCount: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 只有在用户已认证且有商品ID时才获取状态
        if (productId && isAuthenticated) {
            fetchStatus();
        }
    }, [productId, isAuthenticated]);

    const fetchStatus = async () => {
        try {
            const response = await getProductFavoriteStatus(productId);
            if (response.success) setStatus(response.data);
        } catch (error: any) {
            // 对于401错误，静默处理，不显示错误信息
            if (error.response?.status !== 401) {
                console.error('获取商品收藏状态失败:', error);
            }
        }
    };

    const toggle = async () => {
        if (loading) return;
        if (!isAuthenticated) {
            message.warning('请先登录后再操作');
            return;
        }

        setLoading(true);
        try {
            const response = await toggleProductFavorite(productId);
            if (response.success) {
                setStatus(response.data);
                message.success(response.data.favorited ? '收藏成功' : '取消收藏成功');
            } else {
                message.error(response.message || '操作失败');
            }
        } catch (error) {
            console.error('切换商品收藏状态失败:', error);
            message.error('操作失败');
        } finally {
            setLoading(false);
        }
    };

    return {
        isFavorited: status.favorited || false,
        favoriteCount: status.favoriteCount || 0,
        loading,
        toggle
    };
};

// 用户交互列表Hook - 保持不变
export const useUserInteractions = () => {
    const [likedArticles, setLikedArticles] = useState<Article[]>([]);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [articlesLoading, setArticlesLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);
    const [articlesTotal, setArticlesTotal] = useState(0);
    const [productsTotal, setProductsTotal] = useState(0);

    const fetchLikedArticles = async (params: any = {}) => {
        setArticlesLoading(true);
        try {
            const response: ApiResponse<PageResponse<Article>> = await getMyLikedArticles(params);
            if (response.success) {
                setLikedArticles(response.data.content);
                setArticlesTotal(response.data.totalElements);
            }
        } catch (error) {
            console.error('获取收藏文章失败:', error);
            message.error('获取收藏文章失败');
        } finally {
            setArticlesLoading(false);
        }
    };

    const fetchFavoriteProducts = async (params: any = {}) => {
        setProductsLoading(true);
        try {
            const response: ApiResponse<PageResponse<Product>> = await getMyFavoriteProducts(params);
            if (response.success) {
                setFavoriteProducts(response.data.content);
                setProductsTotal(response.data.totalElements);
            }
        } catch (error) {
            console.error('获取收藏商品失败:', error);
            message.error('获取收藏商品失败');
        } finally {
            setProductsLoading(false);
        }
    };

    return {
        likedArticles,
        favoriteProducts,
        articlesLoading,
        productsLoading,
        articlesTotal,
        productsTotal,
        fetchLikedArticles,
        fetchFavoriteProducts
    };
};