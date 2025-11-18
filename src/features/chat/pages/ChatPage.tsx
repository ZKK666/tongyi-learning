/**
 * 聊天主页面
 *
 * 职责：
 * - 整合侧边栏、消息列表、输入框
 * - 提供完整的对话功能
 */
import { Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { MainLayout } from '@/shared/components/Layout';
import { useUIStore } from '@/features/settings/stores/uiStore';
import { useChatStore } from '../stores/chatStore';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';

/**
 * 聊天页面组件
 */
export default function ChatPage() {
  const { toggleSidebar } = useUIStore();
  const { currentSessionId, getSessionById } = useChatStore();

  // 获取当前会话标题
  const currentSession = currentSessionId ? getSessionById(currentSessionId) : null;
  const title = currentSession?.title || '通义千问';

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
        <h1 className="ml-4 text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
          {title}
        </h1>
      </header>

      {/* 消息列表 */}
      <MessageList />

      {/* 输入框 */}
      <ChatInput />
    </MainLayout>
  );
}
