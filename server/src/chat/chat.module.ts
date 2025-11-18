/**
 * 聊天模块
 *
 * 学习要点：
 * - 聊天和会话模块相互依赖
 * - forwardRef() 解决循环依赖问题
 */

import { Module, forwardRef } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatStore } from './chat.store';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    // Chat 需要 SessionStore 来更新消息计数
    forwardRef(() => SessionModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatStore],
  exports: [ChatStore],  // 导出供 SessionModule 使用
})
export class ChatModule {}
