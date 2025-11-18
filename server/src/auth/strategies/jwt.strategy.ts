/**
 * JWT 策略
 *
 * 学习要点：
 * - PassportStrategy 是 NestJS 对 Passport 的封装
 * - Strategy 负责验证 token 并提取用户信息
 * - validate() 返回的对象会被附加到 req.user
 *
 * JWT 验证流程：
 * 1. 从请求头提取 Bearer token
 * 2. 验证签名和过期时间
 * 3. 解析 payload 并调用 validate()
 * 4. validate() 返回的用户信息附加到 req.user
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Payload 类型
 *
 * 学习要点：
 * - 这是 token 中携带的信息
 * - 不要存放敏感信息（因为可以被解码）
 */
export interface JwtPayload {
  sub: string;      // 用户 ID（subject 的缩写，JWT 标准字段）
  username: string; // 用户名
  iat?: number;     // 签发时间
  exp?: number;     // 过期时间
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * 学习要点：
   * - 在构造函数中注入 ConfigService
   * - 使用 configService.get() 获取配置值
   * - 这是 NestJS 推荐的配置获取方式
   */
  constructor(private configService: ConfigService) {
    super({
      // 从请求头的 Authorization: Bearer <token> 提取
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不忽略过期时间
      ignoreExpiration: false,
      // 从 ConfigService 获取 JWT 密钥
      secretOrKey: configService.get<string>('jwt.secret', 'tongyi-secret-key-2024'),
    });
  }

  /**
   * 验证 JWT payload
   *
   * 学习要点：
   * - 当 token 验证通过后调用
   * - 返回值会被赋给 req.user
   * - 可以在这里查询数据库获取完整用户信息
   *
   * @param payload - JWT 解码后的数据
   * @returns 用户信息对象
   */
  async validate(payload: JwtPayload) {
    // 简单实现：直接返回 payload 中的信息
    // 真实项目中可能需要查询数据库验证用户是否存在
    if (!payload.sub) {
      throw new UnauthorizedException('无效的 token');
    }

    return {
      id: payload.sub,
      username: payload.username,
    };
  }
}
