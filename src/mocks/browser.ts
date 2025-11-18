/**
 * MSW 浏览器端配置
 *
 * 职责：
 * - 初始化 Service Worker
 * - 注册所有 mock handlers
 *
 * 使用场景：
 * - 开发环境模拟后端 API
 * - 无需后端即可进行前端开发
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * 创建 MSW worker 实例
 *
 * 注意：
 * - 仅在开发环境使用
 * - 生产环境会跳过 MSW 初始化
 */
export const worker = setupWorker(...handlers);
