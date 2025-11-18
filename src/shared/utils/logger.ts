/**
 * 日志工具
 *
 * 职责：
 * - 统一的日志输出格式
 * - 支持不同日志级别
 * - 开发/生产环境区分
 *
 * 使用场景：
 * - 调试信息输出
 * - 错误上报
 * - 性能监控
 */

/**
 * 日志级别
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 日志级别对应的颜色
 */
const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '#9CA3AF',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

/**
 * 日志级别对应的 console 方法
 */
const LEVEL_METHODS: Record<LogLevel, 'log' | 'info' | 'warn' | 'error'> = {
  debug: 'log',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

/**
 * 格式化日志输出
 *
 * @param level 日志级别
 * @param module 模块名称
 * @param message 日志消息
 * @param data 附加数据
 */
function formatLog(
  level: LogLevel,
  module: string,
  message: string,
  data?: unknown
): void {
  // 生产环境只输出 warn 和 error
  if (import.meta.env.PROD && (level === 'debug' || level === 'info')) {
    return;
  }

  const timestamp = new Date().toLocaleTimeString();
  const color = LEVEL_COLORS[level];
  const method = LEVEL_METHODS[level];

  const prefix = `%c[${timestamp}] [${level.toUpperCase()}] [${module}]`;
  const style = `color: ${color}; font-weight: bold;`;

  if (data !== undefined) {
    console[method](prefix, style, message, data);
  } else {
    console[method](prefix, style, message);
  }
}

/**
 * 创建模块日志器
 *
 * @param module 模块名称
 * @returns 日志器对象
 *
 * @example
 * const logger = createLogger('ChatStore');
 * logger.info('Session created', { sessionId: '123' });
 */
export function createLogger(module: string) {
  return {
    debug: (message: string, data?: unknown) =>
      formatLog('debug', module, message, data),
    info: (message: string, data?: unknown) =>
      formatLog('info', module, message, data),
    warn: (message: string, data?: unknown) =>
      formatLog('warn', module, message, data),
    error: (message: string, data?: unknown) =>
      formatLog('error', module, message, data),
  };
}

/**
 * 全局日志器
 */
export const logger = {
  debug: (message: string, data?: unknown) =>
    formatLog('debug', 'App', message, data),
  info: (message: string, data?: unknown) =>
    formatLog('info', 'App', message, data),
  warn: (message: string, data?: unknown) =>
    formatLog('warn', 'App', message, data),
  error: (message: string, data?: unknown) =>
    formatLog('error', 'App', message, data),
};
