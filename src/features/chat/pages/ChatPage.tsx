/**
 * 聊天主页面
 *
 * 职责：
 * - 整合侧边栏、消息列表、输入框
 * - 提供完整的对话功能
 * - 搜索和导出功能
 */
import { useState } from 'react';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuOutlined,
  SearchOutlined,
  DownloadOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { MainLayout } from '@/shared/components/Layout';
import { useUIStore } from '@/features/settings/stores/uiStore';
import { useChatStore } from '../stores/chatStore';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';
import { SearchBar } from '../components/SearchBar';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { useExportMessages } from '../utils/exportMessages';

/**
 * 聊天页面组件
 */
export default function ChatPage() {
  const [showSearch, setShowSearch] = useState(false);
  const { toggleSidebar } = useUIStore();
  const { currentSessionId, getSessionById, getCurrentMessages } = useChatStore();

  // 获取当前会话和消息
  const currentSession = currentSessionId ? getSessionById(currentSessionId) : null;
  const messages = getCurrentMessages();
  const title = currentSession?.title || '通义千问';

  // 搜索功能
  const {
    keyword,
    setKeyword,
    totalCount,
    currentIndex,
    currentResult,
    goToNext,
    goToPrevious,
    clearSearch,
  } = useMessageSearch({ messages });

  // 滚动触发器：每次递增时触发滚动到当前搜索结果
  const [scrollTrigger, setScrollTrigger] = useState(0);

  // 包装导航函数，添加滚动触发
  const handleGoToNext = () => {
    goToNext();
    setScrollTrigger((prev) => prev + 1);
  };

  const handleGoToPrevious = () => {
    goToPrevious();
    setScrollTrigger((prev) => prev + 1);
  };

  // 计算需要滚动到的消息 ID
  // 使用 scrollTrigger 作为触发器，避免自动滚动
  const scrollToMessageId = scrollTrigger > 0 ? currentResult?.messageId : null;

  // 导出功能
  const { exportMarkdown, exportPDF } = useExportMessages();

  // 导出菜单
  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'markdown',
      icon: <FileMarkdownOutlined />,
      label: '导出为 Markdown',
      onClick: () => exportMarkdown(messages, currentSession || undefined),
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: '导出为 PDF',
      onClick: () => exportPDF(messages, currentSession || undefined),
    },
  ];

  // 关闭搜索
  const handleCloseSearch = () => {
    setShowSearch(false);
    clearSearch();
  };

  return (
    <MainLayout>
      {/* 头部 */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 flex-shrink-0">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={toggleSidebar}
          className="text-gray-600 dark:text-gray-300"
        />
        <h1 className="ml-4 flex-1 text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
          {title}
        </h1>

        {/* 搜索按钮 */}
        <Button
          type="text"
          icon={<SearchOutlined />}
          onClick={() => setShowSearch(!showSearch)}
          className="text-gray-600 dark:text-gray-300"
          title="搜索消息 (Ctrl+F)"
        />

        {/* 导出按钮 */}
        {messages.length > 0 && (
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              className="text-gray-600 dark:text-gray-300"
              title="导出对话"
            />
          </Dropdown>
        )}
      </header>

      {/* 搜索栏 */}
      {showSearch && (
        <SearchBar
          keyword={keyword}
          setKeyword={setKeyword}
          totalCount={totalCount}
          currentIndex={currentIndex}
          onNext={handleGoToNext}
          onPrevious={handleGoToPrevious}
          onClose={handleCloseSearch}
        />
      )}

      {/* 消息列表 */}
      <MessageList
        scrollToMessageId={scrollToMessageId}
        scrollTrigger={scrollTrigger}
      />

      {/* 输入框 */}
      <ChatInput />
    </MainLayout>
  );
}
