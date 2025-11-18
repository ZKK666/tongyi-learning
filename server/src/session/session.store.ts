/**
 * 会话内存存储服务
 *
 * 学习要点：
 * - 使用 Map 作为内存数据库
 * - @Injectable() 装饰器让类可被依赖注入
 * - NestJS 默认是单例模式，数据在服务生命周期内保持
 *
 * 为什么用内存存储？
 * - 快速原型开发，无需配置数据库
 * - 便于理解业务逻辑，后续可替换为真实数据库
 * - 重启后数据重置，适合演示
 */

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { Session } from '../common/types';
import { INITIAL_SESSIONS } from '../common/mock-data/responses';

@Injectable()
export class SessionStore {
  /**
   * 使用 Map 存储会话数据
   *
   * 学习要点：
   * - Map 比对象性能更好（频繁增删）
   * - 键值对存储，键是会话 ID
   * - private 确保只能通过方法访问
   */
  private sessions = new Map<string, Session>();

  constructor() {
    // 初始化 Mock 数据
    this.initMockData();
  }

  /**
   * 初始化模拟数据
   *
   * 学习要点：
   * - 在构造函数中调用，服务启动时自动执行
   * - 提供初始数据便于测试
   */
  private initMockData(): void {
    const now = new Date().toISOString();

    INITIAL_SESSIONS.forEach((session) => {
      this.sessions.set(session.id, {
        ...session,
        createdAt: now,
        updatedAt: now,
      });
    });

    console.log(`[SessionStore] 初始化 ${this.sessions.size} 个会话`);
  }

  /**
   * 获取所有会话
   *
   * 学习要点：
   * - Array.from() 将 Map.values() 转为数组
   * - 返回副本，防止外部直接修改内部数据
   */
  findAll(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * 根据 ID 查找会话
   *
   * 学习要点：
   * - 返回 undefined 表示未找到
   * - 调用方需要处理 undefined 情况
   */
  findById(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  /**
   * 创建新会话
   *
   * 学习要点：
   * - Omit<Session, 'id' | 'createdAt' | 'updatedAt'> 表示排除这些字段
   * - 这些字段由服务端生成，不由客户端传入
   * - uuidv4() 生成唯一 ID
   */
  create(data: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Session {
    const now = new Date().toISOString();

    const session: Session = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(session.id, session);
    console.log(`[SessionStore] 创建会话: ${session.id}`);

    return session;
  }

  /**
   * 更新会话
   *
   * 学习要点：
   * - Partial<Session> 表示所有字段都是可选的
   * - 只更新传入的字段，其他保持不变
   * - 展开运算符 ... 实现对象合并
   */
  update(id: string, data: Partial<Session>): Session | undefined {
    const existing = this.sessions.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: Session = {
      ...existing,
      ...data,
      id: existing.id,  // ID 不可修改
      createdAt: existing.createdAt,  // 创建时间不可修改
      updatedAt: new Date().toISOString(),  // 自动更新修改时间
    };

    this.sessions.set(id, updated);
    console.log(`[SessionStore] 更新会话: ${id}`);

    return updated;
  }

  /**
   * 删除会话
   *
   * 学习要点：
   * - Map.delete() 返回是否删除成功
   * - 返回 boolean 便于调用方判断
   */
  delete(id: string): boolean {
    const result = this.sessions.delete(id);

    if (result) {
      console.log(`[SessionStore] 删除会话: ${id}`);
    }

    return result;
  }

  /**
   * 增加消息计数
   *
   * 学习要点：
   * - 专门的方法处理特定业务逻辑
   * - 比通用 update 更语义化
   */
  incrementMessageCount(id: string): void {
    const session = this.sessions.get(id);

    if (session) {
      session.messageCount += 1;
      session.updatedAt = new Date().toISOString();
    }
  }
}
