/**
 * 应用根组件
 *
 * 职责：
 * - 组合所有 Provider
 * - 配置路由
 * - 全局错误边界
 */
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import zhCN from 'antd/locale/zh_CN';
import { AppRouter } from './router';
import { useUIStore } from '@/features/settings/stores/uiStore';

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

function App() {
  const isDarkMode = useUIStore((state) => state.theme === 'dark');

  return (
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
            <AppRouter />
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
