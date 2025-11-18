/**
 * 防抖 Hook
 *
 * 职责：
 * - 延迟执行高频触发的操作
 * - 避免性能问题
 *
 * 使用场景：
 * - 搜索输入框
 * - 窗口 resize
 * - 滚动事件处理
 */
import { useState, useEffect } from 'react';

/**
 * 防抖值 Hook
 *
 * @param value 原始值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 *
 * @example
 * function SearchInput() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 *   useEffect(() => {
 *     // 只在用户停止输入 300ms 后执行搜索
 *     search(debouncedQuery);
 *   }, [debouncedQuery]);
 *
 *   return <input value={query} onChange={e => setQuery(e.target.value)} />;
 * }
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖函数 Hook
 *
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * function MyComponent() {
 *   const handleSearch = useDebounceFn((query: string) => {
 *     console.log('Searching:', query);
 *   }, 300);
 *
 *   return <input onChange={e => handleSearch(e.target.value)} />;
 * }
 */
export function useDebounceFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): T {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      fn(...args);
    }, delay);

    setTimer(newTimer);
  }) as T;

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  return debouncedFn;
}
