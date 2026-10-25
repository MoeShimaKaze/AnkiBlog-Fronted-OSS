// src/hooks/customPage/useCustomPages.ts
import { useState, useEffect } from 'react';
import { CustomPage } from '@/types/customPage';
import { getPublishedPages, getFeaturedPages, getMenuPages } from '@/services/customPageService';

export const useCustomPages = () => {
    const [pages, setPages] = useState<CustomPage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPages = async (params?: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPublishedPages(params || {});
            if (response.success) {
                setPages(response.data.content);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    return { pages, loading, error, refetch: fetchPages };
};

export const useFeaturedPages = () => {
    const [featuredPages, setFeaturedPages] = useState<CustomPage[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFeatured = async () => {
            setLoading(true);
            try {
                const response = await getFeaturedPages();
                if (response.success) {
                    setFeaturedPages(response.data);
                }
            } catch (error) {
                console.error('获取推荐页面失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    return { featuredPages, loading };
};

export const useMenuPages = () => {
    const [menuPages, setMenuPages] = useState<CustomPage[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const response = await getMenuPages();
            if (response.success) {
                setMenuPages(response.data);
            }
        } catch (error) {
            console.error('获取菜单页面失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    return { menuPages, loading, refetch: fetchMenu };
};