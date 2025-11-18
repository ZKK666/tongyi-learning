/**
 * 认证模块
 *
 * 学习要点：
 * - @Module() 装饰器定义模块
 * - NestJS 使用模块来组织代码
 * - 每个功能域一个模块，便于维护和测试
 *
 * 模块配置说明：
 * - controllers: 该模块的控制器
 * - providers: 该模块的服务（依赖注入的提供者）
 * - imports: 导入其他模块
 * - exports: 导出供其他模块使用的服务
 *
 * JWT 配置说明：
 * - registerAsync: 异步配置，可以注入 ConfigService
 * - useFactory: 工厂函数，返回配置对象
 * - inject: 注入依赖
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    // Passport 模块
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JWT 模块 - 使用 registerAsync 从 ConfigService 获取配置
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret', 'tongyi-secret-key-2024'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,    // JWT 验证策略
    JwtAuthGuard,   // JWT 认证守卫
  ],
  exports: [
    AuthService,
    JwtAuthGuard,   // 导出 Guard 供其他模块使用
    JwtModule,      // 导出 JwtModule 供其他模块使用
  ],
})
export class AuthModule {}
