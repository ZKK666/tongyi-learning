/**
 * 消息相关事件
 *
 * 学习要点：
 * - 定义事件类型和负载
 * - 事件名称使用常量避免拼写错误
 * - 事件负载使用类或接口定义
 *
 * 事件驱动架构的好处：
 * - 解耦：发送方不需要知道接收方
 * - 扩展性：可以添加多个监听器
 * - 异步：监听器可以异步处理
 */

/**
 * 消息创建事件负载
 */
export class MessageCreatedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly messageId: string,
    public readonly content: string,
    public readonly role: 'user' | 'assistant',
  ) {}
}

/**
 * 会话创建事件负载
 */
export class SessionCreatedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly title: string,
  ) {}
}

/**
 * 事件名称常量
 *
 * 学习要点：
 * - 使用常量避免字符串拼写错误
 * - 便于重构和查找引用
 */
export const EVENTS = {
  MESSAGE_CREATED: 'message.created',
  SESSION_CREATED: 'session.created',
} as const;
