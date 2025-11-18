/**
 * 会话管理 API Mock Handlers
 */
import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';

// 内存中存储会话数据（实际项目中应使用 localStorage）
const sessions: Map<string, {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}> = new Map();

// 初始化一些示例会话
sessions.set('session_1', {
  id: 'session_1',
  title: '关于 React 的问题',
  createdAt: '2025-11-18T10:00:00Z',
  updatedAt: '2025-11-18T10:30:00Z',
  messageCount: 5,
});

sessions.set('session_2', {
  id: 'session_2',
  title: '天气查询',
  createdAt: '2025-11-17T15:00:00Z',
  updatedAt: '2025-11-17T15:20:00Z',
  messageCount: 3,
});

export const sessionHandlers = [
  // 获取会话列表
  http.get('/api/sessions', () => {
    const sessionList = Array.from(sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return HttpResponse.json({
      sessions: sessionList,
      total: sessionList.length,
    });
  }),

  // 创建新会话
  http.post('/api/sessions', async ({ request }) => {
    const body = await request.json() as { title?: string };
    const id = uuidv4();
    const now = new Date().toISOString();

    const newSession = {
      id,
      title: body.title || '新对话',
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };

    sessions.set(id, newSession);

    return HttpResponse.json(newSession, { status: 201 });
  }),

  // 获取单个会话
  http.get('/api/sessions/:id', ({ params }) => {
    const { id } = params;
    const session = sessions.get(id as string);

    if (!session) {
      return HttpResponse.json(
        { message: '会话不存在' },
        { status: 404 }
      );
    }

    return HttpResponse.json(session);
  }),

  // 更新会话
  http.patch('/api/sessions/:id', async ({ params, request }) => {
    const { id } = params;
    const session = sessions.get(id as string);

    if (!session) {
      return HttpResponse.json(
        { message: '会话不存在' },
        { status: 404 }
      );
    }

    const body = await request.json() as { title?: string };
    const updatedSession = {
      ...session,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    sessions.set(id as string, updatedSession);

    return HttpResponse.json(updatedSession);
  }),

  // 删除会话
  http.delete('/api/sessions/:id', ({ params }) => {
    const { id } = params;

    if (!sessions.has(id as string)) {
      return HttpResponse.json(
        { message: '会话不存在' },
        { status: 404 }
      );
    }

    sessions.delete(id as string);

    return HttpResponse.json({ success: true });
  }),

  // 搜索会话
  http.get('/api/sessions/search', ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') || '';

    const results = Array.from(sessions.values()).filter((session) =>
      session.title.toLowerCase().includes(keyword.toLowerCase())
    );

    return HttpResponse.json({
      sessions: results,
      total: results.length,
    });
  }),
];
