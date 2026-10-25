// src/components/UI/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'
import { Result, Button } from 'antd'

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // 过滤掉一些不需要显示错误边界的错误
        const ignoredErrors = [
            'Loading chunk',
            'Loading CSS chunk',
            'ChunkLoadError',
            'Failed to fetch dynamically imported module',
            'Network request failed'
        ]

        const shouldIgnore = ignoredErrors.some(ignoredError =>
            error.message?.includes(ignoredError) || error.name?.includes(ignoredError)
        )

        if (shouldIgnore) {
            // 对于这些错误，我们不显示错误边界，而是尝试重新加载页面
            console.warn('[ErrorBoundary] 检测到懒加载错误，尝试重新加载:', error)
            window.location.reload()
            return { hasError: false }
        }

        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] 捕获到错误:', error, errorInfo)

        // 调用外部错误处理函数
        this.props.onError?.(error, errorInfo)

        // 记录错误信息到状态
        this.setState({ errorInfo })

        // 在生产环境上报错误
        if (import.meta.env.PROD) {
            this.reportError(error, errorInfo)
        }
    }

    reportError = (error: Error, errorInfo: ErrorInfo) => {
        // 实现错误上报逻辑
        try {
            fetch('/api/errors/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    userId: localStorage.getItem('userId') || 'anonymous'
                }),
            }).catch(console.error)
        } catch (reportError) {
            console.error('[ErrorBoundary] 错误上报失败:', reportError)
        }
    }

    handleReload = () => {
        window.location.reload()
    }

    handleGoHome = () => {
        window.location.href = '/'
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            const isChunkError = this.state.error?.message?.includes('Loading chunk') ||
                this.state.error?.message?.includes('ChunkLoadError')

            return (
                <div className="flex items-center justify-center min-h-screen p-4">
                    <Result
                        status="500"
                        title={isChunkError ? "页面加载失败" : "页面出错了"}
                        subTitle={
                            isChunkError
                                ? "可能是网络问题或应用更新了，请刷新页面重试。"
                                : "抱歉，页面发生了错误。请刷新页面重试，或返回首页。"
                        }
                        extra={
                            <div className="space-x-2">
                                {isChunkError ? (
                                    <Button type="primary" onClick={this.handleReload}>
                                        刷新页面
                                    </Button>
                                ) : (
                                    <>
                                        <Button type="primary" onClick={this.handleRetry}>
                                            重试
                                        </Button>
                                        <Button onClick={this.handleReload}>
                                            刷新页面
                                        </Button>
                                        <Button onClick={this.handleGoHome}>
                                            返回首页
                                        </Button>
                                    </>
                                )}
                            </div>
                        }
                    />

                    {/* 开发环境显示详细错误信息 */}
                    {import.meta.env.DEV && this.state.error && (
                        <details className="mt-4 max-w-2xl">
                            <summary className="cursor-pointer text-red-600 font-medium">
                                开发调试信息 (仅开发环境可见)
                            </summary>
                            <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-sm">
                                <div className="font-semibold">错误信息:</div>
                                <div className="text-red-700 mb-2">{this.state.error.message}</div>

                                <div className="font-semibold">错误堆栈:</div>
                                <pre className="text-xs text-red-600 overflow-auto">
                                    {this.state.error.stack}
                                </pre>

                                {this.state.errorInfo && (
                                    <>
                                        <div className="font-semibold mt-2">组件堆栈:</div>
                                        <pre className="text-xs text-red-600 overflow-auto">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </>
                                )}
                            </div>
                        </details>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary