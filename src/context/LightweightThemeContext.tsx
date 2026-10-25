// context/LightweightThemeContext.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useLightweightTheme } from '../hooks/useLightweightTheme'

interface ThemeContextType {
    colors: {
        primary: string
        secondary: string
        accent: string
        isDark: boolean
    }
    styles: {
        background: string
        cardBackground: string
        sidebarBackground: string
        surface: string
        textPrimary: string
        textSecondary: string
        overlay: string
        border: string
    }
    isLoading: boolean
    updateThemeFromImage: (imageUrl: string) => Promise<void>
}

const LightweightThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
    children: ReactNode
    backgroundImage?: string
}

export const LightweightThemeProvider: React.FC<ThemeProviderProps> = ({
                                                                           children,
                                                                           backgroundImage
                                                                       }) => {
    const theme = useLightweightTheme()

    useEffect(() => {
        if (backgroundImage) {
            theme.updateThemeFromImage(backgroundImage)
        }
    }, [backgroundImage, theme.updateThemeFromImage])

    // 注入CSS变量
    useEffect(() => {
        const root = document.documentElement
        root.style.setProperty('--theme-primary', theme.colors.primary)
        root.style.setProperty('--theme-secondary', theme.colors.secondary)
        root.style.setProperty('--theme-accent', theme.colors.accent)
        root.style.setProperty('--theme-background', theme.styles.background)
        root.style.setProperty('--theme-card-bg', theme.styles.cardBackground)
        root.style.setProperty('--theme-sidebar-bg', theme.styles.sidebarBackground)
        root.style.setProperty('--theme-surface', theme.styles.surface)
        root.style.setProperty('--theme-text-primary', theme.styles.textPrimary)
        root.style.setProperty('--theme-text-secondary', theme.styles.textSecondary)
        root.style.setProperty('--theme-overlay', theme.styles.overlay)
        root.style.setProperty('--theme-border', theme.styles.border)
    }, [theme.colors, theme.styles])

    return (
        <LightweightThemeContext.Provider value={theme}>
            {children}
        </LightweightThemeContext.Provider>
    )
}

export const useLightweightThemeContext = () => {
    const context = useContext(LightweightThemeContext)
    if (!context) {
        throw new Error('useLightweightThemeContext must be used within LightweightThemeProvider')
    }
    return context
}

// 样式生成工具
export const createThemeStyles = (theme: ThemeContextType) => ({
    card: {
        background: theme.styles.cardBackground,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.styles.border}`,
        borderRadius: '16px',
        boxShadow: `0 8px 32px ${theme.styles.overlay}`,
        color: theme.styles.textPrimary,
        transition: 'all 0.3s ease'
    },

    sidebar: {
        background: theme.styles.sidebarBackground,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${theme.styles.border}`,
        borderRadius: '12px',
        boxShadow: `4px 0 20px ${theme.styles.overlay}`
    },

    button: {
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
        border: 'none',
        borderRadius: '8px',
        color: theme.styles.textPrimary,
        boxShadow: `0 4px 16px ${theme.styles.overlay}`,
        transition: 'all 0.2s ease'
    },

    statCard: {
        background: `linear-gradient(135deg, ${theme.styles.cardBackground}, ${theme.styles.surface})`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.styles.border}`,
        borderRadius: '16px',
        boxShadow: `0 8px 32px ${theme.styles.overlay}`,
        padding: '24px',
        transition: 'all 0.3s ease'
    },

    overlay: {
        background: theme.styles.background,
        backdropFilter: 'blur(2px)'
    }
})