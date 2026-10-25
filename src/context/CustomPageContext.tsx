// src/context/CustomPageContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CustomPage } from '@/types/customPage';

interface CustomPageState {
    pages: CustomPage[];
    featuredPages: CustomPage[];
    menuPages: CustomPage[];
    loading: boolean;
    error: string | null;
}

type CustomPageAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_PAGES'; payload: CustomPage[] }
    | { type: 'SET_FEATURED_PAGES'; payload: CustomPage[] }
    | { type: 'SET_MENU_PAGES'; payload: CustomPage[] }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'ADD_PAGE'; payload: CustomPage }
    | { type: 'UPDATE_PAGE'; payload: CustomPage }
    | { type: 'REMOVE_PAGE'; payload: string };

const initialState: CustomPageState = {
    pages: [],
    featuredPages: [],
    menuPages: [],
    loading: false,
    error: null
};

const customPageReducer = (state: CustomPageState, action: CustomPageAction): CustomPageState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_PAGES':
            return { ...state, pages: action.payload };
        case 'SET_FEATURED_PAGES':
            return { ...state, featuredPages: action.payload };
        case 'SET_MENU_PAGES':
            return { ...state, menuPages: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'ADD_PAGE':
            return { ...state, pages: [...state.pages, action.payload] };
        case 'UPDATE_PAGE':
            return {
                ...state,
                pages: state.pages.map(p => p.id === action.payload.id ? action.payload : p)
            };
        case 'REMOVE_PAGE':
            return {
                ...state,
                pages: state.pages.filter(p => p.id !== action.payload)
            };
        default:
            return state;
    }
};

const CustomPageContext = createContext<{
    state: CustomPageState;
    dispatch: React.Dispatch<CustomPageAction>;
} | null>(null);

export const CustomPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(customPageReducer, initialState);

    return (
        <CustomPageContext.Provider value={{ state, dispatch }}>
            {children}
        </CustomPageContext.Provider>
    );
};

export const useCustomPageContext = () => {
    const context = useContext(CustomPageContext);
    if (!context) {
        throw new Error('useCustomPageContext must be used within a CustomPageProvider');
    }
    return context;
};