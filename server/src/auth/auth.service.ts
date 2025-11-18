/**
 * 认证服务
 *
 * 学习要点：
 * - Service 层处理业务逻辑
 * - 与 Controller 分离，便于复用和测试
 * - 真实项目中会有密码验证、JWT 生成等
 */

import { Injectable } from '@nestjs/common';
import type { LoginDto, User } from '../common/types';
import { MOCK_USER } from '../common/mock-data/responses';

@Injectable()
export class AuthService {
  /**
   * 登录验证
   *
   * 学习要点：
   * - 这是简化的 Mock 实现
   * - 真实项目需要：
   *   1. 查询数据库获取用户
   *   2. 验证密码（bcrypt 哈希比较）
   *   3. 生成 JWT token
   *   4. 记录登录日志
   *
   * @param loginDto 登录信息
   * @returns 包含 token 和用户信息的对象
   */
  async login(loginDto: LoginDto): Promise<{ token: string; user: User }> {
    // Mock 实现：任何账号密码都能登录
    // 只是简单地返回模拟用户数据
    console.log(`[AuthService] 用户登录: ${loginDto.username}`);

    // 模拟网络延迟
    await this.delay(300);

    // 生成 Mock token（格式与前端 MSW 保持一致）
    const token = `mock_token_${MOCK_USER.id}_${Date.now()}`;

    // 返回 Mock 用户，用登录名作为显示名
    const user: User = {
      ...MOCK_USER,
      name: loginDto.username,
      email: `${loginDto.username}@example.com`,
    };

    return { token, user };
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
