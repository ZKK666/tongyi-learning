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
 * 开发环境下会先启动 MSW 进行 API Mock
 * 生产环境直接渲染应用
 */
async function bootstrap() {
  // 开发环境启动 MSW
  if (import.meta.env.DEV) {
    const { worker } = await import('@/mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass', // 未匹配的请求直接放行
    });
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
