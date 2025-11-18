/**
 * 全局 HTTP 异常过滤器
 *
 * 学习要点：
 * - @Catch() 指定捕获的异常类型
 * - ExceptionFilter 接口定义 catch 方法
 * - 统一错误响应格式，便于前端处理
 *
 * 异常处理流程：
 * 1. Controller 抛出异常
 * 2. Filter 捕获异常
 * 3. 转换为统一格式返回
 *
 * 常见 HTTP 异常：
 * - BadRequestException (400)
 * - UnauthorizedException (401)
 * - ForbiddenException (403)
 * - NotFoundException (404)
 * - InternalServerErrorException (500)
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 统一错误响应格式
 */
interface ErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
    path: string;
    timestamp: string;
    // 开发环境显示详细错误
    details?: unknown;
  };
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 提取错误消息
    let message = exception.message;
    let details: unknown = undefined;

    if (typeof exceptionResponse === 'object') {
      const res = exceptionResponse as Record<string, unknown>;
      // class-validator 的错误格式
      if (Array.isArray(res.message)) {
        message = res.message[0] as string;
        details = res.message;
      } else if (res.message) {
        message = res.message as string;
      }
    }

    // 构建错误响应
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: status,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    // 开发环境显示详细错误
    if (process.env.NODE_ENV !== 'production' && details) {
      errorResponse.error.details = details;
    }

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}

/**
 * 捕获所有异常（包括非 HTTP 异常）
 *
 * 学习要点：
 * - 没有参数的 @Catch() 捕获所有异常
 * - 用于处理未预期的错误
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 确定状态码
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 确定错误消息
    const message =
      exception instanceof Error
        ? exception.message
        : '服务器内部错误';

    // 记录错误
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message: process.env.NODE_ENV === 'production'
          ? '服务器内部错误'
          : message,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
