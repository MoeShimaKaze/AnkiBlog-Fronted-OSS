// AnkiBlog Service Worker
const CACHE_NAME = 'ankiblog-v1.0.0';
const API_CACHE_NAME = 'ankiblog-api-v1.0.0';
const IMAGE_CACHE_NAME = 'ankiblog-images-v1.0.0';

// 需要缓存的静态资源（移除可能不存在的文件）
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/favicon.svg',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/apple-touch-icon.png'
    // 移除 /manifest.json 和 /offline.html，如果不存在的话
];

// 可选的静态资源（可能存在也可能不存在）
const OPTIONAL_ASSETS = [
    '/manifest.json',
    '/offline.html'
];

// Service Worker 安装事件
self.addEventListener('install', (event) => {
    console.log('[SW] 正在安装 Service Worker');

    event.waitUntil(
        Promise.all([
            // 缓存静态资源
            cacheStaticAssets(),
            // 强制激活新的 Service Worker
            self.skipWaiting()
        ])
    );
});

// 缓存静态资源的函数，包含错误处理
async function cacheStaticAssets() {
    const cache = await caches.open(CACHE_NAME);

    // 缓存必需的资源
    try {
        await cache.addAll(STATIC_ASSETS);
        console.log('[SW] 必需资源缓存成功');
    } catch (error) {
        console.error('[SW] 必需资源缓存失败:', error);
        // 逐个尝试缓存，跳过失败的
        for (const asset of STATIC_ASSETS) {
            try {
                await cache.add(asset);
            } catch (e) {
                console.warn('[SW] 跳过资源:', asset, e.message);
            }
        }
    }

    // 缓存可选资源
    for (const asset of OPTIONAL_ASSETS) {
        try {
            await cache.add(asset);
            console.log('[SW] 可选资源缓存成功:', asset);
        } catch (e) {
            console.warn('[SW] 可选资源不存在，跳过:', asset);
        }
    }
}

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
    console.log('[SW] 正在激活 Service Worker');

    event.waitUntil(
        Promise.all([
            // 清理旧缓存
            cleanupOldCaches(),
            // 立即接管所有客户端
            self.clients.claim()
        ])
    );
});

// 清理旧缓存
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const validCaches = [CACHE_NAME, API_CACHE_NAME, IMAGE_CACHE_NAME];

    return Promise.all(
        cacheNames
            .filter(cacheName => !validCaches.includes(cacheName))
            .map(cacheName => {
                console.log('[SW] 删除旧缓存:', cacheName);
                return caches.delete(cacheName);
            })
    );
}

// 其余代码保持不变...
const API_CACHE_PATTERNS = [
    /^\/api\/public\/articles/,
    /^\/api\/public\/products/,
    /^\/api\/public\/pages/
];

const IMAGE_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    /\/uploads\//,
    /\/images\//
];

const JS_MODULE_PATTERNS = [
    /\.js$/,
    /\.mjs$/,
    /\.jsx$/,
    /\/assets\/.*\.js$/,
    /\/src\/.*\.js$/,
    /\/__vite_ping$/,
    /\/@vite\//,
    /\/@fs\//,
    /\/node_modules\//
];

// 请求拦截
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;
    if (url.protocol === 'chrome-extension:') return;
    if (url.pathname.includes('/@vite/') ||
        url.pathname.includes('/@fs/') ||
        url.pathname.includes('/__vite_ping') ||
        url.pathname.includes('/node_modules/')) return;

    if (isJavaScriptModule(url)) {
        console.log('[SW] 跳过JS模块:', url.pathname);
        return;
    }

    if (isStaticAsset(url)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isApiRequest(url)) {
        event.respondWith(handleApiRequest(request));
    } else if (isImageRequest(url)) {
        event.respondWith(handleImageRequest(request));
    } else if (isNavigationRequest(request)) {
        event.respondWith(handleNavigationRequest(request));
    }
});

function isJavaScriptModule(url) {
    return JS_MODULE_PATTERNS.some(pattern => pattern.test(url.pathname)) ||
        url.searchParams.has('import') ||
        url.searchParams.has('t') ||
        url.pathname.includes('/assets/') && url.pathname.endsWith('.js')
}

function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.pathname === asset) ||
        url.pathname.startsWith('/icons/') ||
        (url.pathname.endsWith('.css') && !url.pathname.includes('/assets/'))
}

function isApiRequest(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isImageRequest(url) {
    return IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isNavigationRequest(request) {
    return request.mode === 'navigate';
}

async function handleStaticAsset(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            fetch(request).then(response => {
                if (response.ok) {
                    cache.put(request, response.clone());
                }
            }).catch(() => {});

            return cachedResponse;
        }

        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;

    } catch (error) {
        console.error('[SW] 静态资源请求失败:', error);

        if (request.destination === 'document') {
            const cache = await caches.open(CACHE_NAME);
            const offlinePage = await cache.match('/offline.html');
            if (offlinePage) {
                return offlinePage;
            }
            // 如果没有离线页面，返回缓存的首页
            return cache.match('/');
        }

        return new Response('网络错误', { status: 408 });
    }
}

async function handleApiRequest(request) {
    try {
        const response = await fetch(request);

        if (response.ok && request.method === 'GET') {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, response.clone());
        }

        return response;

    } catch (error) {
        console.log('[SW] API网络请求失败，尝试缓存:', request.url);

        const cache = await caches.open(API_CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        return new Response(
            JSON.stringify({
                success: false,
                message: '网络连接不可用，请稍后重试',
                offline: true
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

async function handleImageRequest(request) {
    try {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;

    } catch (error) {
        console.error('[SW] 图片请求失败:', error);
        return new Response('', { status: 404 });
    }
}

async function handleNavigationRequest(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.log('[SW] 导航请求失败，返回缓存的首页');

        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/');

        if (cachedIndex) {
            return cachedIndex;
        }

        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }

        // 最后的兜底方案
        return new Response('离线模式', {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// 其他事件监听器保持不变...
self.addEventListener('sync', (event) => {
    console.log('[SW] 后台同步事件:', event.tag);
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        console.log('[SW] 执行后台同步任务');
    } catch (error) {
        console.error('[SW] 后台同步失败:', error);
    }
}

self.addEventListener('push', (event) => {
    console.log('[SW] 收到推送消息');

    const options = {
        body: '您有新的内容更新',
        icon: '/favicon-32x32.png',
        badge: '/favicon-16x16.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || 'AnkiBlog';
    }

    event.waitUntil(
        self.registration.showNotification('AnkiBlog', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] 通知被点击:', event.notification.tag);
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});

self.addEventListener('message', (event) => {
    console.log('[SW] 收到消息:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});

self.addEventListener('error', (event) => {
    console.error('[SW] Service Worker 错误:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] 未处理的 Promise 拒绝:', event.reason);
});

console.log('[SW] Service Worker 已加载');