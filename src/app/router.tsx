/**
 * 路由配置
 *
 * 职责：
 * - 定义应用路由结构
 * - 路由守卫（登录检查）
 * - 懒加载页面组件
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { useAuthStore } from '@/features/auth/stores/authStore';

// 懒加载页面组件
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ChatPage = lazy(() => import('@/features/chat/pages/ChatPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

/**
 * 页面加载中的占位组件
 */
function PageLoading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Spin size="large" tip="加载中..." />
    </div>
  );
}

/**
 * 路由守卫组件
 *
 * 检查用户是否已登录，未登录则重定向到登录页
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => !!state.token);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * 应用路由配置
 */
export function AppRouter() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* 登录页 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 主应用路由（需要登录） */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />

        {/* 设置页 */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />

        {/* 404 重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
