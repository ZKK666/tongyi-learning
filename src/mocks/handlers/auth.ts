/**
 * 认证相关 API Mock Handlers
 */
import { http, HttpResponse } from 'msw';

// 预设用户数据
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    name: '管理员',
    avatar: '/avatars/admin.png',
    email: 'admin@example.com',
    department: '技术部',
    role: 'admin' as const,
  },
  {
    id: '2',
    username: 'user',
    password: 'user',
    name: '张三',
    avatar: '/avatars/default.png',
    email: 'user@example.com',
    department: '产品部',
    role: 'user' as const,
  },
];

export const authHandlers = [
  // 登录接口
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    const { username, password } = body;

    // 查找用户
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return HttpResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 返回用户信息和 token
    return HttpResponse.json({
      token: `mock_token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        department: user.department,
        role: user.role,
      },
    });
  }),

  // 获取当前用户信息
  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer mock_token_')) {
      return HttpResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 从 token 中提取用户 ID
    const tokenParts = authHeader.replace('Bearer mock_token_', '').split('_');
    const userId = tokenParts[0];

    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      department: user.department,
      role: user.role,
    });
  }),

  // 登出接口
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),
];
