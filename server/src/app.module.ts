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
 * - ConfigModule: 环境变量管理
 * - ScheduleModule: 定时任务
 * - EventEmitterModule: 事件系统
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { ChatModule } from './chat/chat.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { CleanupService } from './common/services/cleanup.service';
import { TitleGeneratorListener } from './common/listeners/title-generator.listener';

@Module({
  imports: [
    // 配置模块 - 环境变量管理
    ConfigModule.forRoot({
      isGlobal: true,           // 全局可用，无需在每个模块导入
      load: [configuration],    // 加载配置工厂
      validationSchema,         // Joi 验证
      validationOptions: {
        abortEarly: false,      // 显示所有验证错误
      },
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 事件模块
    EventEmitterModule.forRoot({
      wildcard: false,          // 不使用通配符
      delimiter: '.',           // 事件名分隔符
      maxListeners: 10,         // 每个事件最大监听器数
      verboseMemoryLeak: true,  // 内存泄漏警告
    }),

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
    // 定时清理服务
    CleanupService,
    // 标题生成监听器
    TitleGeneratorListener,
  ],
})
export class AppModule {}
