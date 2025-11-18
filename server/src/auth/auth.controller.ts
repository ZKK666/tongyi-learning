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
 * - @Public() - 标记为公开路由（不需要认证）
 */

import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser, CurrentUserData } from './decorators/current-user.decorator';
import type { User } from '../common/types';

@ApiTags('认证')
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
   * - @Public() 标记为公开路由，不需要认证
   * - @HttpCode(200) 覆盖默认的 201（POST 默认返回 201）
   * - LoginDto 会被 ValidationPipe 自动验证
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
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
   * - 需要认证才能登出（验证 token 有效性）
   * - 真实项目需要清除 token/session
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(): Promise<{ message: string }> {
    console.log('[AuthController] 登出请求');

    return {
      message: '登出成功',
    };
  }

  /**
   * 获取当前用户信息
   *
   * GET /api/auth/profile
   *
   * 学习要点：
   * - @CurrentUser() 获取当前登录用户
   * - 需要认证才能访问
   */
  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未登录' })
  getProfile(@CurrentUser() user: CurrentUserData) {
    console.log('[AuthController] 获取用户信息:', user.username);

    return {
      id: user.id,
      username: user.username,
    };
  }
}
