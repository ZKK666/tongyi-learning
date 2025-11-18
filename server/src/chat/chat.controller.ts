/**
 * 聊天控制器
 *
 * 学习要点：
 * - SSE (Server-Sent Events) 实现流式输出
 * - 手动控制响应流实现真正的流式传输
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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import type { Message, ApiResponse as ApiResponseType } from '../common/types';

@ApiTags('聊天')
@ApiBearerAuth()
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 获取会话消息列表
   *
   * GET /api/chat/:sessionId/messages
   */
  @Get(':sessionId/messages')
  @ApiOperation({ summary: '获取会话消息列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMessages(
    @Param('sessionId') sessionId: string,
  ): Promise<ApiResponseType<Message[]>> {
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
   * - 手动设置 SSE 响应头
   * - 使用 Express Response 直接写入流
   * - 确保数据立即发送，不被缓冲
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
  @ApiOperation({ summary: '流式聊天' })
  @ApiResponse({ status: 200, description: 'SSE 流式响应' })
  async stream(
    @Body() dto: ChatRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    console.log('[ChatController] 流式请求:', dto.sessionId);

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲

    // 立即发送响应头
    res.flushHeaders();

    // 调用服务处理流式响应
    const cleanup = this.chatService.streamResponse(
      dto,
      // 发送数据块
      (data: Record<string, unknown>) => {
        // 手动构造 SSE 格式：data: {...}\n\n
        const sseData = `data: ${JSON.stringify(data)}\n\n`;
        res.write(sseData);
      },
      // 完成
      () => {
        res.end();
        console.log('[ChatController] 流式响应完成');
      },
    );

    // 监听客户端断开连接
    res.on('close', () => {
      console.log('[ChatController] 客户端断开连接');
      cleanup();
    });
  }
}
