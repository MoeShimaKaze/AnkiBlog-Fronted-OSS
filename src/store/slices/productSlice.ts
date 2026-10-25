import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as productApi from '../../services/products';
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '@/types/product';

// 定义状态接口
interface ProductState {
    products: Product[];
    currentProduct: Product | null;
    total: number;
    loading: boolean;
    error: string | null;
}

// 初始状态
const initialState: ProductState = {
    products: [],
    currentProduct: null,
    total: 0,
    loading: false,
    error: null,
};

// 异步 thunk 操作
export const fetchProducts = createAsyncThunk(
    'product/fetchList',
    async (params: any) => {
        const response = await productApi.getProducts(params);
        return response.data;
    }
);

export const fetchProductBySlug = createAsyncThunk(
    'product/fetchBySlug',
    async (slug: string) => {
        const response = await productApi.getProductBySlug(slug);
        return response.data;
    }
);

export const fetchProductById = createAsyncThunk(
    'product/fetchById',
    async (id: string) => {
        const response = await productApi.getProductById(id);
        return response.data;
    }
);

export const createProduct = createAsyncThunk(
    'product/create',
    async (data: ProductCreateRequest) => {
        const response = await productApi.createProduct(data);
        return response.data;
    }
);

export const updateProduct = createAsyncThunk(
    'product/update',
    async ({ id, data }: { id: string; data: ProductUpdateRequest }) => {
        const response = await productApi.updateProduct(id, data);
        return response.data;
    }
);

// 创建 slice
const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // 处理 fetchProducts
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.products = action.payload.content || [];
                state.total = action.payload.totalElements || 0;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '获取商品列表失败';
            })

            // 处理 fetchProductBySlug
            .addCase(fetchProductBySlug.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductBySlug.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '获取商品详情失败';
            })

            // 处理 fetchProductById
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '获取商品详情失败';
            })

            // 处理 createProduct
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                state.currentProduct = action.payload;
                // 添加到商品列表开头
                state.products.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '创建商品失败';
            })

            // 处理 updateProduct
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                state.currentProduct = action.payload;
                // 更新商品列表中的对应项
                const index = state.products.findIndex(product => product.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '更新商品失败';
            });
    },
});

export const { clearCurrentProduct, clearError } = productSlice.actions;
export default productSlice.reducer;