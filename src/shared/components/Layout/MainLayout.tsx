/**
 * 主布局组件
 *
 * 职责：
 * - 提供应用的基础布局结构
 * - 包含侧边栏和主内容区
 * - 响应式适配
 */
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/features/settings/stores/uiStore';
import { useResponsive } from '@/shared/hooks';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * 主布局组件
 *
 * 结构：
 * - 左侧：可收起的侧边栏
 * - 右侧：主内容区
 */
export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { isMobile } = useResponsive();

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-gray-900">
      {/* 移动端遮罩层 */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
