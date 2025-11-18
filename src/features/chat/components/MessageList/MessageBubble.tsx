/**
 * 消息气泡组件
 *
 * 职责：
 * - 渲染单条消息
 * - 区分用户/AI 消息样式
 * - 渲染不同类型的 segments（文本、卡片）
 * - 支持 Markdown 渲染
 */
import { memo } from 'react';
import { Avatar, Tooltip, App } from 'antd';
import { UserOutlined, RobotOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';
import dayjs from 'dayjs';
import type { Message, Segment } from '@/shared/types';
import { isTextSegment, isCardSegment, isToolCallSegment } from '@/shared/types';
import { ROLE_NAMES } from '@/shared/constants';
import { MarkdownRenderer } from '@/shared/components/MarkdownRenderer';
import { CardRenderer } from '@/features/cards';
import { ToolCallRenderer } from '../ToolCallRenderer';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

/**
 * 渲染 Segment 内容
 */
function SegmentRenderer({
  segment,
  isUserMessage
}: {
  segment: Segment;
  isUserMessage: boolean;
}) {
  if (isTextSegment(segment)) {
    // 用户消息直接显示文本，AI 消息使用 Markdown 渲染
    if (isUserMessage) {
      return (
        <div className="whitespace-pre-wrap break-words">
          {segment.text}
        </div>
      );
    }

    return <MarkdownRenderer content={segment.text} />;
  }

  if (isCardSegment(segment)) {
    return <CardRenderer segment={segment} />;
  }

  if (isToolCallSegment(segment)) {
    return <ToolCallRenderer segment={segment} />;
  }

  return null;
}

/**
 * 消息气泡组件
 *
 * 使用 memo 优化渲染性能
 */
export const MessageBubble = memo(
  function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
    const [copied, setCopied] = useState(false);
    const { message: messageApi } = App.useApp();
    const isUser = message.role === 'user';
    const roleName = ROLE_NAMES[message.role] || message.role;

    // 复制消息内容
    const handleCopy = async () => {
      const text = message.segments
        .filter(isTextSegment)
        .map((s) => s.text)
        .join('\n');

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        messageApi.success('已复制到剪贴板');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        messageApi.error('复制失败');
      }
    };

    return (
      <div
        className={`
          flex gap-3 px-4 py-6
          ${isUser ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}
          message-enter
        `}
      >
        {/* 头像 */}
        <div className="flex-shrink-0">
          <Avatar
            size={36}
            icon={isUser ? <UserOutlined /> : <RobotOutlined />}
            className={
              isUser
                ? 'bg-gray-300 dark:bg-gray-600'
                : 'bg-primary-500'
            }
          />
        </div>

        {/* 消息内容 */}
        <div className="flex-1 min-w-0">
          {/* 角色名称和时间 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {roleName}
            </span>
            <span className="text-xs text-gray-400">
              {dayjs(message.createdAt).format('HH:mm')}
            </span>
          </div>

          {/* 消息内容区域 */}
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {message.segments.map((segment, index) => (
              <SegmentRenderer
                key={index}
                segment={segment}
                isUserMessage={isUser}
              />
            ))}

            {/* 流式输出光标 */}
            {isStreaming && (
              <span className="streaming-cursor" />
            )}
          </div>

          {/* 操作按钮（仅 AI 消息显示） */}
          {!isUser && message.status === 'done' && (
            <div className="flex items-center gap-2 mt-3">
              <Tooltip title={copied ? '已复制' : '复制'}>
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckOutlined className="text-sm text-green-500" />
                  ) : (
                    <CopyOutlined className="text-sm" />
                  )}
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    );
  },
  // 自定义比较函数
  (prev, next) => {
    // 基础属性比较
    if (
      prev.message.id !== next.message.id ||
      prev.message.status !== next.message.status ||
      prev.message.segments.length !== next.message.segments.length ||
      prev.isStreaming !== next.isStreaming
    ) {
      return false; // 不相等，需要重新渲染
    }

    // 流式消息需要比较文本内容，否则打字机效果不会更新
    if (prev.isStreaming || next.isStreaming) {
      // 比较第一个文本段落的内容（流式消息通常只有一个文本段落）
      const prevSegment = prev.message.segments[0];
      const nextSegment = next.message.segments[0];

      if (prevSegment && nextSegment &&
          isTextSegment(prevSegment) && isTextSegment(nextSegment)) {
        return prevSegment.text === nextSegment.text;
      }
    }

    return true; // 相等，不需要重新渲染
  }
);
