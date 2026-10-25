// useSearch.ts - 更新搜索Hook
import { useState, useEffect } from 'react';
import { useDebounce } from '../common/useDebounce';
import api from '@/services/api'

interface SearchResult {
    articles: any[];
    products: any[];
    matchedTags: any[];
    summary: any;
}

export const useSearch = (initialKeyword = '', delay = 500) => {
    const [keyword, setKeyword] = useState(initialKeyword);
    const [results, setResults] = useState<SearchResult>({
        articles: [],
        products: [],
        matchedTags: [],
        summary: null
    });
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const debouncedKeyword = useDebounce(keyword, delay);

    useEffect(() => {
        if (debouncedKeyword.trim()) {
            performSearch(debouncedKeyword);
        } else {
            setResults({ articles: [], products: [], matchedTags: [], summary: null });
            setTotal(0);
        }
    }, [debouncedKeyword]);

    const performSearch = async (searchKeyword: string): Promise<void> => {
        setLoading(true);
        try {
            const response = await api.get(`/public/search?query=${encodeURIComponent(searchKeyword)}&type=ALL`);

            if (response.data) {
                const data = response.data;
                setResults({
                    articles: data.articles?.content || [],
                    products: data.products?.content || [],
                    matchedTags: data.matchedTags || [],
                    summary: data.summary
                });
                setTotal((data.articles?.content?.length || 0) + (data.products?.content?.length || 0));
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        keyword,
        setKeyword,
        results,
        loading,
        total,
        search: performSearch,
    };
};