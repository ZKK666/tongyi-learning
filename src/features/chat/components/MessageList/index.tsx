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
import { useEffect, useRef, useCallback } from 'react';
import { Empty } from 'antd';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '../../stores/chatStore';
import type { Message, Segment } from '@/shared/types';

/**
 * 判断滚动容器是否接近底部
 *
 * 学习要点：
 * - scrollTop + clientHeight >= scrollHeight - threshold
 * - threshold 给一个容差值，避免精确判断
 */
function isNearBottom(element: HTMLElement, threshold = 100): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
}

/**
 * 自定义比较函数
 *
 * 学习要点：
 * - Zustand 默认使用 Object.is 比较
 * - 对于对象类型的状态，需要自定义比较
 * - 这里比较 streamingMessage.content 来触发更新
 */
function streamingMessageEqual(
  a: { id: string; content: string; segments: Segment[] } | null,
  b: { id: string; content: string; segments: Segment[] } | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  // 比较 content 来检测打字机更新
  return a.id === b.id && a.content === b.content && a.segments === b.segments;
}

/**
 * 消息列表组件
 */
export function MessageList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  // 跟踪用户是否在底部附近（用于智能自动滚动）
  const isUserAtBottomRef = useRef(true);
  // 跟踪上一次消息数量（用于检测新消息）
  const prevMessageCountRef = useRef(0);

  /**
   * 使用选择器订阅状态
   *
   * 学习要点：
   * - Zustand 需要使用选择器来正确触发重新渲染
   * - 对于流式消息，需要订阅 content 来触发每次更新
   * - 使用自定义比较函数确保正确检测变化
   */
  const streamingMessage = useChatStore(
    (state) => state.streamingMessage,
    // 自定义比较：返回 true 表示相等（不更新），false 表示不相等（需要更新）
    streamingMessageEqual
  );
  const currentSessionId = useChatStore((state) => state.currentSessionId);
  const messagesBySession = useChatStore((state) => state.messagesBySession);

  /**
   * 滚动事件处理
   *
   * 学习要点：
   * - 检测用户是否手动滚动离开底部
   * - 如果用户在底部，打字机效果时自动跟随
   * - 如果用户滚动查看历史，不强制滚动
   */
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      isUserAtBottomRef.current = isNearBottom(scrollRef.current);
    }
  }, []);

  // 获取当前会话消息
  const messages = currentSessionId
    ? messagesBySession[currentSessionId] || []
    : [];

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

  /**
   * 智能自动滚动
   *
   * 学习要点：
   * - 新消息到来时总是滚动到底部
   * - 打字机效果时，只有用户在底部才自动滚动
   * - 用户滚动查看历史时不干扰
   */
  useEffect(() => {
    if (!scrollRef.current || allMessages.length === 0) return;

    const isNewMessage = allMessages.length !== prevMessageCountRef.current;
    prevMessageCountRef.current = allMessages.length;

    // 新消息到来时，总是滚动到底部并重置状态
    if (isNewMessage) {
      isUserAtBottomRef.current = true;
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
      return;
    }

    // 打字机效果更新时，只有用户在底部才自动滚动
    if (streamingMessage && isUserAtBottomRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      onScroll={handleScroll}
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
