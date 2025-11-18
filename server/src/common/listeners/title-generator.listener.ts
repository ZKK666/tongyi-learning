/**
 * 标题生成监听器
 *
 * 学习要点：
 * - @OnEvent() 监听特定事件
 * - 事件处理器自动执行
 * - 可以异步处理不阻塞主流程
 *
 * 使用场景：
 * - 发送消息后自动生成会话标题
 * - 解耦聊天逻辑和标题生成逻辑
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { SessionStore } from '../../session/session.store';
import { MessageCreatedEvent, EVENTS } from '../events/message.events';

@Injectable()
export class TitleGeneratorListener {
  private readonly logger = new Logger(TitleGeneratorListener.name);

  constructor(
    private readonly sessionStore: SessionStore,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 监听消息创建事件
   *
   * 学习要点：
   * - @OnEvent() 指定监听的事件名
   * - async: true 表示异步处理，不阻塞事件发送方
   * - 只在第一条用户消息时生成标题
   */
  @OnEvent(EVENTS.MESSAGE_CREATED, { async: true })
  async handleMessageCreated(event: MessageCreatedEvent) {
    // 只处理用户消息
    if (event.role !== 'user') {
      return;
    }

    const session = this.sessionStore.findById(event.sessionId);
    if (!session) {
      this.logger.warn(`会话不存在: ${event.sessionId}`);
      return;
    }

    // 只在标题是默认值时生成新标题
    if (session.title !== '新对话') {
      return;
    }

    // 从配置获取标题最大长度
    const maxLength = this.configService.get<number>('schedule.titleMaxLength', 20);

    // 根据消息内容生成标题
    let newTitle = event.content.trim();

    // 移除换行符
    newTitle = newTitle.replace(/\n/g, ' ');

    // 截断过长的标题
    if (newTitle.length > maxLength) {
      newTitle = newTitle.slice(0, maxLength) + '...';
    }

    // 更新会话标题
    this.sessionStore.updateTitle(event.sessionId, newTitle);

    this.logger.log(`自动生成会话标题: "${newTitle}" (${event.sessionId})`);
  }
}
