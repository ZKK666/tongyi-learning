/**
 * 聊天状态管理
 *
 * 职责：
 * - 管理会话列表
 * - 管理当前会话的消息
 * - 处理流式消息状态
 * - 持久化会话数据
 *
 * 设计要点：
 * - 流式消息单独存储，避免频繁更新整个消息列表
 * - 使用 localStorage 持久化会话和消息
 * - 提供完整的 CRUD 操作
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Session, Segment } from '@/shared/types';
import { createLogger } from '@/shared/utils';

const logger = createLogger('ChatStore');

/**
 * 流式消息状态
 */
interface StreamingMessage {
  id: string;
  content: string;
  segments: Segment[];
}

/**
 * 聊天状态接口
 */
interface ChatState {
  // 会话相关
  sessions: Session[];
  currentSessionId: string | null;

  // 消息相关（按 sessionId 分组存储）
  messagesBySession: Record<string, Message[]>;

  // 流式消息（正在生成的消息）
  streamingMessage: StreamingMessage | null;

  // 加载状态
  isLoadingSessions: boolean;
  isSendingMessage: boolean;

  // 会话操作
  createSession: () => string;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  setCurrentSession: (sessionId: string | null) => void;

  // 消息操作
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  clearSessionMessages: (sessionId: string) => void;

  // 流式消息操作
  startStreaming: (messageId: string) => void;
  appendStreamingContent: (content: string) => void;
  setStreamingSegments: (segments: Segment[]) => void;
  finishStreaming: () => Message | null;
  cancelStreaming: () => void;

  // 辅助方法
  getCurrentMessages: () => Message[];
  getSessionById: (sessionId: string) => Session | undefined;
}

/**
 * 聊天状态 Store
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // 初始状态
      sessions: [],
      currentSessionId: null,
      messagesBySession: {},
      streamingMessage: null,
      isLoadingSessions: false,
      isSendingMessage: false,

      // 创建新会话
      createSession: () => {
        const id = uuidv4();
        const now = new Date().toISOString();

        const newSession: Session = {
          id,
          title: '新对话',
          createdAt: now,
          updatedAt: now,
          messageCount: 0,
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: id,
          messagesBySession: {
            ...state.messagesBySession,
            [id]: [],
          },
        }));

        logger.info('Session created', { sessionId: id });
        return id;
      },

      // 删除会话
      deleteSession: (sessionId: string) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== sessionId);
          const newMessages = { ...state.messagesBySession };
          delete newMessages[sessionId];

          // 如果删除的是当前会话，切换到第一个会话
          const newCurrentId =
            state.currentSessionId === sessionId
              ? newSessions[0]?.id || null
              : state.currentSessionId;

          return {
            sessions: newSessions,
            currentSessionId: newCurrentId,
            messagesBySession: newMessages,
          };
        });

        logger.info('Session deleted', { sessionId });
      },

      // 更新会话标题
      updateSessionTitle: (sessionId: string, title: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, title, updatedAt: new Date().toISOString() }
              : session
          ),
        }));

        logger.info('Session title updated', { sessionId, title });
      },

      // 设置当前会话
      setCurrentSession: (sessionId: string | null) => {
        set({ currentSessionId: sessionId });
        logger.info('Current session changed', { sessionId });
      },

      // 添加消息
      addMessage: (message: Message) => {
        set((state) => {
          const sessionMessages = state.messagesBySession[message.sessionId] || [];

          return {
            messagesBySession: {
              ...state.messagesBySession,
              [message.sessionId]: [...sessionMessages, message],
            },
            // 更新会话的消息数量和更新时间
            sessions: state.sessions.map((session) =>
              session.id === message.sessionId
                ? {
                    ...session,
                    messageCount: sessionMessages.length + 1,
                    updatedAt: new Date().toISOString(),
                  }
                : session
            ),
          };
        });

        logger.info('Message added', { messageId: message.id, sessionId: message.sessionId });
      },

      // 更新消息
      updateMessage: (messageId: string, updates: Partial<Message>) => {
        set((state) => {
          const newMessagesBySession = { ...state.messagesBySession };

          for (const sessionId in newMessagesBySession) {
            newMessagesBySession[sessionId] = newMessagesBySession[sessionId]?.map(
              (msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)
            ) || [];
          }

          return { messagesBySession: newMessagesBySession };
        });
      },

      // 删除消息
      deleteMessage: (messageId: string) => {
        set((state) => {
          const newMessagesBySession = { ...state.messagesBySession };

          for (const sessionId in newMessagesBySession) {
            newMessagesBySession[sessionId] = newMessagesBySession[sessionId]?.filter(
              (msg) => msg.id !== messageId
            ) || [];
          }

          return { messagesBySession: newMessagesBySession };
        });
      },

      // 清空会话消息
      clearSessionMessages: (sessionId: string) => {
        set((state) => ({
          messagesBySession: {
            ...state.messagesBySession,
            [sessionId]: [],
          },
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, messageCount: 0 }
              : session
          ),
        }));

        logger.info('Session messages cleared', { sessionId });
      },

      // 开始流式消息
      startStreaming: (messageId: string) => {
        set({
          streamingMessage: {
            id: messageId,
            content: '',
            segments: [],
          },
          isSendingMessage: true,
        });

        logger.info('Streaming started', { messageId });
      },

      // 追加流式内容
      appendStreamingContent: (content: string) => {
        set((state) => {
          if (!state.streamingMessage) return state;

          return {
            streamingMessage: {
              ...state.streamingMessage,
              content: state.streamingMessage.content + content,
            },
          };
        });
      },

      // 设置流式消息的 segments
      setStreamingSegments: (segments: Segment[]) => {
        set((state) => {
          if (!state.streamingMessage) return state;

          return {
            streamingMessage: {
              ...state.streamingMessage,
              segments,
            },
          };
        });
      },

      // 完成流式消息
      finishStreaming: () => {
        const state = get();
        const { streamingMessage, currentSessionId } = state;

        if (!streamingMessage || !currentSessionId) {
          return null;
        }

        // 构建最终消息
        const finalMessage: Message = {
          id: streamingMessage.id,
          sessionId: currentSessionId,
          role: 'assistant',
          segments: streamingMessage.segments.length > 0
            ? streamingMessage.segments
            : [{ type: 'text', text: streamingMessage.content }],
          status: 'done',
          createdAt: new Date().toISOString(),
        };

        // 添加到消息列表
        get().addMessage(finalMessage);

        // 清空流式状态
        set({
          streamingMessage: null,
          isSendingMessage: false,
        });

        logger.info('Streaming finished', { messageId: streamingMessage.id });
        return finalMessage;
      },

      // 取消流式消息
      cancelStreaming: () => {
        set({
          streamingMessage: null,
          isSendingMessage: false,
        });

        logger.info('Streaming cancelled');
      },

      // 获取当前会话的消息
      getCurrentMessages: () => {
        const state = get();
        if (!state.currentSessionId) return [];
        return state.messagesBySession[state.currentSessionId] || [];
      },

      // 根据 ID 获取会话
      getSessionById: (sessionId: string) => {
        return get().sessions.find((s) => s.id === sessionId);
      },
    }),
    {
      name: 'tongyi-chat',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        messagesBySession: state.messagesBySession,
      }),
    }
  )
);
