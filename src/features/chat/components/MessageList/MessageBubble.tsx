/**
 * 消息气泡组件
 *
 * 职责：
 * - 渲染单条消息
 * - 区分用户/AI 消息样式
 * - 渲染不同类型的 segments
 */
import { memo } from 'react';
import { Avatar, Tooltip } from 'antd';
import { UserOutlined, RobotOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Message, Segment } from '@/shared/types';
import { isTextSegment, isCardSegment } from '@/shared/types';
import { ROLE_NAMES } from '@/shared/constants';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

/**
 * 渲染 Segment 内容
 */
function SegmentRenderer({ segment }: { segment: Segment }) {
  if (isTextSegment(segment)) {
    return (
      <div className="whitespace-pre-wrap break-words">
        {segment.text}
      </div>
    );
  }

  if (isCardSegment(segment)) {
    // TODO: Phase 11 实现卡片渲染
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mt-2">
        <div className="text-sm text-gray-500">
          [卡片: {segment.cardType}]
        </div>
        <pre className="text-xs mt-2 overflow-auto">
          {JSON.stringify(segment.payload, null, 2)}
        </pre>
      </div>
    );
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
    const isUser = message.role === 'user';
    const roleName = ROLE_NAMES[message.role] || message.role;

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
              <SegmentRenderer key={index} segment={segment} />
            ))}

            {/* 流式输出光标 */}
            {isStreaming && (
              <span className="streaming-cursor" />
            )}
          </div>

          {/* 操作按钮（仅 AI 消息显示） */}
          {!isUser && message.status === 'done' && (
            <div className="flex items-center gap-2 mt-3">
              <Tooltip title="复制">
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => {
                    const text = message.segments
                      .filter(isTextSegment)
                      .map((s) => s.text)
                      .join('\n');
                    navigator.clipboard.writeText(text);
                  }}
                >
                  <CopyOutlined className="text-sm" />
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
    return (
      prev.message.id === next.message.id &&
      prev.message.status === next.message.status &&
      prev.message.segments.length === next.message.segments.length &&
      prev.isStreaming === next.isStreaming
    );
  }
);
