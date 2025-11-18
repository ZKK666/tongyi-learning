/**
 * 聊天服务
 *
 * 学习要点：
 * - 流式输出的核心实现
 * - 打字机效果：逐字符发送
 * - 定时器控制输出速度
 */

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { ChatStore } from './chat.store';
import { SessionStore } from '../session/session.store';
import { getResponseByKeyword } from '../common/mock-data/responses';
import { MessageCreatedEvent, EVENTS } from '../common/events/message.events';
import type { ChatRequestDto, Message } from '../common/types';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatStore: ChatStore,
    private readonly sessionStore: SessionStore,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 获取会话消息
   */
  async getMessages(sessionId: string): Promise<Message[]> {
    return this.chatStore.getBySessionId(sessionId);
  }

  /**
   * 流式响应
   *
   * 学习要点：
   * - 回调函数模式：onData 发送数据，onComplete 结束
   * - setInterval 控制打字速度
   * - 返回清理函数用于取消
   *
   * @param dto 聊天请求
   * @param onData 数据回调
   * @param onComplete 完成回调
   * @returns 清理函数
   */
  streamResponse(
    dto: ChatRequestDto,
    onData: (data: Record<string, unknown>) => void,
    onComplete: () => void,
  ): () => void {
    const { sessionId, messages } = dto;

    // 如果会话不存在，自动创建
    // 这处理前端本地创建会话但后端不知道的情况
    if (!this.sessionStore.findById(sessionId)) {
      this.sessionStore.createWithId(sessionId, {
        title: '新对话',
        messageCount: 0,
      });
      console.log(`[ChatService] 自动创建会话: ${sessionId}`);
    }

    // 获取用户最后一条消息
    const lastUserMessage = messages[messages.length - 1];
    const userContent = lastUserMessage?.content || '';

    // 保存用户消息
    const userMessage: Message = {
      id: uuidv4(),
      sessionId,
      role: 'user',
      segments: [{ type: 'text', text: userContent }],
      status: 'done',
      createdAt: new Date().toISOString(),
    };
    this.chatStore.addMessage(userMessage);
    this.sessionStore.incrementMessageCount(sessionId);

    // 触发消息创建事件（用于自动生成标题等）
    this.eventEmitter.emit(
      EVENTS.MESSAGE_CREATED,
      new MessageCreatedEvent(sessionId, userMessage.id, userContent, 'user'),
    );

    // 根据用户输入获取 Mock 响应
    const responseContent = getResponseByKeyword(userContent);

    // 生成助手消息 ID
    const assistantMessageId = uuidv4();

    console.log(`[ChatService] 开始流式响应，内容长度: ${responseContent.length}`);

    /**
     * 流式输出状态
     */
    let index = 0;
    let fullContent = '';
    let cancelled = false;

    /**
     * 定时器逐字输出
     *
     * 学习要点：
     * - 30ms 间隔产生流畅的打字效果
     * - 每次发送 1-3 个字符
     * - 真实项目中这是 AI 模型的流式返回
     */
    const interval = setInterval(() => {
      // 检查是否被取消
      if (cancelled) {
        clearInterval(interval);
        return;
      }

      // 还有内容未发送
      if (index < responseContent.length) {
        // 每次发送 1-3 个字符（模拟真实打字速度）
        const chunkSize = Math.min(
          Math.floor(Math.random() * 3) + 1,
          responseContent.length - index,
        );
        const chunk = responseContent.slice(index, index + chunkSize);

        // 发送数据块
        onData({ delta: chunk });

        fullContent += chunk;
        index += chunkSize;
      } else {
        // 内容发送完毕
        clearInterval(interval);

        // 保存助手消息
        const assistantMessage: Message = {
          id: assistantMessageId,
          sessionId,
          role: 'assistant',
          segments: [{ type: 'text', text: fullContent }],
          status: 'done',
          createdAt: new Date().toISOString(),
        };
        this.chatStore.addMessage(assistantMessage);
        this.sessionStore.incrementMessageCount(sessionId);

        // 发送完成信号
        onData({ finish_reason: 'stop' });

        console.log(`[ChatService] 流式响应完成: ${assistantMessageId}`);

        // 通知完成
        onComplete();
      }
    }, 30);  // 30ms 间隔

    /**
     * 返回清理函数
     *
     * 学习要点：
     * - 客户端断开连接时调用
     * - 清除定时器，释放资源
     * - 这是防止内存泄漏的重要步骤
     */
    return () => {
      cancelled = true;
      clearInterval(interval);
      console.log(`[ChatService] 流式响应被取消: ${assistantMessageId}`);
    };
  }
}
