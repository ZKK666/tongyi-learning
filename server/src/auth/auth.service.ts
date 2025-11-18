/**
 * 认证服务
 *
 * 学习要点：
 * - Service 层处理业务逻辑
 * - 与 Controller 分离，便于复用和测试
 * - 使用 JwtService 生成真正的 JWT token
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '../common/types';
import { LoginDto } from './dto/login.dto';
import { MOCK_USER } from '../common/mock-data/responses';

@Injectable()
export class AuthService {
  /**
   * 依赖注入 JwtService
   *
   * 学习要点：
   * - NestJS 自动注入 JwtService 实例
   * - JwtService 由 @nestjs/jwt 提供
   */
  constructor(private readonly jwtService: JwtService) {}

  /**
   * 登录验证
   *
   * 学习要点：
   * - 使用 JwtService 生成真正的 JWT token
   * - token 包含用户信息（payload）
   * - 可以设置过期时间
   *
   * @param loginDto 登录信息
   * @returns 包含 token 和用户信息的对象
   */
  async login(loginDto: LoginDto): Promise<{ token: string; user: User }> {
    console.log(`[AuthService] 用户登录: ${loginDto.username}`);

    // 模拟网络延迟
    await this.delay(300);

    // Mock 验证：演示如何拒绝登录
    // 真实项目中应该查询数据库并验证密码
    if (loginDto.password === 'wrong') {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 返回 Mock 用户，用登录名作为显示名
    const user: User = {
      ...MOCK_USER,
      name: loginDto.username,
      email: `${loginDto.username}@example.com`,
    };

    // 生成 JWT token
    const payload = {
      sub: user.id,           // 用户 ID (subject)
      username: user.name,    // 用户名
    };

    const token = this.jwtService.sign(payload);

    return { token, user };
  }

  /**
   * 验证 token（可选方法）
   *
   * 学习要点：
   * - 用于手动验证 token
   * - Guard 会自动验证，这个方法用于特殊场景
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('无效的 token');
    }
  }

  /**
   * 模拟延迟
   *
   * 学习要点：
   * - Promise + setTimeout 实现异步延迟
   * - 用于模拟网络请求耗时
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
