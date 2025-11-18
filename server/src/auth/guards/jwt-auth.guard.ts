/**
 * JWT 认证守卫
 *
 * 学习要点：
 * - Guard 在路由处理之前执行，决定请求是否被允许
 * - AuthGuard('jwt') 使用 JWT 策略验证
 * - 可以扩展 Guard 添加自定义逻辑
 *
 * Guard vs Middleware vs Interceptor：
 * - Middleware: 最早执行，无法访问执行上下文
 * - Guard: 在 Middleware 之后，决定请求是否继续
 * - Interceptor: 在 Guard 之后，可以转换响应
 */

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 决定是否允许访问
   *
   * 学习要点：
   * - Reflector 用于读取装饰器元数据
   * - 检查 @Public() 装饰器跳过认证
   * - 调用 super.canActivate() 执行 JWT 验证
   */
  canActivate(context: ExecutionContext) {
    // 检查是否标记为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 公开路由直接放行
    if (isPublic) {
      return true;
    }

    // 执行 JWT 验证
    return super.canActivate(context);
  }

  /**
   * 处理验证结果
   *
   * 学习要点：
   * - 可以自定义错误消息
   * - err 是 Passport 返回的错误
   * - user 是 JwtStrategy.validate() 的返回值
   */
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser,
    info: Error | null,
  ): TUser {
    if (err || !user) {
      // 自定义错误消息
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('登录已过期，请重新登录');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('无效的认证信息');
      }
      throw new UnauthorizedException(err?.message || '请先登录');
    }

    return user;
  }
}
