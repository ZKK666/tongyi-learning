/**
 * 设置页面
 *
 * TODO: Phase 13 完善设置功能
 */
import { Button, Card, Switch } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
        />
        <h1 className="ml-4 text-lg font-medium">设置</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <Card title="外观" className="mb-4">
          <div className="flex items-center justify-between">
            <span>深色模式</span>
            <Switch
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          </div>
        </Card>

        <Card title="关于">
          <p className="text-gray-500">
            通义千问 Web 模拟版 v0.1.0
          </p>
          <p className="text-gray-400 text-sm mt-2">
            一个用于学习的企业级 AI 助手项目
          </p>
        </Card>
      </div>
    </div>
  );
}
