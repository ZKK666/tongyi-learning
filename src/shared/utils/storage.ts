/**
 * localStorage 封装工具
 *
 * 职责：
 * - 提供类型安全的 localStorage 操作
 * - 自动序列化/反序列化 JSON
 * - 错误处理和降级
 *
 * 使用场景：
 * - 存储用户配置
 * - 缓存会话数据
 * - 持久化临时状态
 */

/**
 * 存储键前缀，避免与其他应用冲突
 */
const STORAGE_PREFIX = 'tongyi_';

/**
 * 获取完整的存储键
 */
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * 从 localStorage 获取数据
 *
 * @param key 存储键
 * @param defaultValue 默认值（获取失败时返回）
 * @returns 存储的数据或默认值
 *
 * @example
 * const user = storage.get<UserInfo>('user', null);
 */
export function get<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(getKey(key));
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`[Storage] Failed to get "${key}":`, error);
    return defaultValue;
  }
}

/**
 * 向 localStorage 存储数据
 *
 * @param key 存储键
 * @param value 要存储的数据
 * @returns 是否存储成功
 *
 * @example
 * storage.set('user', { id: '1', name: '张三' });
 */
export function set<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to set "${key}":`, error);
    return false;
  }
}

/**
 * 从 localStorage 删除数据
 *
 * @param key 存储键
 */
export function remove(key: string): void {
  try {
    localStorage.removeItem(getKey(key));
  } catch (error) {
    console.error(`[Storage] Failed to remove "${key}":`, error);
  }
}

/**
 * 清空所有带前缀的存储数据
 *
 * 注意：只清空本应用的数据，不影响其他应用
 */
export function clear(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('[Storage] Failed to clear:', error);
  }
}

/**
 * 检查 localStorage 是否可用
 *
 * @returns 是否可用
 */
export function isAvailable(): boolean {
  try {
    const testKey = `${STORAGE_PREFIX}test`;
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * 导出统一的 storage 对象
 */
export const storage = {
  get,
  set,
  remove,
  clear,
  isAvailable,
};
