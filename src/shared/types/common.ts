/**
 * 通用类型定义
 *
 * 包含项目中通用的类型定义
 */

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 消息角色类型
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 消息状态
 */
export type MessageStatus = 'sending' | 'streaming' | 'done' | 'error';

/**
 * 内容片段类型
 */
export type SegmentType = 'text' | 'card' | 'image' | 'code';

/**
 * 文本片段
 */
export interface TextSegment {
  type: 'text';
  text: string;
}

/**
 * 卡片片段
 */
export interface CardSegment {
  type: 'card';
  cardType: string;
  payload: Record<string, unknown>;
}

/**
 * 图片片段
 */
export interface ImageSegment {
  type: 'image';
  url: string;
  alt?: string;
}

/**
 * 代码片段
 */
export interface CodeSegment {
  type: 'code';
  language: string;
  code: string;
}

/**
 * 内容片段联合类型
 */
export type Segment = TextSegment | CardSegment | ImageSegment | CodeSegment;

/**
 * 消息结构
 */
export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  segments: Segment[];
  status: MessageStatus;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 会话结构
 */
export interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

/**
 * 类型守卫：判断是否为文本片段
 */
export function isTextSegment(segment: Segment): segment is TextSegment {
  return segment.type === 'text';
}

/**
 * 类型守卫：判断是否为卡片片段
 */
export function isCardSegment(segment: Segment): segment is CardSegment {
  return segment.type === 'card';
}

/**
 * 类型守卫：判断是否为图片片段
 */
export function isImageSegment(segment: Segment): segment is ImageSegment {
  return segment.type === 'image';
}

/**
 * 类型守卫：判断是否为代码片段
 */
export function isCodeSegment(segment: Segment): segment is CodeSegment {
  return segment.type === 'code';
}
