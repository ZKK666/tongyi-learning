/**
 * 共享类型定义
 *
 * 说明：
 * - 这些类型需要与前端保持一致
 * - 在真实项目中，可以抽离到共享包（monorepo）
 * - 类型定义是 TypeScript 的核心优势，确保前后端接口一致性
 */

/**
 * 用户信息
 *
 * 学习要点：
 * - interface 定义对象结构
 * - 可选属性用 ? 标记
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;  // 可选属性
  role?: 'user' | 'admin';  // 用户角色
}

/**
 * 会话信息
 *
 * 学习要点：
 * - 会话是消息的容器
 * - updatedAt 用于排序（最近对话在前）
 */
export interface Session {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;   // ISO 8601 格式
  updatedAt: string;
}

/**
 * 消息状态枚举
 *
 * 学习要点：
 * - 使用字面量联合类型代替 enum
 * - 更简洁，且与 JSON 兼容
 */
export type MessageStatus = 'pending' | 'streaming' | 'done' | 'error';

/**
 * 消息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 消息段落类型
 *
 * 学习要点：
 * - 使用 type 和 联合类型实现多态
 * - 每种类型有不同的字段结构
 */
export type Segment =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'card'; cardType: string; data: Record<string, unknown> }
  | { type: 'tool_call'; name: string; arguments: Record<string, unknown> };

/**
 * 消息结构
 *
 * 学习要点：
 * - segments 数组支持富文本消息（文字+图片+代码等混合）
 * - 这种设计比单纯的 content 字符串更灵活
 */
export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  segments: Segment[];
  status: MessageStatus;
  createdAt: string;
}

/**
 * 聊天请求 DTO（Data Transfer Object）
 *
 * 学习要点：
 * - DTO 是接口层的数据结构
 * - 与内部实体（Entity）分离，便于验证和转换
 */
export interface ChatRequestDto {
  sessionId: string;
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
}

/**
 * 登录请求 DTO
 */
export interface LoginDto {
  username: string;
  password: string;
}

/**
 * API 响应包装器
 *
 * 学习要点：
 * - 统一响应格式便于前端处理
 * - 泛型 <T> 让响应数据类型灵活
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
