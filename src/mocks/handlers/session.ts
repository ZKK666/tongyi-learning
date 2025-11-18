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

// 存储消息数据（按会话 ID 分组）
const messageStore: Map<string, Array<{
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  segments: Array<{ type: string; text?: string; [key: string]: unknown }>;
  status: string;
  createdAt: string;
}>> = new Map();

// 生成模拟历史消息
function generateMockMessages(sessionId: string, count: number) {
  const messages = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const isUser = i % 2 === 0;
    const timestamp = new Date(now.getTime() - i * 60000); // 每条消息间隔1分钟

    messages.push({
      id: `msg_${sessionId}_${i}`,
      sessionId,
      role: isUser ? 'user' as const : 'assistant' as const,
      segments: [{
        type: 'text',
        text: isUser
          ? `这是第 ${Math.floor(i / 2) + 1} 个用户问题`
          : `这是对第 ${Math.floor(i / 2) + 1} 个问题的回答。我会尽力提供详细和有帮助的信息。`,
      }],
      status: 'done',
      createdAt: timestamp.toISOString(),
    });
  }

  return messages;
}

// 初始化示例会话的消息
messageStore.set('session_1', generateMockMessages('session_1', 20));
messageStore.set('session_2', generateMockMessages('session_2', 10));

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

  // 获取会话消息（支持分页）
  http.get('/api/sessions/:id/messages', ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);

    // 分页参数
    const cursor = url.searchParams.get('cursor'); // 游标（消息 ID）
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // 获取会话消息
    let messages = messageStore.get(id as string) || [];

    // 如果有游标，从游标位置开始获取
    if (cursor) {
      const cursorIndex = messages.findIndex((m) => m.id === cursor);
      if (cursorIndex > 0) {
        messages = messages.slice(0, cursorIndex);
      }
    }

    // 获取最新的 limit 条消息（从末尾开始）
    const startIndex = Math.max(0, messages.length - limit);
    const pageMessages = messages.slice(startIndex);

    // 计算下一个游标
    const nextCursor = startIndex > 0 ? messages[startIndex - 1]?.id : null;

    return HttpResponse.json({
      messages: pageMessages,
      nextCursor,
      hasMore: startIndex > 0,
      total: (messageStore.get(id as string) || []).length,
    });
  }),

  // 添加消息到会话
  http.post('/api/sessions/:id/messages', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as {
      role: 'user' | 'assistant';
      segments: Array<{ type: string; text?: string; [key: string]: unknown }>;
    };

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sessionId: id as string,
      role: body.role,
      segments: body.segments,
      status: 'done',
      createdAt: new Date().toISOString(),
    };

    // 添加到消息存储
    const sessionMessages = messageStore.get(id as string) || [];
    sessionMessages.push(message);
    messageStore.set(id as string, sessionMessages);

    // 更新会话的消息计数
    const session = sessions.get(id as string);
    if (session) {
      session.messageCount = sessionMessages.length;
      session.updatedAt = new Date().toISOString();
    }

    return HttpResponse.json(message, { status: 201 });
  }),
];
