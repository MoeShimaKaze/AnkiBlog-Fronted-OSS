import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as articleApi from '../../services/articles';
import type { Article, ArticleCreateRequest, ArticleUpdateRequest } from '@/types/article';

// 定义状态接口
interface ArticleState {
    articles: Article[];
    currentArticle: Article | null;
    total: number;
    loading: boolean;
    error: string | null;
}

// 初始状态
const initialState: ArticleState = {
    articles: [],
    currentArticle: null,
    total: 0,
    loading: false,
    error: null,
};

// 异步 thunk 操作
export const fetchArticles = createAsyncThunk(
    'article/fetchList',
    async (params: any) => {
        const response = await articleApi.getArticles(params);
        return response.data;
    }
);

export const fetchArticleBySlug = createAsyncThunk(
    'article/fetchBySlug',
    async (slug: string) => {
        const response = await articleApi.getArticleBySlug(slug);
        return response.data;
    }
);

export const fetchArticleById = createAsyncThunk(
    'article/fetchById',
    async (id: string) => {
        const response = await articleApi.getArticleById(id);
        return response.data;
    }
);

export const createArticle = createAsyncThunk(
    'article/create',
    async (data: ArticleCreateRequest) => {
        const response = await articleApi.createArticle(data);
        return response.data;
    }
);

export const updateArticle = createAsyncThunk(
    'article/update',
    async ({ id, data }: { id: string; data: ArticleUpdateRequest }) => {
        const response = await articleApi.updateArticle(id, data);
        return response.data;
    }
);

// 创建 slice
const articleSlice = createSlice({
    name: 'article',
    initialState,
    reducers: {
        clearCurrentArticle: (state) => {
            state.currentArticle = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // 处理 fetchArticles
            .addCase(fetchArticles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchArticles.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.articles = action.payload.content || [];
                state.total = action.payload.totalElements || 0;
            })
            .addCase(fetchArticles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '获取文章列表失败';
            })

            // 处理 fetchArticleBySlug
            .addCase(fetchArticleBySlug.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchArticleBySlug.fulfilled, (state, action: PayloadAction<Article>) => {
                state.loading = false;
                state.currentArticle = action.payload;
            })
            .addCase(fetchArticleBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '获取文章详情失败';
            })

            // 处理 fetchArticleById
            .addCase(fetchArticleById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchArticleById.fulfilled, (state, action: PayloadAction<Article>) => {
                state.loading = false;
                state.currentArticle = action.payload;
            })
            .addCase(fetchArticleById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '获取文章详情失败';
            })

            // 处理 createArticle
            .addCase(createArticle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createArticle.fulfilled, (state, action: PayloadAction<Article>) => {
                state.loading = false;
                state.currentArticle = action.payload;
                // 添加到文章列表开头
                state.articles.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createArticle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '创建文章失败';
            })

            // 处理 updateArticle
            .addCase(updateArticle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateArticle.fulfilled, (state, action: PayloadAction<Article>) => {
                state.loading = false;
                state.currentArticle = action.payload;
                // 更新文章列表中的对应项
                const index = state.articles.findIndex(article => article.id === action.payload.id);
                if (index !== -1) {
                    state.articles[index] = action.payload;
                }
            })
            .addCase(updateArticle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '更新文章失败';
            });
    },
});

export const { clearCurrentArticle, clearError } = articleSlice.actions;
export default articleSlice.reducer;