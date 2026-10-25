import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import themeSlice from './slices/themeSlice'
import articleSlice from './slices/articleSlice'
import productSlice from './slices/productSlice'
import searchSlice from './slices/searchSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        theme: themeSlice,
        article: articleSlice,
        product: productSlice,
        search: searchSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch