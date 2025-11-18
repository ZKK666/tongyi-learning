/**
 * 会话模块
 *
 * 学习要点：
 * - forwardRef() 用于处理循环依赖
 * - 本模块依赖 ChatStore，ChatModule 也会依赖 SessionStore
 */

import { Module, forwardRef } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionStore } from './session.store';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    // forwardRef 解决循环依赖
    // Session 需要 ChatStore 来删除关联消息
    forwardRef(() => ChatModule),
  ],
  controllers: [SessionController],
  providers: [SessionService, SessionStore],
  exports: [SessionStore],  // 导出供 ChatModule 使用
})
export class SessionModule {}
