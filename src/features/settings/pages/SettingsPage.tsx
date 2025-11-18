/**
 * 设置页面
 *
 * 职责：
 * - 主题切换
 * - 用户信息显示
 * - 清除数据
 */
import { Button, Card, Switch, Divider, App } from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  GithubOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useChatStore } from '@/features/chat/stores/chatStore';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const { sessions } = useChatStore();

  // 清除所有数据
  const handleClearData = () => {
    modal.confirm({
      title: '确认清除数据？',
      content: '这将清除所有会话记录和设置，操作不可恢复。',
      okText: '确认清除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        localStorage.clear();
        message.success('数据已清除');
        logout();
        navigate('/login');
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 sticky top-0 z-10">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          className="text-gray-600 dark:text-gray-300"
        />
        <h1 className="ml-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          设置
        </h1>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* 外观设置 */}
        <Card
          title={
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <MoonOutlined /> : <SunOutlined />}
              外观
            </span>
          }
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">深色模式</div>
              <div className="text-sm text-gray-500">
                切换深色/浅色主题
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          </div>
        </Card>

        {/* 账户信息 */}
        <Card title="账户信息">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">用户名</span>
              <span>{user?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">角色</span>
              <span>{user?.role === 'admin' ? '管理员' : '普通用户'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">部门</span>
              <span>{user?.department || '-'}</span>
            </div>
          </div>
        </Card>

        {/* 数据管理 */}
        <Card title="数据管理">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">会话数量</div>
                <div className="text-sm text-gray-500">
                  当前共有 {sessions.length} 个会话
                </div>
              </div>
            </div>

            <Divider className="my-3" />

            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-red-500">清除所有数据</div>
                <div className="text-sm text-gray-500">
                  删除所有会话、消息和设置
                </div>
              </div>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearData}
              >
                清除
              </Button>
            </div>
          </div>
        </Card>

        {/* 关于 */}
        <Card title="关于">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">版本</span>
              <span>0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">技术栈</span>
              <span>React + TypeScript + Vite</span>
            </div>

            <Divider className="my-3" />

            <div className="text-center text-sm text-gray-500">
              <p>通义千问 Web 模拟版</p>
              <p className="mt-1">一个用于学习的企业级 AI 助手项目</p>
              <a
                href="https://github.com/ZKK666/tongyi-learning"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-primary-600 hover:text-primary-700"
              >
                <GithubOutlined />
                查看源码
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
