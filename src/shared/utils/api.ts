/**
 * API 请求工具
 *
 * 职责：
 * - 统一处理 API 请求
 * - 自动添加 Authorization header
 * - 统一错误处理
 *
 * 学习要点：
 * - 封装 fetch 简化 API 调用
 * - 从 Zustand store 获取 token
 * - 处理 401 未授权自动登出
 */

import { useAuthStore } from '@/features/auth/stores/authStore';

/**
 * API 请求配置
 */
interface ApiOptions extends RequestInit {
  /** 是否需要认证（默认 true） */
  auth?: boolean;
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 发起 API 请求
 *
 * @example
 * const data = await api('/api/sessions', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: '新对话' }),
 * });
 */
export async function api<T = unknown>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const { auth = true, ...fetchOptions } = options;

  // 构建请求头
  const headers = new Headers(fetchOptions.headers);

  // 添加 Content-Type（如果有 body）
  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 添加 Authorization header
  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // 发起请求
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // 处理 401 未授权
  if (response.status === 401) {
    // 清除登录状态
    useAuthStore.getState().logout();
    throw new ApiError('请先登录', 401);
  }

  // 处理错误响应
  if (!response.ok) {
    let errorMessage = '请求失败';
    let errorData: unknown;

    try {
      errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null) {
        const data = errorData as Record<string, unknown>;
        if (data.error && typeof data.error === 'object') {
          const error = data.error as Record<string, unknown>;
          errorMessage = (error.message as string) || errorMessage;
        } else if (data.message) {
          errorMessage = data.message as string;
        }
      }
    } catch {
      // 忽略 JSON 解析错误
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // 返回 JSON 数据
  // 204 No Content 没有响应体
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * 获取带认证的请求头
 *
 * 用于需要手动处理 fetch 的场景（如 SSE）
 */
export function getAuthHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}
