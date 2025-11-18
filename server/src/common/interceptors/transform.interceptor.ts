/**
 * 响应转换拦截器
 *
 * 学习要点：
 * - 使用 RxJS 的 map 操作符转换响应
 * - 统一包装成功响应格式
 * - 与 ExceptionFilter 配合实现统一响应格式
 *
 * 统一响应格式的好处：
 * - 前端处理一致
 * - 便于错误判断
 * - 方便添加元信息（分页、时间戳等）
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

/**
 * 统一成功响应格式
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}

/**
 * 简化版转换拦截器（不添加额外字段）
 *
 * 学习要点：
 * - 有时候不需要包装，保持原样返回
 * - 可以根据项目需求选择使用
 */
@Injectable()
export class SimpleTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是标准格式，不再包装
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        // 否则包装成标准格式
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
