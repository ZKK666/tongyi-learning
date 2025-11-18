/**
 * 搜索栏组件
 *
 * 提供消息全文搜索和结果导航
 */
import { Input, Button, Space, Typography } from 'antd';
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
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <SearchOutlined className="text-gray-400" />

      <Input
        placeholder="搜索消息内容..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
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
