/**
 * 当前用户装饰器
 *
 * 学习要点：
 * - createParamDecorator 创建参数装饰器
 * - 从 ExecutionContext 获取请求对象
 * - 简化获取当前用户的代码
 *
 * 使用前：
 * async getProfile(@Request() req) {
 *   const user = req.user;
 * }
 *
 * 使用后：
 * async getProfile(@CurrentUser() user) {
 *   // 直接使用 user
 * }
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 用户信息接口
 */
export interface CurrentUserData {
  id: string;
  username: string;
}

/**
 * 获取当前登录用户
 *
 * 学习要点：
 * - data 参数可以指定获取 user 的某个属性
 * - @CurrentUser() 返回整个 user 对象
 * - @CurrentUser('id') 只返回 user.id
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserData;

    // 如果指定了属性名，只返回该属性
    return data ? user?.[data] : user;
  },
);
