/**
 * 应用根模块
 *
 * 学习要点：
 * - 根模块导入所有功能模块
 * - NestJS 从这里启动整个应用
 * - 类似 React 的 App 组件
 *
 * 全局配置：
 * - APP_GUARD: 全局守卫，所有路由默认需要认证
 * - ThrottlerModule: 全局限流保护
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { ChatModule } from './chat/chat.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // 限流模块配置（开发环境放宽限制）
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 秒
        limit: 10,   // 最多 10 次请求
      },
      {
        name: 'medium',
        ttl: 10000,  // 10 秒
        limit: 50,   // 最多 50 次请求
      },
      {
        name: 'long',
        ttl: 60000,  // 60 秒
        limit: 200,  // 最多 200 次请求
      },
    ]),
    AuthModule,     // 认证模块
    SessionModule,  // 会话模块
    ChatModule,     // 聊天模块
  ],
  providers: [
    // 全局 JWT 认证守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
