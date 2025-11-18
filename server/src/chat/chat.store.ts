/**
 * 消息内存存储服务
 *
 * 学习要点：
 * - 按会话 ID 分组存储消息
 * - 与 SessionStore 配合使用
 */

import { Injectable } from '@nestjs/common';
import type { Message } from '../common/types';

@Injectable()
export class ChatStore {
  /**
   * 消息存储
   *
   * 学习要点：
   * - 使用 Map<sessionId, Message[]> 结构
   * - 每个会话对应一个消息数组
   * - 按会话分组便于快速检索
   */
  private messages = new Map<string, Message[]>();

  /**
   * 获取会话的所有消息
   *
   * 学习要点：
   * - 返回空数组而非 undefined，简化调用方逻辑
   * - 防御式编程：总是返回有效值
   */
  getBySessionId(sessionId: string): Message[] {
    return this.messages.get(sessionId) || [];
  }

  /**
   * 添加消息到会话
   *
   * 学习要点：
   * - 如果会话不存在则创建新数组
   * - push 添加到末尾，保持时间顺序
   */
  addMessage(message: Message): void {
    const { sessionId } = message;
    const list = this.messages.get(sessionId) || [];

    list.push(message);
    this.messages.set(sessionId, list);

    console.log(`[ChatStore] 添加消息到会话 ${sessionId}, 当前 ${list.length} 条`);
  }

  /**
   * 删除会话的所有消息
   *
   * 学习要点：
   * - 当删除会话时，需要同时清理消息
   * - 保持数据一致性
   */
  deleteBySessionId(sessionId: string): boolean {
    const result = this.messages.delete(sessionId);

    if (result) {
      console.log(`[ChatStore] 删除会话 ${sessionId} 的所有消息`);
    }

    return result;
  }

  /**
   * 获取消息数量
   *
   * 学习要点：
   * - 用于统计和校验
   */
  getMessageCount(sessionId: string): number {
    const list = this.messages.get(sessionId);
    return list ? list.length : 0;
  }

  /**
   * 清空所有数据（用于测试）
   */
  clear(): void {
    this.messages.clear();
    console.log('[ChatStore] 已清空所有消息');
  }
}
