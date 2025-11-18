/**
 * 聊天输入框组件
 *
 * 职责：
 * - 用户输入消息
 * - 发送消息
 * - 支持快捷键（Enter 发送，Shift+Enter 换行）
 * - 显示发送中状态
 */
import { useState, useRef, KeyboardEvent } from 'react';
import { Button, Input, message } from 'antd';
import { SendOutlined, StopOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '../../stores/chatStore';
import { useChatStream } from '../../hooks/useChatStream';
import { useResponsive, useSafeArea } from '@/shared/hooks';
import { UI, ERROR_MESSAGES } from '@/shared/constants';
import type { Message } from '@/shared/types';

const { TextArea } = Input;

/**
 * 聊天输入框组件
 */
export function ChatInput() {
  const [inputValue, setInputValue] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { isMobile } = useResponsive();
  const safeArea = useSafeArea();

  const {
    currentSessionId,
    getCurrentMessages,
    addMessage,
    createSession,
    startStreaming,
    appendStreamingContent,
    setStreamingSegments,
    finishStreaming,
    cancelStreaming,
    isSendingMessage,
  } = useChatStore();

  const { startStream, abort, isStreaming } = useChatStream();

  /**
   * 发送消息
   */
  const handleSend = async () => {
    const content = inputValue.trim();

    // 验证输入
    if (!content) {
      return;
    }

    if (content.length > UI.MAX_MESSAGE_LENGTH) {
      message.error(ERROR_MESSAGES.MESSAGE_TOO_LONG);
      return;
    }

    // 如果没有当前会话，创建一个
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession();
    }

    // 清空输入框
    setInputValue('');

    // 创建用户消息
    const userMessage: Message = {
      id: uuidv4(),
      sessionId,
      role: 'user',
      segments: [{ type: 'text', text: content }],
      status: 'done',
      createdAt: new Date().toISOString(),
    };

    // 添加用户消息到列表
    addMessage(userMessage);

    // 获取历史消息（用于上下文）
    const history = getCurrentMessages().map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.segments
        .filter((s) => s.type === 'text')
        .map((s) => (s as { text: string }).text)
        .join('\n'),
    }));

    // 发起流式请求
    await startStream(
      {
        sessionId,
        messages: [
          ...history,
          { role: 'user', content },
        ],
      },
      {
        onStart: (messageId) => {
          startStreaming(messageId);
        },
        onChunk: (delta) => {
          appendStreamingContent(delta);
        },
        onSegments: (segments) => {
          setStreamingSegments(segments);
        },
        onComplete: () => {
          finishStreaming();

          // 自动生成会话标题（使用第一条消息的前20个字符）
          const session = useChatStore.getState().getSessionById(sessionId!);
          if (session && session.title === '新对话' && content.length > 0) {
            const title = content.slice(0, 20) + (content.length > 20 ? '...' : '');
            useChatStore.getState().updateSessionTitle(sessionId!, title);
          }
        },
        onError: (error) => {
          cancelStreaming();
          message.error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
        },
      }
    );
  };

  /**
   * 停止生成
   */
  const handleStop = () => {
    abort();
    finishStreaming();
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送（不按 Shift）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) {
        handleSend();
      }
    }
  };

  return (
    <div
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      style={{ paddingBottom: isMobile ? safeArea.bottom : 0 }}
    >
      <div className="max-w-3xl mx-auto p-4">
        <div className="relative">
          <TextArea
            ref={textAreaRef as any}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? '正在生成中...' : '输入消息，Enter 发送，Shift+Enter 换行'}
            autoSize={{ minRows: 1, maxRows: 6 }}
            disabled={isStreaming}
            className="pr-12 resize-none rounded-xl"
          />

          {/* 发送/停止按钮 */}
          <div className="absolute right-2 bottom-2">
            {isStreaming || isSendingMessage ? (
              <Button
                type="text"
                icon={<StopOutlined />}
                onClick={handleStop}
                className="text-red-500 hover:text-red-600"
              />
            ) : (
              <Button
                type="text"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={
                  inputValue.trim()
                    ? 'text-primary-500 hover:text-primary-600'
                    : 'text-gray-300'
                }
              />
            )}
          </div>
        </div>

        {/* 提示文字 */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          通义千问可能会产生不准确的信息，包括人物、地点或事实
        </div>
      </div>
    </div>
  );
}
