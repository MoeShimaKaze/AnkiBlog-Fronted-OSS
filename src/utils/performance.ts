// src/utils/performance.ts

/**
 * 性能数据接口
 */
interface PerformanceData {
    dnsLookup: number
    tcpConnection: number
    requestResponse: number
    domParsing: number
    resourceLoading: number
    totalLoadTime: number
    domInteractive: number
    firstContentfulPaint?: number
    largestContentfulPaint?: number
}

/**
 * 获取页面加载性能数据
 */
export function getPerformanceData(): PerformanceData | null {
    try {
        const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
        const perfData = perfEntries[0]

        if (!perfData) {
            return null
        }

        return {
            dnsLookup: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
            tcpConnection: Math.round(perfData.connectEnd - perfData.connectStart),
            requestResponse: Math.round(perfData.responseEnd - perfData.requestStart),
            domParsing: Math.round(perfData.domContentLoadedEventEnd - perfData.responseEnd),
            resourceLoading: Math.round(perfData.loadEventStart - perfData.domContentLoadedEventEnd),
            totalLoadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
            domInteractive: Math.round(perfData.domInteractive - perfData.fetchStart),
        }
    } catch (error) {
        console.warn('获取性能数据失败:', error)
        return null
    }
}

/**
 * 获取 Core Web Vitals 数据
 */
export function getCoreWebVitals(): Promise<{
    fcp?: number
    lcp?: number
    fid?: number
    cls?: number
}> {
    return new Promise((resolve) => {
        const vitals: any = {}

        // First Contentful Paint (FCP)
        try {
            const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry
            if (fcpEntry) {
                vitals.fcp = Math.round(fcpEntry.startTime)
            }
        } catch (error) {
            console.warn('获取 FCP 失败:', error)
        }

        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries()
                    const lastEntry = entries[entries.length - 1] as any
                    if (lastEntry) {
                        vitals.lcp = Math.round(lastEntry.startTime)
                    }
                })
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

                // 5秒后停止观察并返回结果
                setTimeout(() => {
                    lcpObserver.disconnect()
                    resolve(vitals)
                }, 5000)
            } catch (error) {
                console.warn('获取 LCP 失败:', error)
                resolve(vitals)
            }
        } else {
            resolve(vitals)
        }
    })
}

/**
 * 监控资源加载性能
 */
export function monitorResourcePerformance() {
    if (!('PerformanceObserver' in window)) {
        return
    }

    try {
        const resourceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()

            entries.forEach((entry) => {
                const resource = entry as PerformanceResourceTiming

                // 只监控关键资源
                if (resource.name.includes('.js') ||
                    resource.name.includes('.css') ||
                    resource.name.includes('.woff')) {

                    const loadTime = resource.responseEnd - resource.startTime

                    if (loadTime > 1000) { // 超过1秒的资源
                        console.warn(`🐌 资源加载较慢: ${resource.name.split('/').pop()} (${Math.round(loadTime)}ms)`)
                    }
                }
            })
        })

        resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
        console.warn('资源性能监控初始化失败:', error)
    }
}

/**
 * 输出性能报告
 */
export function logPerformanceReport() {
    const perfData = getPerformanceData()

    if (!perfData) {
        console.warn('无法获取性能数据')
        return
    }

    console.group('📊 页面加载性能报告')

    // 基础性能数据
    console.table({
        'DNS查询': `${perfData.dnsLookup}ms`,
        'TCP连接': `${perfData.tcpConnection}ms`,
        '请求响应': `${perfData.requestResponse}ms`,
        'DOM解析': `${perfData.domParsing}ms`,
        '资源加载': `${perfData.resourceLoading}ms`,
        'DOM交互': `${perfData.domInteractive}ms`,
        '总加载时间': `${perfData.totalLoadTime}ms`
    })

    // 性能评级
    const grade = getPerformanceGrade(perfData.totalLoadTime)
    console.log(`🎯 性能评级: ${grade.emoji} ${grade.text}`)

    // Core Web Vitals
    getCoreWebVitals().then((vitals) => {
        if (Object.keys(vitals).length > 0) {
            console.group('🎨 Core Web Vitals')
            if (vitals.fcp) console.log(`First Contentful Paint: ${vitals.fcp}ms`)
            if (vitals.lcp) console.log(`Largest Contentful Paint: ${vitals.lcp}ms`)
            console.groupEnd()
        }
    })

    console.groupEnd()
}

/**
 * 获取性能评级
 */
function getPerformanceGrade(loadTime: number): { emoji: string; text: string } {
    if (loadTime < 1000) {
        return { emoji: '🚀', text: '优秀 (< 1s)' }
    } else if (loadTime < 2000) {
        return { emoji: '✅', text: '良好 (1-2s)' }
    } else if (loadTime < 3000) {
        return { emoji: '⚠️', text: '一般 (2-3s)' }
    } else {
        return { emoji: '🐌', text: '需要优化 (> 3s)' }
    }
}

/**
 * 监控页面可见性变化
 */
export function monitorVisibilityChange() {
    let startTime = performance.now()
    let totalVisibleTime = 0

    const handleVisibilityChange = () => {
        if (document.hidden) {
            // 页面隐藏
            totalVisibleTime += performance.now() - startTime
        } else {
            // 页面显示
            startTime = performance.now()
        }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 页面卸载时记录总的可见时间
    window.addEventListener('beforeunload', () => {
        if (!document.hidden) {
            totalVisibleTime += performance.now() - startTime
        }
        console.log(`👁️ 页面总可见时间: ${Math.round(totalVisibleTime / 1000)}s`)
    })
}

/**
 * 内存使用监控
 */
export function monitorMemoryUsage() {
    if ('memory' in performance) {
        const memory = (performance as any).memory

        setInterval(() => {
            const used = Math.round(memory.usedJSHeapSize / 1048576) // MB
            // @ts-ignore
            const total = Math.round(memory.totalJSHeapSize / 1048576) // MB
            const limit = Math.round(memory.jsHeapSizeLimit / 1048576) // MB

            // 内存使用超过80%时警告
            if (used / limit > 0.8) {
                console.warn(`🧠 内存使用率较高: ${used}MB / ${limit}MB (${Math.round(used / limit * 100)}%)`)
            }
        }, 30000) // 每30秒检查一次
    }
}

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring() {
    // 等待页面加载完成后开始监控
    window.addEventListener('load', () => {
        setTimeout(() => {
            logPerformanceReport()
            monitorResourcePerformance()
            monitorVisibilityChange()
            monitorMemoryUsage()
        }, 100)
    })
}