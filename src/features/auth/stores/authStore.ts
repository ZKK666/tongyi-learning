/**
 * 认证状态管理
 *
 * 职责：
 * - 管理用户登录状态
 * - 存储用户信息和 token
 * - 提供登录/登出方法
 *
 * 持久化：
 * - token 和用户信息存储在 localStorage
 * - 页面刷新后自动恢复登录状态
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  department?: string;
  role: 'user' | 'admin';
}

/**
 * 认证状态接口
 */
interface AuthState {
  // 状态
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;

  // 方法
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserInfo) => void;
  setToken: (token: string) => void;
}

/**
 * 认证状态 Store
 *
 * 使用 persist 中间件实现登录状态持久化
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      user: null,
      token: null,
      isLoading: false,

      // 登录方法
      login: async (username: string, password: string) => {
        set({ isLoading: true });

        try {
          // 调用登录 API（会被 MSW 拦截）
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '登录失败');
          }

          const data = await response.json();
          set({
            user: data.user,
            token: data.token,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 登出方法
      logout: () => {
        set({
          user: null,
          token: null,
        });
      },

      // 设置用户信息
      setUser: (user: UserInfo) => {
        set({ user });
      },

      // 设置 token
      setToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: 'tongyi-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
