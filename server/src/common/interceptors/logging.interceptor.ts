/**
 * 日志拦截器
 *
 * 学习要点：
 * - Interceptor 可以在请求处理前后执行逻辑
 * - 使用 RxJS 的 tap 操作符记录响应
 * - 计算请求处理时间
 *
 * 执行顺序：
 * Request → Interceptor(before) → Handler → Interceptor(after) → Response
 *
 * 典型用途：
 * - 记录请求日志
 * - 计算响应时间
 * - 缓存响应
 * - 转换响应格式
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';

    // 请求开始时间
    const now = Date.now();

    // 记录请求
    this.logger.log(`→ ${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap({
        // 成功响应
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;

          this.logger.log(
            `← ${method} ${url} ${statusCode} - ${duration}ms`,
          );
        },
        // 错误响应（不会到达这里，因为异常会被 Filter 捕获）
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `✗ ${method} ${url} - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
