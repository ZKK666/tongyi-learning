/**
 * 消息无限加载 Hook
 *
 * 使用 useInfiniteQuery 实现消息的分页加载
 *
 * 技术要点：
 * - 基于游标的分页（cursor-based pagination）
 * - 向上滚动加载更多历史消息
 * - 自动合并分页数据
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Message } from '@/shared/types';
import { getAuthHeaders } from '@/shared/utils';

interface MessagesPage {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

interface UseMessagesInfiniteOptions {
  sessionId: string | null;
  limit?: number;
  enabled?: boolean;
}

/**
 * 获取会话消息（分页）
 */
async function fetchMessages(
  sessionId: string,
  cursor: string | null,
  limit: number
): Promise<MessagesPage> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (cursor) {
    params.set('cursor', cursor);
  }

  const response = await fetch(
    `/api/sessions/${sessionId}/messages?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('获取消息失败');
  }

  return response.json();
}

/**
 * 消息无限加载 Hook
 *
 * @example
 * const {
 *   messages,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useMessagesInfinite({ sessionId: 'session_1' });
 */
export function useMessagesInfinite({
  sessionId,
  limit = 10,
  enabled = true,
}: UseMessagesInfiniteOptions) {
  const query = useInfiniteQuery({
    queryKey: ['messages', sessionId],
    queryFn: ({ pageParam }) =>
      fetchMessages(sessionId!, pageParam as string | null, limit),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 60 * 5, // 5分钟
    refetchOnWindowFocus: false,
  });

  // 合并所有页面的消息
  const messages = query.data?.pages
    .flatMap((page) => page.messages)
    // 去重（防止重复消息）
    .filter(
      (msg, index, arr) => arr.findIndex((m) => m.id === msg.id) === index
    )
    // 按时间排序
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ) || [];

  return {
    ...query,
    messages,
    total: query.data?.pages[0]?.total || 0,
  };
}
