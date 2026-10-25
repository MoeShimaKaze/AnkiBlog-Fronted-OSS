// src/App.tsx

import React, {Suspense} from 'react'
import {Route, Routes} from 'react-router-dom'
import {App as AntdApp, ConfigProvider} from 'antd'
import {useAppSelector} from './hooks/redux'

// 引入轻量级主题系统
import {LightweightThemeProvider} from './context/LightweightThemeContext'

// 1. 引入 AuthInitializer
import AuthInitializer from './components/Auth/AuthInitializer'

import {adminRoutes, publicRoutes, userRoutes} from './router'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AdminRoute from './components/Auth/AdminRoute'
import MainLayout from './components/Layout/MainLayout'
import AdminLayout from './components/Layout/AdminLayout'
import SimpleLayout from './components/Layout/SimpleLayout'
import NotFound from './pages/error/NotFound'
import ErrorBoundary from './components/UI/ErrorBoundary'
import Loading from './components/UI/Loading'

// 全局样式注入
const injectGlobalStyles = () => {
    const globalStyles = `
        .ant-table-thead > tr > th {
            background: transparent !important;
            color: var(--theme-text-primary) !important;
            border-bottom: 1px solid var(--theme-border) !important;
        }
        
        .ant-table-tbody > tr > td {
            background: transparent !important;
            border-bottom: 1px solid var(--theme-border) !important;
        }
        
        .ant-table-tbody > tr:hover > td {
            background: var(--theme-surface) !important;
        }
        
        .ant-form-item-label > label {
            color: var(--theme-text-primary) !important;
        }
        
        .ant-input, .ant-input-affix-wrapper, .ant-select-selector {
            background: var(--theme-surface) !important;
            border-color: var(--theme-border) !important;
            color: var(--theme-text-primary) !important;
        }
        
        .ant-input:focus, .ant-input-affix-wrapper:focus, .ant-select-focused .ant-select-selector {
            border-color: var(--theme-primary) !important;
            box-shadow: 0 0 0 2px rgba(var(--theme-primary-rgb), 0.3) !important;
        }
        
        .ant-btn-primary {
            background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)) !important;
            border: none !important;
        }
        
        .ant-pagination-item {
            background: var(--theme-surface) !important;
            border-color: var(--theme-border) !important;
        }
        
        .ant-pagination-item a {
            color: var(--theme-text-primary) !important;
        }
        
        .ant-pagination-item-active {
            background: var(--theme-primary) !important;
            border-color: var(--theme-primary) !important;
        }
        
        .ant-pagination-item-active a {
            color: #fff !important;
        }
        
        .ant-card {
            background: var(--theme-card-bg) !important;
            border-color: var(--theme-border) !important;
        }
        
        .ant-card-head {
            background: transparent !important;
            border-bottom-color: var(--theme-border) !important;
        }
        
        .ant-card-head-title {
            color: var(--theme-text-primary) !important;
        }
        
        .ant-menu-dark {
            background: transparent !important;
        }
        
        .ant-menu-dark .ant-menu-item-selected {
            background: var(--theme-primary) !important;
            background-opacity: 0.3 !important;
        }
        
        .ant-menu-dark .ant-menu-item:hover {
            background: var(--theme-surface) !important;
        }
    `

    const styleElement = document.createElement('style')
    styleElement.innerHTML = globalStyles
    document.head.appendChild(styleElement)

    return () => {
        if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement)
        }
    }
}

const App: React.FC = () => {
    const { theme } = useAppSelector(state => state.theme)

    // 注入全局样式
    React.useEffect(() => {
        return injectGlobalStyles()
    }, [])

    // 通用的页面标题参数
    const defaultPageTitleParams = {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    }

    return (
        <LightweightThemeProvider backgroundImage="/background_placeholder.png">
            <div className={`app ${theme}`}>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: 'var(--theme-primary)',
                            colorBgContainer: 'var(--theme-card-bg)',
                            colorBorder: 'var(--theme-border)',
                            colorText: 'var(--theme-text-primary)',
                        },
                    }}
                >
                    <AntdApp>
                        <ErrorBoundary>
                            {/* 2. 使用 AuthInitializer 包裹整个路由系统 */}
                            <AuthInitializer>
                                <Suspense fallback={
                                    <Loading
                                        fullScreen={true}
                                        size="large"
                                        tip="正在加载应用..."
                                        pageTitle="加载中"
                                        pageTitleParams={defaultPageTitleParams}
                                    />
                                }>
                                    <Routes>
                                        {/* 公开路由 */}
                                        {publicRoutes.map(route => (
                                            <Route
                                                key={route.path}
                                                path={route.path}
                                                element={
                                                    <Suspense fallback={
                                                        <Loading
                                                            fullScreen={true}
                                                            size="default"
                                                            tip="正在加载页面..."
                                                            pageTitle="页面加载中"
                                                            pageTitleParams={defaultPageTitleParams}
                                                        />
                                                    }>
                                                        {route.layout === 'simple' ? (
                                                            <SimpleLayout>{route.element}</SimpleLayout>
                                                        ) : (
                                                            <MainLayout>{route.element}</MainLayout>
                                                        )}
                                                    </Suspense>
                                                }
                                            />
                                        ))}

                                        {/* 用户路由 */}
                                        <Route
                                            path="/user/*"
                                            element={
                                                <ProtectedRoute>
                                                    <MainLayout>
                                                        <Suspense fallback={
                                                            <Loading
                                                                fullScreen={true}
                                                                size="default"
                                                                tip="正在加载用户页面..."
                                                                pageTitle="用户页面加载中"
                                                                pageTitleParams={defaultPageTitleParams}
                                                            />
                                                        }>
                                                            <Routes>
                                                                {userRoutes.map(route => (
                                                                    <Route
                                                                        key={route.path}
                                                                        path={route.path}
                                                                        element={
                                                                            <Suspense fallback={
                                                                                <Loading
                                                                                    fullScreen={true}
                                                                                    size="small"
                                                                                    tip="正在加载..."
                                                                                    pageTitle="加载中"
                                                                                    pageTitleParams={defaultPageTitleParams}
                                                                                />
                                                                            }>
                                                                                {route.element}
                                                                            </Suspense>
                                                                        }
                                                                    />
                                                                ))}
                                                            </Routes>
                                                        </Suspense>
                                                    </MainLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* 管理员路由 */}
                                        <Route
                                            path="/admin/*"
                                            element={
                                                <AdminRoute>
                                                    <AdminLayout>
                                                        <Suspense fallback={
                                                            <Loading
                                                                fullScreen={true}
                                                                size="default"
                                                                tip="正在加载管理页面..."
                                                                pageTitle="管理页面加载中"
                                                                pageTitleParams={defaultPageTitleParams}
                                                            />
                                                        }>
                                                            <Routes>
                                                                {adminRoutes.map(route => (
                                                                    <Route
                                                                        key={route.path}
                                                                        path={route.path}
                                                                        element={
                                                                            <Suspense fallback={
                                                                                <Loading
                                                                                    fullScreen={true}
                                                                                    size="small"
                                                                                    tip="正在加载..."
                                                                                    pageTitle="管理功能加载中"
                                                                                    pageTitleParams={defaultPageTitleParams}
                                                                                />
                                                                            }>
                                                                                {route.element}
                                                                            </Suspense>
                                                                        }
                                                                    />
                                                                ))}
                                                            </Routes>
                                                        </Suspense>
                                                    </AdminLayout>
                                                </AdminRoute>
                                            }
                                        />

                                        {/* 404页面 */}
                                        <Route
                                            path="*"
                                            element={
                                                <MainLayout>
                                                    <NotFound />
                                                </MainLayout>
                                            }
                                        />
                                    </Routes>
                                </Suspense>
                            </AuthInitializer>
                        </ErrorBoundary>
                    </AntdApp>
                </ConfigProvider>
            </div>
        </LightweightThemeProvider>
    )
}

export default App