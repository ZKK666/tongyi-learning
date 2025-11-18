/**
 * UI 状态管理
 *
 * 职责：
 * - 管理主题切换（明/暗）
 * - 管理侧边栏展开/收起
 * - 管理设备类型判断
 *
 * 持久化：
 * - 主题设置存储在 localStorage
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * UI 状态接口
 */
interface UIState {
  // 状态
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  isMobile: boolean;

  // 方法
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setIsMobile: (isMobile: boolean) => void;
}

/**
 * UI 状态 Store
 */
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // 初始状态
      theme: 'light',
      sidebarOpen: true,
      isMobile: false,

      // 设置主题
      setTheme: (theme) => {
        set({ theme });
        // 同步更新 DOM class
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // 切换主题
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // 设置侧边栏状态
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      // 切换侧边栏
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      // 设置移动端状态
      setIsMobile: (isMobile) => {
        set({ isMobile });
        // 移动端默认收起侧边栏
        if (isMobile) {
          set({ sidebarOpen: false });
        }
      },
    }),
    {
      name: 'tongyi-ui', // localStorage key
      partialize: (state) => ({
        theme: state.theme,
      }),
      // 恢复状态后同步 DOM
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
