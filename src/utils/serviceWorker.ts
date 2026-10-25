// src/utils/serviceWorker.ts

/**
 * Service Worker 配置接口
 */
export interface ServiceWorkerConfig {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
    onOfflineReady?: () => void;
}

/**
 * 检查是否为本地环境
 */
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * 注册 Service Worker
 */
export function registerSW(config?: ServiceWorkerConfig) {
    if (!('serviceWorker' in navigator)) {
        console.warn('[SW] 当前浏览器不支持 Service Worker');
        return;
    }

    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
        console.warn('[SW] Service Worker 不能在不同域名下工作');
        return;
    }

    window.addEventListener('load', () => {
        const swUrl = `${import.meta.env.BASE_URL}sw.js`;

        if (isLocalhost) {
            checkValidServiceWorker(swUrl, config);

            navigator.serviceWorker.ready.then(() => {
                console.log('[SW] 应用由 Service Worker 提供服务 (开发模式)');
            });
        } else {
            registerValidSW(swUrl, config);
        }
    });
}

/**
 * 注册有效的 Service Worker
 */
function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            console.log('[SW] Service Worker 注册成功:', registration);

            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (!installingWorker) return;

                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            console.log('[SW] 新内容可用，将在所有标签页关闭后使用');
                            config?.onUpdate?.(registration);
                        } else {
                            console.log('[SW] 内容已缓存以供离线使用');
                            config?.onSuccess?.(registration);
                            config?.onOfflineReady?.();
                        }
                    }
                };
            };
        })
        .catch((error) => {
            console.error('[SW] Service Worker 注册失败:', error);
        });
}

/**
 * 检查 Service Worker 是否有效
 */
function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' },
    })
        .then((response) => {
            const contentType = response.headers.get('content-type');
            if (
                response.status === 404 ||
                (contentType != null && contentType.indexOf('javascript') === -1)
            ) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            console.log('[SW] 没有网络连接，应用在离线模式下运行');
        });
}

/**
 * 注销 Service Worker
 */
export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
                console.log('[SW] Service Worker 已注销');
            })
            .catch((error) => {
                console.error('[SW] Service Worker 注销失败:', error);
            });
    }
}

/**
 * 处理 Service Worker 更新
 */
export function handleSWUpdate(registration: ServiceWorkerRegistration) {
    // 创建更新提示
    const updateNotification = createUpdateNotification();

    updateNotification.onclick = () => {
        if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            updateNotification.remove();
            window.location.reload();
        }
    };

    document.body.appendChild(updateNotification);

    // 5秒后自动移除提示
    setTimeout(() => {
        if (document.body.contains(updateNotification)) {
            updateNotification.remove();
        }
    }, 5000);
}

/**
 * 创建更新通知元素
 */
function createUpdateNotification(): HTMLElement {
    const notification = document.createElement('div');
    notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: #1890ff;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
    ">
      🔄 新版本可用，点击更新
    </div>
  `;
    return notification.firstElementChild as HTMLElement;
}

/**
 * 设置 Service Worker 消息监听
 */
export function setupSWMessageListener() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            const { data } = event;

            switch (data?.type) {
                case 'SW_UPDATE_AVAILABLE':
                    console.log('[SW] 检测到更新');
                    break;
                case 'SW_OFFLINE_READY':
                    console.log('[SW] 应用已准备好离线使用');
                    break;
                case 'SW_ERROR':
                    console.error('[SW] Service Worker 错误:', data.error);
                    break;
                default:
                    break;
            }
        });
    }
}

/**
 * 检查更新
 */
export function checkForUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.update();
        });
    }
}

/**
 * 设置 PWA 安装提示
 */
export function setupPWAInstallPrompt() {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    function showInstallButton() {
        const installButton = createInstallButton();

        installButton.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();

                const { outcome } = await deferredPrompt.userChoice;
                console.log(`[PWA] 用户选择: ${outcome}`);

                deferredPrompt = null;
                installButton.remove();
            }
        };

        document.body.appendChild(installButton);

        // 10秒后自动隐藏
        setTimeout(() => {
            if (document.body.contains(installButton)) {
                installButton.remove();
            }
        }, 10000);
    }

    // 监听安装事件
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] 应用已安装');
        deferredPrompt = null;
    });
}

/**
 * 创建安装按钮
 */
function createInstallButton(): HTMLElement {
    const button = document.createElement('div');
    button.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background: #52c41a;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
    ">
      📱 安装应用
    </div>
  `;
    return button.firstElementChild as HTMLElement;
}