/**
 * 搜索栏组件
 *
 * 提供消息全文搜索和结果导航
 *
 * 快捷键：
 * - Enter: 下一个结果
 * - Shift+Enter: 上一个结果
 * - Esc: 关闭搜索
 */
import { Input, Button, Space, Typography } from 'antd';
import type { KeyboardEvent } from 'react';
import {
  SearchOutlined,
  CloseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface SearchBarProps {
  keyword: string;
  setKeyword: (keyword: string) => void;
  totalCount: number;
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

/**
 * 搜索栏组件
 */
export function SearchBar({
  keyword,
  setKeyword,
  totalCount,
  currentIndex,
  onNext,
  onPrevious,
  onClose,
}: SearchBarProps) {
  /**
   * 键盘事件处理
   *
   * 学习要点：
   * - Enter 跳转到下一个结果
   * - Shift+Enter 跳转到上一个结果
   * - Esc 关闭搜索
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (totalCount > 0) {
        if (e.shiftKey) {
          onPrevious();
        } else {
          onNext();
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <SearchOutlined className="text-gray-400" />

      <Input
        placeholder="搜索消息内容..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
        allowClear
        autoFocus
      />

      {/* 搜索结果计数 */}
      {keyword && (
        <Text type="secondary" className="text-sm whitespace-nowrap">
          {totalCount > 0
            ? `${currentIndex + 1} / ${totalCount}`
            : '无结果'}
        </Text>
      )}

      {/* 导航按钮 */}
      <Space size="small">
        <Button
          type="text"
          icon={<ArrowUpOutlined />}
          onClick={onPrevious}
          disabled={totalCount === 0}
          title="上一个 (Shift+Enter)"
        />
        <Button
          type="text"
          icon={<ArrowDownOutlined />}
          onClick={onNext}
          disabled={totalCount === 0}
          title="下一个 (Enter)"
        />
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          title="关闭 (Esc)"
        />
      </Space>
    </div>
  );
}
