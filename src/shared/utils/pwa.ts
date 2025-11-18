/**
 * PWA 离线支持工具
 *
 * 提供 Service Worker 注册和离线功能
 *
 * 技术要点：
 * - Service Worker 注册
 * - 离线缓存策略
 * - 更新提示
 *
 * 生产环境建议：
 * 使用 vite-plugin-pwa 插件自动生成 Service Worker
 * npm install vite-plugin-pwa workbox-window
 */

/**
 * 注册 Service Worker
 */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registered:', registration.scope);

    // 监听更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 有新版本可用
            console.log('[PWA] New version available');
            notifyUpdate();
          }
        });
      }
    });
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
}

/**
 * 注销 Service Worker
 */
export async function unregisterServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('[PWA] Service Workers unregistered');
  } catch (error) {
    console.error('[PWA] Service Worker unregistration failed:', error);
  }
}

/**
 * 通知用户有更新可用
 */
function notifyUpdate(): void {
  // 可以使用 notification API 或自定义 UI
  if (confirm('有新版本可用，是否刷新页面？')) {
    window.location.reload();
  }
}

/**
 * 检查是否离线
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * 监听网络状态变化
 */
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * PWA 安装提示
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * 初始化 PWA 安装监听
 */
export function initInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('[PWA] Install prompt ready');
  });
}

/**
 * 显示安装提示
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Install prompt result:', outcome);
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Install prompt failed:', error);
    return false;
  }
}

/**
 * 检查是否可以安装
 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/**
 * 检查是否已安装为 PWA
 */
export function isInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * PWA 设置指南
 */
export const PWA_SETUP_GUIDE = `
# PWA 离线支持配置指南

## 1. 安装依赖

\`\`\`bash
npm install vite-plugin-pwa workbox-window
\`\`\`

## 2. 配置 Vite

在 vite.config.ts 中：

\`\`\`typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: '通义千问',
        short_name: '通义',
        theme_color: '#6366f1',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\\/\\/api\\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
});
\`\`\`

## 3. 添加图标

在 public 目录添加：
- icon-192.png (192x192)
- icon-512.png (512x512)

## 4. 初始化 PWA

在 main.tsx 中：

\`\`\`typescript
import { registerServiceWorker, initInstallPrompt } from '@/shared/utils/pwa';

registerServiceWorker();
initInstallPrompt();
\`\`\`
`;
