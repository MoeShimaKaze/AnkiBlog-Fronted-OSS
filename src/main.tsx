// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import App from './App'
import { store } from './store'
import './styles/globals.css'
import './styles/base.css'
import './styles/markdown.css'
import './styles/custom-page.css'
import './styles/mobile.css'
import './styles/antd-dark.css'
import './styles/admin-responsive.css'
import 'antd/dist/reset.css';

// Service Worker 相关导入
import {
    registerSW,
    handleSWUpdate,
    setupSWMessageListener,
    setupPWAInstallPrompt
} from './utils/serviceWorker'

// 性能监控工具导入
import { initPerformanceMonitoring } from './utils/performance'

// 设置 dayjs 中文本地化
dayjs.locale('zh-cn')

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <HelmetProvider>
                    <ConfigProvider locale={zhCN}>
                        <App />
                    </ConfigProvider>
                </HelmetProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)

// 检查是否为生产环境或启用了 Service Worker
const isProduction = import.meta.env.MODE === 'production'
const isDevelopment = import.meta.env.MODE === 'development'
const enableSW = import.meta.env.VITE_ENABLE_SW === 'true'

// 注册 Service Worker（仅在生产环境或启用SW时）
if (isProduction || enableSW) {
    registerSW({
        onSuccess: (_registration) => {
            console.log('[SW] Service Worker 注册成功');
        },
        onUpdate: (registration) => {
            console.log('[SW] 检测到新版本');
            handleSWUpdate(registration);
        },
        onOfflineReady: () => {
            console.log('[SW] 应用已准备好离线使用');
            // 可以在这里显示离线就绪的通知
        }
    });

    // 设置 Service Worker 消息监听
    setupSWMessageListener();

    // 设置 PWA 安装提示
    setupPWAInstallPrompt();
}

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('[Global] 未捕获的错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global] 未处理的 Promise 拒绝:', event.reason);
});

// 性能监控（开发环境）
if (isDevelopment) {
    initPerformanceMonitoring()
}

// 应用信息输出（开发环境）
if (isDevelopment) {
    const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
    const appMode = import.meta.env.MODE
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

    console.log(`
🎉 AnkiBlog 前端应用启动成功！

📱 应用信息:
   - 版本: ${appVersion}
   - 环境: ${appMode}
   - API地址: ${apiBaseUrl}
   - Service Worker: ${enableSW ? '启用' : '禁用'}

🛠 开发工具:
   - React DevTools
   - Redux DevTools  
   - Vite HMR

📚 文档地址:
   - 项目文档: https://ankiblog.com/docs
   - API文档: https://ankiblog.com/api-docs
  `);
}
