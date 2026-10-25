import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api'

interface SearchState {
    keyword: string;
    results: {
        articles: any[];
        products: any[];
        matchedTags: any[];
        summary: any;
    };
    loading: boolean;
    history: string[];
}

const initialState: SearchState = {
    keyword: '',
    results: {
        articles: [],
        products: [],
        matchedTags: [],
        summary: null
    },
    loading: false,
    history: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
};

export const performSearch = createAsyncThunk(
    'search/performSearch',
    async (keyword: string) => {
        const response = await api.get(`/public/search?query=${encodeURIComponent(keyword)}&type=ALL`);
        return response.data;
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setKeyword: (state, action) => {
            state.keyword = action.payload;
        },
        addToHistory: (state, action) => {
            const keyword = action.payload;
            if (keyword && !state.history.includes(keyword)) {
                state.history.unshift(keyword);
                state.history = state.history.slice(0, 10);
                localStorage.setItem('searchHistory', JSON.stringify(state.history));
            }
        },
        clearHistory: (state) => {
            state.history = [];
            localStorage.removeItem('searchHistory');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(performSearch.pending, (state) => {
                state.loading = true;
            })
            .addCase(performSearch.fulfilled, (state, action) => {
                state.loading = false;
                state.results = {
                    articles: action.payload.articles?.content || [],
                    products: action.payload.products?.content || [],
                    matchedTags: action.payload.matchedTags || [],
                    summary: action.payload.summary
                };
            })
            .addCase(performSearch.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setKeyword, addToHistory, clearHistory } = searchSlice.actions;
export default searchSlice.reducer;