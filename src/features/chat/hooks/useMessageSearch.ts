/**
 * 消息搜索 Hook
 *
 * 职责：
 * - 全文搜索消息内容
 * - 高亮匹配文本
 * - 结果定位
 *
 * 技术要点：
 * - 正则表达式匹配
 * - 防抖搜索
 * - 高亮标记
 */
import { useState, useCallback, useMemo } from 'react';
import type { Message } from '@/shared/types';
import { isTextSegment } from '@/shared/types';

interface SearchResult {
  messageId: string;
  segmentIndex: number;
  matchStart: number;
  matchEnd: number;
  context: string; // 匹配上下文
}

interface UseMessageSearchOptions {
  messages: Message[];
  contextLength?: number; // 上下文长度，默认 50
}

/**
 * 高亮文本
 *
 * 将匹配的关键词用 <mark> 标签包裹
 */
export function highlightText(text: string, keyword: string): string {
  if (!keyword.trim()) return text;

  try {
    // 转义正则特殊字符
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>');
  } catch {
    return text;
  }
}

/**
 * 消息搜索 Hook
 */
export function useMessageSearch({ messages, contextLength = 50 }: UseMessageSearchOptions) {
  const [keyword, setKeyword] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * 搜索结果
   */
  const results = useMemo(() => {
    if (!keyword.trim()) return [];

    const searchResults: SearchResult[] = [];
    const lowerKeyword = keyword.toLowerCase();

    for (const message of messages) {
      for (let i = 0; i < message.segments.length; i++) {
        const segment = message.segments[i];
        if (!segment || !isTextSegment(segment)) continue;

        const text = segment.text;
        const lowerText = text.toLowerCase();
        let startIndex = 0;

        // 查找所有匹配
        while (true) {
          const matchIndex = lowerText.indexOf(lowerKeyword, startIndex);
          if (matchIndex === -1) break;

          // 提取上下文
          const contextStart = Math.max(0, matchIndex - contextLength);
          const contextEnd = Math.min(text.length, matchIndex + keyword.length + contextLength);
          let context = text.slice(contextStart, contextEnd);

          if (contextStart > 0) context = '...' + context;
          if (contextEnd < text.length) context = context + '...';

          searchResults.push({
            messageId: message.id,
            segmentIndex: i,
            matchStart: matchIndex,
            matchEnd: matchIndex + keyword.length,
            context,
          });

          startIndex = matchIndex + 1;
        }
      }
    }

    return searchResults;
  }, [messages, keyword, contextLength]);

  /**
   * 跳转到下一个结果
   */
  const goToNext = useCallback(() => {
    if (results.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % results.length);
  }, [results.length]);

  /**
   * 跳转到上一个结果
   */
  const goToPrevious = useCallback(() => {
    if (results.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
  }, [results.length]);

  /**
   * 清除搜索
   */
  const clearSearch = useCallback(() => {
    setKeyword('');
    setCurrentIndex(0);
  }, []);

  /**
   * 当前选中的结果
   */
  const currentResult = results[currentIndex] || null;

  /**
   * 判断消息是否包含匹配
   */
  const hasMatch = useCallback(
    (messageId: string) => {
      return results.some((r) => r.messageId === messageId);
    },
    [results]
  );

  /**
   * 获取高亮后的文本
   */
  const getHighlightedText = useCallback(
    (text: string) => {
      return highlightText(text, keyword);
    },
    [keyword]
  );

  return {
    keyword,
    setKeyword,
    results,
    currentIndex,
    currentResult,
    totalCount: results.length,
    goToNext,
    goToPrevious,
    clearSearch,
    hasMatch,
    getHighlightedText,
  };
}
