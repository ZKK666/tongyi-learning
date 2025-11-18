/**
 * 认证控制器
 *
 * 学习要点：
 * - @Controller('api/auth') 定义路由前缀
 * - 控制器负责处理 HTTP 请求，调用 Service 处理业务逻辑
 * - 这是 MVC 模式中的 Controller 层
 *
 * NestJS 装饰器说明：
 * - @Post() - 处理 POST 请求
 * - @Body() - 获取请求体
 * - @HttpCode() - 设置响应状态码
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, ApiResponse, User } from '../common/types';

@Controller('api/auth')
export class AuthController {
  /**
   * 构造函数依赖注入
   *
   * 学习要点：
   * - NestJS 自动注入 AuthService 实例
   * - private readonly 简写：声明 + 赋值 + 只读
   * - 这是依赖注入（DI）模式的典型用法
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * 登录接口
   *
   * POST /api/auth/login
   *
   * 学习要点：
   * - @HttpCode(200) 覆盖默认的 201（POST 默认返回 201）
   * - 返回格式与前端 MSW Mock 保持一致
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ token: string; user: User }> {
    console.log('[AuthController] 登录请求:', loginDto.username);

    const result = await this.authService.login(loginDto);

    return result;
  }

  /**
   * 登出接口
   *
   * POST /api/auth/logout
   *
   * 学习要点：
   * - 简单的 Mock 实现，直接返回成功
   * - 真实项目需要清除 token/session
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<ApiResponse<null>> {
    console.log('[AuthController] 登出请求');

    return {
      success: true,
      data: null,
    };
  }
}
