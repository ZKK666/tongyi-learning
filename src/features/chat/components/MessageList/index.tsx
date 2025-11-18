/**
 * 消息列表组件
 *
 * 职责：
 * - 显示会话中的所有消息
 * - 包含流式消息的实时展示
 * - 自动滚动到底部
 * - 使用虚拟滚动优化大量消息的性能
 *
 * 技术要点：
 * - @tanstack/react-virtual 实现虚拟滚动
 * - 动态测量每条消息的高度
 * - 预估高度 + 实际测量结合
 */
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Empty } from 'antd';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '../../stores/chatStore';
import type { Message, Segment } from '@/shared/types';

/**
 * 预估消息高度
 *
 * 基于消息内容长度和类型估算高度
 * 用于虚拟滚动的初始高度
 */
function estimateMessageHeight(message: Message): number {
  // 基础高度（头像、角色名、padding）
  let height = 120;

  // 根据内容长度估算
  for (const segment of message.segments) {
    if (segment.type === 'text') {
      const textLength = segment.text.length;
      // 假设每行约50字符，每行高度约24px
      const lines = Math.ceil(textLength / 50);
      height += lines * 24;

      // 代码块额外高度
      const codeBlocks = (segment.text.match(/```/g) || []).length / 2;
      height += codeBlocks * 100;
    } else if (segment.type === 'card') {
      // 卡片固定高度
      height += 200;
    }
  }

  return Math.max(height, 100);
}

/**
 * 消息列表组件
 *
 * 使用虚拟滚动优化大量消息的渲染性能
 */
export function MessageList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getCurrentMessages, streamingMessage, currentSessionId } = useChatStore();

  const messages = getCurrentMessages();

  // 构建流式消息对象（如果有）
  const streamingMessageObj: Message | null = useMemo(
    () =>
      streamingMessage
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
        : null,
    [streamingMessage, currentSessionId]
  );

  // 合并历史消息和流式消息
  const allMessages = useMemo(
    () => (streamingMessageObj ? [...messages, streamingMessageObj] : messages),
    [messages, streamingMessageObj]
  );

  // 虚拟滚动配置
  const virtualizer = useVirtualizer({
    count: allMessages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: useCallback(
      (index: number) => {
        const message = allMessages[index];
        return message ? estimateMessageHeight(message) : 100;
      },
      [allMessages]
    ),
    overscan: 3, // 预渲染数量
  });

  // 自动滚动到底部
  useEffect(() => {
    if (allMessages.length > 0) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(allMessages.length - 1, {
          align: 'end',
          behavior: 'auto',
        });
      });
    }
  }, [allMessages.length, virtualizer]);

  // 流式消息更新时滚动到底部
  useEffect(() => {
    if (streamingMessage?.content && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingMessage?.content]);

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

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
    >
      {/* 虚拟滚动容器 */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = allMessages[virtualItem.index];
          if (!message) return null;

          const isStreaming = message.id === streamingMessageObj?.id;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MessageBubble
                message={message}
                isStreaming={isStreaming}
              />
            </div>
          );
        })}
      </div>

      {/* 底部留白 */}
      <div className="h-4" />
    </div>
  );
}
