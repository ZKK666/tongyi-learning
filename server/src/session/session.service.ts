/**
 * 会话服务
 *
 * 学习要点：
 * - Service 调用 Store 层操作数据
 * - 封装业务逻辑，Controller 只负责路由
 */

import { Injectable } from '@nestjs/common';
import { SessionStore } from './session.store';
import { ChatStore } from '../chat/chat.store';
import type { Session } from '../common/types';

@Injectable()
export class SessionService {
  /**
   * 注入多个依赖
   *
   * 学习要点：
   * - 一个 Service 可以依赖多个其他 Service/Store
   * - NestJS 自动处理依赖关系
   */
  constructor(
    private readonly sessionStore: SessionStore,
    private readonly chatStore: ChatStore,
  ) {}

  /**
   * 获取所有会话（按更新时间排序）
   */
  async findAll(): Promise<Session[]> {
    const sessions = this.sessionStore.findAll();

    // 按更新时间降序排序（最新的在前）
    return sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  /**
   * 根据 ID 查找会话
   */
  async findById(id: string): Promise<Session | undefined> {
    return this.sessionStore.findById(id);
  }

  /**
   * 创建新会话
   */
  async create(title?: string): Promise<Session> {
    return this.sessionStore.create({
      title: title || '新对话',
      messageCount: 0,
    });
  }

  /**
   * 更新会话标题
   */
  async updateTitle(id: string, title: string): Promise<Session | undefined> {
    return this.sessionStore.update(id, { title });
  }

  /**
   * 删除会话
   *
   * 学习要点：
   * - 删除会话时需要同时删除关联的消息
   * - 保持数据一致性
   */
  async delete(id: string): Promise<boolean> {
    // 先删除消息
    this.chatStore.deleteBySessionId(id);

    // 再删除会话
    return this.sessionStore.delete(id);
  }
}
