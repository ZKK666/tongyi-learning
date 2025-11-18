/**
 * 配置验证 Schema
 *
 * 学习要点：
 * - 使用 Joi 验证环境变量
 * - 提供清晰的错误信息
 * - 确保必要配置存在
 *
 * Joi 验证器说明：
 * - .number() - 必须是数字
 * - .string() - 必须是字符串
 * - .default() - 默认值
 * - .required() - 必填项
 */

import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // 环境
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // 端口
  PORT: Joi.number().default(3001),

  // JWT 配置
  JWT_SECRET: Joi.string().default('tongyi-secret-key-2024'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // 数据库配置（预留）
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),

  // 限流配置
  THROTTLE_SHORT_TTL: Joi.number().default(1000),
  THROTTLE_SHORT_LIMIT: Joi.number().default(10),
  THROTTLE_MEDIUM_TTL: Joi.number().default(10000),
  THROTTLE_MEDIUM_LIMIT: Joi.number().default(50),
  THROTTLE_LONG_TTL: Joi.number().default(60000),
  THROTTLE_LONG_LIMIT: Joi.number().default(200),

  // 流式响应配置
  STREAM_INTERVAL: Joi.number().default(30),
  STREAM_CHUNK_SIZE: Joi.number().default(3),

  // 定时任务配置
  CLEANUP_CRON: Joi.string().default('0 * * * *'),
  TITLE_MAX_LENGTH: Joi.number().default(20),
});
