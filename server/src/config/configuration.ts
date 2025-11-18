/**
 * 应用配置
 *
 * 学习要点：
 * - 使用工厂函数返回配置对象
 * - 从环境变量读取配置
 * - 提供默认值确保开发环境可用
 *
 * 12-Factor App 规范：
 * - 配置应该存储在环境变量中
 * - 代码和配置严格分离
 */

export default () => ({
  // 服务端口
  port: parseInt(process.env.PORT || '3001', 10),

  // 数据库配置（预留）
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'tongyi-secret-key-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // 限流配置
  throttle: {
    short: {
      ttl: parseInt(process.env.THROTTLE_SHORT_TTL || '1000', 10),
      limit: parseInt(process.env.THROTTLE_SHORT_LIMIT || '10', 10),
    },
    medium: {
      ttl: parseInt(process.env.THROTTLE_MEDIUM_TTL || '10000', 10),
      limit: parseInt(process.env.THROTTLE_MEDIUM_LIMIT || '50', 10),
    },
    long: {
      ttl: parseInt(process.env.THROTTLE_LONG_TTL || '60000', 10),
      limit: parseInt(process.env.THROTTLE_LONG_LIMIT || '200', 10),
    },
  },

  // 流式响应配置
  stream: {
    // 打字机效果间隔（毫秒）
    interval: parseInt(process.env.STREAM_INTERVAL || '30', 10),
    // 每次发送字符数
    chunkSize: parseInt(process.env.STREAM_CHUNK_SIZE || '3', 10),
  },

  // 定时任务配置
  schedule: {
    // 清理空会话的 cron 表达式（默认每小时）
    cleanupCron: process.env.CLEANUP_CRON || '0 * * * *',
    // 会话标题自动生成的最大长度
    titleMaxLength: parseInt(process.env.TITLE_MAX_LENGTH || '20', 10),
  },
});
