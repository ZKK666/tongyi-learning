/**
 * 应用入口文件
 *
 * 职责：
 * - 初始化 React 应用
 * - 配置全局 Provider
 * - 启动 MSW（开发环境）
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../index.css';

/**
 * 启动应用
 *
 * 学习要点：
 * - VITE_USE_MOCK 环境变量控制是否使用 MSW
 * - 支持两种开发模式：
 *   1. 前端独立开发（MSW Mock）
 *   2. 前后端联调（NestJS 后端）
 */
async function bootstrap() {
  /**
   * 是否使用 MSW Mock
   *
   * 配置方式：
   * - .env.development: VITE_USE_MOCK=true（默认）
   * - .env.development.local: VITE_USE_MOCK=false（连接后端）
   */
  const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

  // 开发环境且启用 Mock 时，启动 MSW
  if (import.meta.env.DEV && useMock) {
    const { worker } = await import('@/mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass', // 未匹配的请求直接放行
    });
    console.log('[App] MSW Mock 已启动');
  } else if (import.meta.env.DEV) {
    console.log('[App] 连接真实后端 API');
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
