/**
 * 应用根模块
 *
 * 学习要点：
 * - 根模块导入所有功能模块
 * - NestJS 从这里启动整个应用
 * - 类似 React 的 App 组件
 */

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    AuthModule,     // 认证模块
    SessionModule,  // 会话模块
    ChatModule,     // 聊天模块
  ],
})
export class AppModule {}
