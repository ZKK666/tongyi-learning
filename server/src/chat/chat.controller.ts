/**
 * 聊天控制器
 *
 * 学习要点：
 * - SSE (Server-Sent Events) 实现流式输出
 * - Observable 响应式编程处理流数据
 * - 打字机效果的核心实现
 *
 * SSE vs WebSocket：
 * - SSE：单向（服务器→客户端），简单，自动重连
 * - WebSocket：双向，复杂，需要心跳
 * - 聊天场景用 SSE 足够，因为只需要服务器推送
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import type { ChatRequestDto, Message, ApiResponse } from '../common/types';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 获取会话消息列表
   *
   * GET /api/chat/:sessionId/messages
   */
  @Get(':sessionId/messages')
  async getMessages(
    @Param('sessionId') sessionId: string,
  ): Promise<ApiResponse<Message[]>> {
    const messages = await this.chatService.getMessages(sessionId);

    return {
      success: true,
      data: messages,
    };
  }

  /**
   * 流式聊天接口
   *
   * POST /api/chat/stream
   *
   * 学习要点：
   * - @Sse() 装饰器标记这是 SSE 响应
   * - 返回 Observable<MessageEvent>
   * - MessageEvent 是 SSE 标准格式
   *
   * SSE 协议格式：
   * ```
   * data: {"delta": "你"}
   *
   * data: {"delta": "好"}
   *
   * data: {"finish_reason": "stop"}
   *
   * ```
   * 每条消息以 "data: " 开头，两个换行结束
   */
  @Post('stream')
  @Sse()
  stream(@Body() dto: ChatRequestDto): Observable<MessageEvent> {
    console.log('[ChatController] 流式请求:', dto.sessionId);

    /**
     * Observable 创建流
     *
     * 学习要点：
     * - Observable 是 RxJS 的核心概念
     * - subscriber.next() 发送数据
     * - subscriber.complete() 结束流
     * - 返回清理函数用于取消
     */
    return new Observable<MessageEvent>((subscriber) => {
      // 调用服务处理流式响应
      const cleanup = this.chatService.streamResponse(
        dto,
        // 发送数据块
        (data: Record<string, unknown>) => {
          // NestJS SSE 会自动将 data 序列化为 JSON
          // 发送格式：data: {"delta":"..."}\n\n
          subscriber.next({
            data,
          } as MessageEvent);
        },
        // 完成
        () => {
          subscriber.complete();
        },
      );

      // 返回清理函数（客户端断开时调用）
      return () => {
        console.log('[ChatController] 客户端断开连接');
        cleanup();
      };
    });
  }
}
