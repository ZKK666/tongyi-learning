/**
 * 侧边栏组件
 *
 * 职责：
 * - 显示会话列表
 * - 新建会话按钮
 * - 用户信息和设置入口
 *
 * 特性：
 * - PC端可收起/展开
 * - 移动端为抽屉模式
 */
import { Button, Input, Tooltip } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/features/settings/stores/uiStore';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useChatStore } from '@/features/chat/stores/chatStore';
import { useResponsive } from '@/shared/hooks';
import { UI } from '@/shared/constants';

/**
 * 侧边栏组件
 */
export function Sidebar() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const { sessions, currentSessionId, setCurrentSession, createSession } = useChatStore();

  // 处理新建会话
  const handleNewChat = () => {
    createSession();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // 处理会话选择
  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 计算侧边栏样式
  const sidebarStyle = isMobile
    ? {
        position: 'fixed' as const,
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      }
    : {
        width: sidebarOpen ? UI.SIDEBAR_WIDTH : 0,
      };

  return (
    <aside
      className={`
        flex flex-col
        bg-sidebar-light dark:bg-sidebar-dark
        border-r border-gray-200 dark:border-gray-700
        transition-all duration-300
        overflow-hidden
      `}
      style={sidebarStyle}
    >
      {/* 新建对话按钮 */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={handleNewChat}
          className="h-10"
        >
          新对话
        </Button>
      </div>

      {/* 搜索框 */}
      <div className="p-3">
        <Input
          placeholder="搜索会话..."
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
          className="rounded-lg"
        />
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-2">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            暂无会话
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  px-3 py-2.5 rounded-lg cursor-pointer
                  transition-colors duration-150
                  ${
                    session.id === currentSessionId
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }
                `}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="truncate text-sm font-medium">
                  {session.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {session.messageCount} 条消息
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部用户信息 */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <UserOutlined className="text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {user?.name || '用户'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Tooltip title="设置">
              <Button
                type="text"
                size="small"
                icon={<SettingOutlined />}
                onClick={() => navigate('/settings')}
              />
            </Tooltip>
            <Tooltip title="退出登录">
              <Button
                type="text"
                size="small"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  );
}
