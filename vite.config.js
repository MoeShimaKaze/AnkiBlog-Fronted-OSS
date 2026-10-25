    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import path from 'path'

    export default defineConfig({
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 443,
            host: true, // 允许外部访问
            headers: {
                'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws:;"
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: false,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom', 'react-router-dom'],
                        antd: ['antd', '@ant-design/icons'],
                        utils: ['axios', 'dayjs', 'lodash'],
                        markdown: ['react-markdown', 'rehype-highlight', 'remark-gfm'],
                    },
                    // 静态资源命名
                    assetFileNames: (assetInfo) => {
                        const info = assetInfo.name.split('.');
                        const extType = info[info.length - 1];
                        if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
                            return `media/[name]-[hash][extname]`;
                        }
                        if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/i.test(assetInfo.name)) {
                            return `images/[name]-[hash][extname]`;
                        }
                        if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
                            return `fonts/[name]-[hash][extname]`;
                        }
                        return `assets/[name]-[hash][extname]`;
                    },
                    chunkFileNames: 'js/[name]-[hash].js',
                    entryFileNames: 'js/[name]-[hash].js',
                },
            },
            // 构建优化
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true, // 生产环境移除console
                    drop_debugger: true,
                },
            },
            // 静态资源处理
            assetsInlineLimit: 4096, // 小于4kb的资源内联
            // 分包大小限制
            chunkSizeWarningLimit: 1000,
        },
        // PWA 相关文件复制
        publicDir: 'public',
        // 环境变量前缀
        envPrefix: 'VITE_',
        // CSS 配置
        css: {
            modules: {
                scopeBehaviour: 'local',
                generateScopedName: '[name]__[local]___[hash:base64:5]'
            },
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "@/styles/variables.scss";`
                }
            }
        },
        // 优化依赖预构建
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react-router-dom',
                'antd',
                '@ant-design/icons',
                'axios',
                'dayjs',
                'lodash',
            ],
            exclude: ['@vite/client', '@vite/env'],
        },
        // 静态资源基础路径
        base: '/',
        // 预览服务器配置
        preview: {
            port: 3000,
            host: true,
            strictPort: true,
        },
        // 定义全局常量
        define: {
            __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
            __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        },
        // Vite插件配置
        esbuild: {
            // 移除生产环境的console和debugger
            drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
        },
        // 工作线程配置
        worker: {
            format: 'es',
        },
    })