/**
 * 清理服务 - 定时任务
 *
 * 学习要点：
 * - @Cron() 装饰器定义定时任务
 * - CronExpression 提供常用表达式
 * - @Interval() 按固定间隔执行
 * - @Timeout() 延迟执行一次
 *
 * Cron 表达式格式：
 * * * * * * *
 * ┬ ┬ ┬ ┬ ┬ ┬
 * │ │ │ │ │ └── 星期 (0-7, 0和7都是周日)
 * │ │ │ │ └──── 月份 (1-12)
 * │ │ │ └────── 日期 (1-31)
 * │ │ └──────── 小时 (0-23)
 * │ └────────── 分钟 (0-59)
 * └──────────── 秒 (0-59, 可选)
 *
 * 常用表达式：
 * - '0 * * * *' 每小时
 * - '0 0 * * *' 每天午夜
 * - '0 0 * * 0' 每周日午夜
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionStore } from '../../session/session.store';
import { ChatStore } from '../../chat/chat.store';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly sessionStore: SessionStore,
    private readonly chatStore: ChatStore,
  ) {}

  /**
   * 清理空会话
   *
   * 每小时执行一次，删除没有消息的会话
   *
   * 学习要点：
   * - @Cron() 定义执行时间
   * - 可以使用 CronExpression 常量或自定义表达式
   */
  @Cron(CronExpression.EVERY_HOUR)
  handleCleanupEmptySessions() {
    this.logger.log('开始清理空会话...');

    const sessions = this.sessionStore.findAll();
    let cleanedCount = 0;

    sessions.forEach((session) => {
      const messages = this.chatStore.getBySessionId(session.id);

      // 如果会话没有消息，删除它
      if (messages.length === 0) {
        this.sessionStore.delete(session.id);
        cleanedCount++;
        this.logger.debug(`删除空会话: ${session.id}`);
      }
    });

    if (cleanedCount > 0) {
      this.logger.log(`清理完成，删除了 ${cleanedCount} 个空会话`);
    } else {
      this.logger.log('没有需要清理的空会话');
    }
  }

  /**
   * 清理过期会话（示例）
   *
   * 每天午夜执行，删除超过30天未更新的会话
   *
   * 学习要点：
   * - 可以定义多个定时任务
   * - 每个任务独立执行
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCleanupOldSessions() {
    this.logger.log('开始清理过期会话...');

    const sessions = this.sessionStore.findAll();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let cleanedCount = 0;

    sessions.forEach((session) => {
      const updatedAt = new Date(session.updatedAt).getTime();

      // 如果会话超过30天未更新，删除它
      if (updatedAt < thirtyDaysAgo) {
        // 同时删除会话的消息
        this.chatStore.deleteBySessionId(session.id);
        this.sessionStore.delete(session.id);
        cleanedCount++;
        this.logger.debug(`删除过期会话: ${session.id}`);
      }
    });

    if (cleanedCount > 0) {
      this.logger.log(`清理完成，删除了 ${cleanedCount} 个过期会话`);
    } else {
      this.logger.log('没有需要清理的过期会话');
    }
  }
}
