/**
 * 公开路由装饰器
 *
 * 学习要点：
 * - SetMetadata 设置元数据，Guard 可以读取
 * - 用于标记不需要认证的路由
 * - 这是一个简单但实用的自定义装饰器
 *
 * 使用方式：
 * @Public()
 * @Post('login')
 * async login() {}
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 标记路由为公开（不需要认证）
 *
 * 学习要点：
 * - 返回一个装饰器函数
 * - SetMetadata(key, value) 设置元数据
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
