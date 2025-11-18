/**
 * 聊天主页面
 *
 * TODO: Phase 7-9 完善会话列表、消息列表、流式对话
 */
import { Button, Empty } from 'antd';
import { PlusOutlined, MenuOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useUIStore } from '@/features/settings/stores/uiStore';

export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-0'}
          transition-all duration-300 overflow-hidden
          bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          flex flex-col
        `}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Button type="primary" icon={<PlusOutlined />} block>
            新对话
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* TODO: 会话列表 */}
          <div className="text-center text-gray-400 py-8">
            会话列表占位
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user?.name}
            </span>
            <Button size="small" onClick={logout}>
              登出
            </Button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col">
        {/* 头部 */}
        <header className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={toggleSidebar}
          />
          <h1 className="ml-4 text-lg font-medium">通义千问</h1>
        </header>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          <Empty
            description="开始一个新对话"
            className="mt-20"
          />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <Input.TextArea
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="resize-none"
            />
            <div className="mt-2 flex justify-end">
              <Button type="primary">发送</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// 临时导入，后续会移除
import { Input } from 'antd';
