/**
 * 消息列表组件
 *
 * 职责：
 * - 显示会话中的所有消息
 * - 包含流式消息的实时展示
 * - 自动滚动到底部
 *
 * TODO: Phase 14 添加虚拟滚动优化大量消息的性能
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

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, streamingMessage?.content]);

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
  if (messages.length === 0 && !streamingMessage) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Empty
          description="开始一个新对话"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // 构建流式消息对象（如果有）
  const streamingMessageObj: Message | null = streamingMessage
    ? {
        id: streamingMessage.id,
        sessionId: currentSessionId,
        role: 'assistant',
        segments:
          streamingMessage.segments.length > 0
            ? streamingMessage.segments
            : [{ type: 'text', text: streamingMessage.content } as Segment],
        status: 'streaming',
        createdAt: new Date().toISOString(),
      }
    : null;

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
    >
      {/* 历史消息 */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={false}
        />
      ))}

      {/* 流式消息 */}
      {streamingMessageObj && (
        <MessageBubble
          key={streamingMessageObj.id}
          message={streamingMessageObj}
          isStreaming={true}
        />
      )}

      {/* 底部留白 */}
      <div className="h-4" />
    </div>
  );
}
