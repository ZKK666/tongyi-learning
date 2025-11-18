/**
 * useChatStream - 流式对话核心 Hook
 *
 * 职责：
 * - 管理 SSE 连接生命周期
 * - 解析流式数据并通过回调通知 UI 更新
 * - 支持中断当前请求
 *
 * 为什么独立成 Hook：
 * - 流式逻辑与 UI 渲染解耦，便于替换实现（SSE → WebSocket）
 * - 真实项目中可以抽离到独立的 SDK 包
 * - 便于单元测试
 *
 * 设计要点：
 * - 使用 AbortController 支持中断
 * - 不直接操作 store，通过回调解耦
 * - 支持多种流式协议
 */
import { useRef, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Segment } from '@/shared/types';
import { createLogger } from '@/shared/utils';

const logger = createLogger('useChatStream');

/**
 * 聊天请求参数
 */
interface ChatRequest {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

/**
 * 流式回调函数
 */
interface StreamCallbacks {
  /** 流开始时调用 */
  onStart: (messageId: string) => void;
  /** 收到文本片段时调用 */
  onChunk: (delta: string) => void;
  /** 收到结构化数据（如卡片）时调用 */
  onSegments?: (segments: Segment[]) => void;
  /** 流完成时调用 */
  onComplete: (message: Message) => void;
  /** 发生错误时调用 */
  onError: (error: Error) => void;
}

/**
 * Hook 返回值
 */
interface UseChatStreamReturn {
  /** 开始流式请求 */
  startStream: (params: ChatRequest, callbacks: StreamCallbacks) => Promise<void>;
  /** 中断当前请求 */
  abort: () => void;
  /** 是否正在流式传输 */
  isStreaming: boolean;
  /** 错误信息 */
  error: Error | null;
}

/**
 * 流式对话 Hook
 *
 * @example
 * const { startStream, abort, isStreaming } = useChatStream();
 *
 * const handleSend = async (content: string) => {
 *   await startStream(
 *     { sessionId, messages: [...history, { role: 'user', content }] },
 *     {
 *       onStart: (id) => store.startStreaming(id),
 *       onChunk: (delta) => store.appendStreamingContent(delta),
 *       onComplete: (msg) => store.finishStreaming(),
 *       onError: (err) => message.error(err.message),
 *     }
 *   );
 * };
 */
export function useChatStream(): UseChatStreamReturn {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startStream = useCallback(
    async (params: ChatRequest, callbacks: StreamCallbacks) => {
      try {
        // 创建新的 AbortController
        abortControllerRef.current = new AbortController();
        setIsStreaming(true);
        setError(null);

        // 生成消息 ID
        const messageId = uuidv4();
        callbacks.onStart(messageId);

        logger.info('Stream starting', { sessionId: params.sessionId, messageId });

        // 发起流式请求（会被 MSW 拦截）
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 获取响应流
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        let finalSegments: Segment[] = [];

        // 读取流数据
        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;

          if (done) {
            logger.info('Stream ended');
            break;
          }

          // 解码并追加到缓冲区
          buffer += decoder.decode(result.value, { stream: true });

          // 按 SSE 格式分割处理
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; // 最后一个可能不完整，保留

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                // 处理文本增量
                if (data.delta) {
                  fullContent += data.delta;
                  callbacks.onChunk(data.delta);
                }

                // 处理结构化数据（如卡片）
                if (data.segments && Array.isArray(data.segments)) {
                  finalSegments = data.segments;
                  callbacks.onSegments?.(data.segments);
                }

                // 处理完成信号
                if (data.finish_reason === 'stop') {
                  // 构建最终消息的 segments
                  // 始终保留文本内容，同时添加其他结构化数据（卡片、工具等）
                  const messageSegments: Segment[] = [];

                  // 添加文本内容（打字机效果的内容）
                  if (fullContent) {
                    messageSegments.push({ type: 'text', text: fullContent });
                  }

                  // 添加其他结构化段落（卡片、工具调用等）
                  if (finalSegments.length > 0) {
                    messageSegments.push(...finalSegments);
                  }

                  // 如果没有任何内容，添加空文本
                  if (messageSegments.length === 0) {
                    messageSegments.push({ type: 'text', text: '' });
                  }

                  const finalMessage: Message = {
                    id: messageId,
                    sessionId: params.sessionId,
                    role: 'assistant',
                    segments: messageSegments,
                    status: 'done',
                    createdAt: new Date().toISOString(),
                  };

                  callbacks.onComplete(finalMessage);
                  logger.info('Stream completed', { messageId });
                }
              } catch (parseError) {
                logger.warn('Failed to parse SSE data', { line, error: parseError });
              }
            }
          }
        }
      } catch (err) {
        // 忽略用户主动中断
        if (err instanceof Error && err.name === 'AbortError') {
          logger.info('Stream aborted by user');
          return;
        }

        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        callbacks.onError(error);
        logger.error('Stream error', { error: error.message });
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      logger.info('Stream abort requested');
    }
  }, []);

  return {
    startStream,
    abort,
    isStreaming,
    error,
  };
}
