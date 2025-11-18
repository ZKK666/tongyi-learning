/**
 * Sentry 错误监控集成
 *
 * 使用说明：
 * 1. 安装依赖: npm install @sentry/react @sentry/tracing
 * 2. 在 Sentry 创建项目，获取 DSN
 * 3. 在 main.tsx 中调用 initSentry()
 *
 * 配置参考：
 * https://docs.sentry.io/platforms/javascript/guides/react/
 *
 * 技术要点：
 * - 错误边界集成
 * - 性能监控
 * - 用户反馈收集
 */

/**
 * Sentry 配置
 */
interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
}

/**
 * 初始化 Sentry
 *
 * @example
 * // main.tsx
 * import { initSentry } from '@/shared/utils/sentry';
 *
 * initSentry({
 *   dsn: 'https://xxx@sentry.io/xxx',
 *   environment: import.meta.env.MODE,
 * });
 */
export function initSentry(config: SentryConfig): void {
  // TODO: 实际集成时取消注释
  // import * as Sentry from '@sentry/react';
  // import { BrowserTracing } from '@sentry/tracing';

  console.log('[Sentry] Initializing with config:', {
    dsn: config.dsn ? '***' : 'not set',
    environment: config.environment,
    release: config.release,
  });

  // Sentry.init({
  //   dsn: config.dsn,
  //   environment: config.environment,
  //   release: config.release,
  //   integrations: [
  //     new BrowserTracing(),
  //     new Sentry.Replay(),
  //   ],
  //   tracesSampleRate: config.tracesSampleRate ?? 0.1,
  //   replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
  //   replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
  // });

  // 设置全局错误处理
  setupGlobalErrorHandlers();
}

/**
 * 设置全局错误处理
 */
function setupGlobalErrorHandlers(): void {
  // 未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Sentry] Unhandled rejection:', event.reason);
    // Sentry.captureException(event.reason);
  });

  // 全局 JS 错误
  window.addEventListener('error', (event) => {
    console.error('[Sentry] Global error:', event.error);
    // Sentry.captureException(event.error);
  });
}

/**
 * 手动上报错误
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
): void {
  console.error('[Sentry] Captured error:', error, context);
  // Sentry.captureException(error, { extra: context });
}

/**
 * 上报消息
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  console.log(`[Sentry] Captured message (${level}):`, message);
  // Sentry.captureMessage(message, level);
}

/**
 * 设置用户信息
 */
export function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
} | null): void {
  console.log('[Sentry] Set user:', user);
  // Sentry.setUser(user);
}

/**
 * 添加面包屑
 */
export function addBreadcrumb(breadcrumb: {
  category?: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}): void {
  console.log('[Sentry] Breadcrumb:', breadcrumb);
  // Sentry.addBreadcrumb(breadcrumb);
}

/**
 * 性能监控 - 开始事务
 */
export function startTransaction(name: string, op: string) {
  console.log('[Sentry] Start transaction:', name, op);
  // return Sentry.startTransaction({ name, op });
  return {
    finish: () => console.log('[Sentry] Finish transaction:', name),
    setStatus: (status: string) => console.log('[Sentry] Transaction status:', status),
  };
}

/**
 * React ErrorBoundary 的 fallback 处理
 */
export function sentryErrorFallback({ error }: { error: Error }) {
  return {
    error,
    eventId: 'mock-event-id',
  };
}

/**
 * 使用说明文档
 */
export const SENTRY_SETUP_GUIDE = `
# Sentry 集成指南

## 1. 安装依赖

\`\`\`bash
npm install @sentry/react @sentry/tracing
\`\`\`

## 2. 配置环境变量

在 .env 文件中添加：

\`\`\`env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=development
\`\`\`

## 3. 初始化 Sentry

在 main.tsx 中：

\`\`\`typescript
import { initSentry } from '@/shared/utils/sentry';

initSentry({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: '1.0.0',
});
\`\`\`

## 4. 使用 ErrorBoundary

\`\`\`typescript
import * as Sentry from '@sentry/react';

<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
\`\`\`

## 5. 手动上报

\`\`\`typescript
import { captureError, captureMessage } from '@/shared/utils/sentry';

try {
  // 危险操作
} catch (error) {
  captureError(error, { userId: '123' });
}
\`\`\`
`;
