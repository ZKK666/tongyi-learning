/**
 * 应用根组件
 *
 * 职责：
 * - 组合所有 Provider
 * - 配置路由
 * - 全局错误边界
 * - 响应式检测
 */
import { useEffect } from 'react';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import zhCN from 'antd/locale/zh_CN';
import { AppRouter } from './router';
import { useUIStore } from '@/features/settings/stores/uiStore';
import { ErrorBoundary, initGlobalErrorHandling } from '@/shared/components/ErrorBoundary';
import { useResponsive } from '@/shared/hooks';

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟内数据视为新鲜
      retry: 1, // 失败重试 1 次
      refetchOnWindowFocus: false, // 窗口聚焦不重新请求
    },
  },
});

// 初始化全局错误处理
initGlobalErrorHandling();

/**
 * 响应式检测组件
 *
 * 监听窗口大小变化，更新 UI Store
 */
function ResponsiveDetector() {
  const { isMobile } = useResponsive();
  const setIsMobile = useUIStore((state) => state.setIsMobile);

  useEffect(() => {
    setIsMobile(isMobile);
  }, [isMobile, setIsMobile]);

  return null;
}

function App() {
  const isDarkMode = useUIStore((state) => state.theme === 'dark');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={zhCN}
          theme={{
            algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              colorPrimary: '#6366f1',
              borderRadius: 8,
            },
          }}
        >
          <AntdApp>
            <BrowserRouter>
              <ResponsiveDetector />
              <AppRouter />
            </BrowserRouter>
          </AntdApp>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
