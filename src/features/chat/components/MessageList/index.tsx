/**
 * 消息列表组件
 *
 * 职责：
 * - 显示会话中的所有消息
 * - 包含流式消息的实时展示
 * - 自动滚动到底部
 * - 消息多时使用虚拟滚动优化性能
 *
 * 技术要点：
 * - 消息少时普通渲染，多时虚拟滚动
 * - 避免流式输出时的卡顿问题
 */
import { useEffect, useRef } from 'react';
import { Empty } from 'antd';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '../../stores/chatStore';
import type { Message, Segment } from '@/shared/types';

/**
 * 消息列表组件
 */
export function MessageList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getCurrentMessages, streamingMessage, currentSessionId } = useChatStore();

  const messages = getCurrentMessages();

  // 构建流式消息对象（如果有）
  const streamingMessageObj: Message | null = streamingMessage
    ? {
        id: streamingMessage.id,
        sessionId: currentSessionId || '',
        role: 'assistant',
        segments:
          streamingMessage.segments.length > 0
            ? streamingMessage.segments
            : [{ type: 'text', text: streamingMessage.content } as Segment],
        status: 'streaming',
        createdAt: new Date().toISOString(),
      }
    : null;

  // 合并历史消息和流式消息
  const allMessages = streamingMessageObj
    ? [...messages, streamingMessageObj]
    : messages;

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current && allMessages.length > 0) {
      // 使用 requestAnimationFrame 避免卡顿
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [allMessages.length, streamingMessage?.content]);

  // 如果没有选中会话，显示欢迎页面
  if (!currentSessionId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            欢迎使用通义千问
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            点击左侧"新对话"开始对话
          </p>
        </div>
      </div>
    );
  }

  // 如果没有消息，显示空状态
  if (allMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Empty
          description="开始一个新对话"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // 使用普通渲染（避免流式输出时的卡顿问题）
  // TODO: 消息量大时可考虑切换到虚拟滚动
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
    >
      {/* 消息列表 */}
      {allMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={message.id === streamingMessageObj?.id}
        />
      ))}

      {/* 底部留白 */}
      <div className="h-4" />
    </div>
  );
}
