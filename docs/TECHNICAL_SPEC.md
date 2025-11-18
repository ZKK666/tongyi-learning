# 通义千问 Web 模拟版 - 需求与技术方案（纯前端版）

## 一、项目定位与目标

### 1.1 产品定位
- **视觉与交互**:模仿阿里通义千问 Web 端,实现企业级 AI 助手界面
- **技术演练目标**:
  - ✅ 流式对话渲染与复杂状态管理
  - ✅ 可插拔卡片系统架构设计
  - ✅ PC + Mobile 响应式适配
  - ✅ 长列表虚拟化与性能优化
  - ✅ 完整的工程化实践(类型安全、错误边界、监控埋点)

### 1.2 MOCK 方案说明

**核心原则**: 所有数据通过前端 MOCK 实现,不依赖真实后端

**MOCK 技术栈**:
- **MSW (Mock Service Worker)**: 拦截网络请求,模拟真实 API
- **faker.js**: 生成测试数据
- **localStorage**: 持久化会话、消息、用户配置

**MOCK 数据流**:
```
用户操作 → 调用 API → MSW 拦截
→ 生成/读取 Mock 数据 → 返回模拟响应
→ 前端正常处理(与真实后端无差异)
```

---

## 二、核心业务流程

### 2.1 登录流程 (MOCK)
```typescript
// MOCK: 支持任意账号密码登录
// 预设账号: admin/admin, user/user
// 登录后生成 mock token + 用户信息
{
  token: "mock_token_" + userId,
  user: {
    id: userId,
    name: "张三",
    avatar: "/avatars/default.png",
    department: "技术部",
    role: "user" | "admin"
  }
}
```

### 2.2 会话管理流程
- **新建会话**: 生成 UUID,存入 localStorage
- **消息持久化**: 按 `sessionId` 分组存储
- **搜索**: 前端内存搜索(标题 + 消息内容模糊匹配)
- **删除/重命名**: 直接操作 localStorage

### 2.3 流式对话 MOCK 方案

**方案 A: SSE 模拟(推荐)**
```typescript
// MSW 返回 ReadableStream
const encoder = new TextEncoder();
const stream = new ReadableStream({
  start(controller) {
    const text = "这是模拟的AI回复内容...";
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        // 模拟逐字输出
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ delta: text[index] })}\n\n`
        ));
        index++;
      } else {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ finish_reason: "stop" })}\n\n`
        ));
        controller.close();
        clearInterval(interval);
      }
    }, 50); // 50ms 一个字符
  }
});
```

**方案 B: 定时器模拟**
```typescript
// 不依赖 SSE,纯前端定时器
function simulateStreaming(text: string, onChunk, onDone) {
  let index = 0;
  const interval = setInterval(() => {
    if (index < text.length) {
      onChunk(text[index]);
      index++;
    } else {
      onDone();
      clearInterval(interval);
    }
  }, 50);
  return () => clearInterval(interval); // 返回中断函数
}
```

### 2.4 工具调用 MOCK

**天气卡片触发逻辑**:
```typescript
// 关键词匹配
const weatherKeywords = ["天气", "气温", "下雨", "weather"];
if (weatherKeywords.some(kw => userInput.includes(kw))) {
  // 延迟 800ms 模拟工具调用
  setTimeout(() => {
    return {
      segments: [
        { type: "text", text: "为你查询到上海的天气:" },
        {
          type: "card",
          cardType: "weather",
          payload: generateMockWeather("上海")
        }
      ]
    };
  }, 800);
}
```

**业务 KPI 卡片**:
```typescript
// 触发词: "今日指标", "订单数", "GMV"
const kpiData = {
  title: "今日核心指标",
  dateRange: "2025-11-18",
  items: [
    { label: "订单数", value: 12847, trend: "up", deltaText: "+8.2%" },
    { label: "GMV", value: 2456789, unit: "元", trend: "up" },
    { label: "转化率", value: 3.2, unit: "%", trend: "flat" }
  ]
};
```

---

## 三、技术架构优化

### 3.1 技术选型(精简版)

| 类别 | 技术 | 理由 |
|------|------|------|
| **框架** | React 18 + TS | Hooks + 并发特性 |
| **构建** | Vite | 快速热更新 |
| **路由** | React Router v6 | 标准方案 |
| **状态** | Zustand | 轻量,无需 Provider 嵌套 |
| **数据** | TanStack Query | 缓存 + 重试 + 加载态 |
| **样式** | Tailwind CSS | 快速开发 |
| **组件库** | Ant Design | 企业级组件 |
| **MOCK** | MSW | 无侵入式拦截 |
| **Markdown** | react-markdown | 安全渲染 |
| **虚拟列表** | @tanstack/react-virtual | 性能优化 |

### 3.2 目录结构优化

```
src/
├── app/                          # 应用入口
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
│       ├── QueryProvider.tsx
│       ├── ThemeProvider.tsx
│       └── index.tsx
│
├── features/                     # 业务功能模块
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── stores/
│   │   │   └── authStore.ts
│   │   └── pages/
│   │       └── LoginPage.tsx
│   │
│   ├── chat/
│   │   ├── components/
│   │   │   ├── SessionList/
│   │   │   │   ├── SessionItem.tsx
│   │   │   │   ├── SessionSearch.tsx
│   │   │   │   └── index.tsx
│   │   │   ├── MessageList/
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── VirtualMessageList.tsx  # 虚拟滚动
│   │   │   │   └── index.tsx
│   │   │   ├── ChatInput/
│   │   │   │   ├── InputBox.tsx
│   │   │   │   ├── ToolBar.tsx
│   │   │   │   └── index.tsx
│   │   │   └── StreamingIndicator.tsx
│   │   ├── hooks/
│   │   │   ├── useChatStream.ts          # 流式核心
│   │   │   ├── useMessageList.ts
│   │   │   └── useSessionManager.ts
│   │   ├── stores/
│   │   │   └── chatStore.ts
│   │   ├── types/
│   │   │   └── message.ts
│   │   └── pages/
│   │       └── ChatPage.tsx
│   │
│   ├── cards/                    # 卡片系统
│   │   ├── components/
│   │   │   ├── CardRenderer.tsx
│   │   │   ├── WeatherCard/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── CurrentWeather.tsx
│   │   │   │   └── ForecastList.tsx
│   │   │   ├── KpiCard/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── KpiItem.tsx
│   │   │   │   └── TrendChart.tsx
│   │   │   ├── SearchResultCard/
│   │   │   └── ErrorCard/
│   │   ├── registry.ts           # 卡片注册中心
│   │   └── types.ts
│   │
│   └── settings/
│       ├── components/
│       │   ├── ModelSelector.tsx
│       │   ├── SystemPromptEditor.tsx
│       │   └── ThemeToggle.tsx
│       ├── stores/
│       │   └── settingsStore.ts
│       └── pages/
│           └── SettingsPage.tsx
│
├── shared/                       # 共享资源
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Loading/
│   │   └── Empty/
│   ├── hooks/
│   │   ├── useResponsive.ts
│   │   ├── useTheme.ts
│   │   ├── useSafeArea.ts
│   │   └── useDebounce.ts
│   ├── utils/
│   │   ├── markdown.ts
│   │   ├── storage.ts            # localStorage 封装
│   │   ├── logger.ts             # 日志工具
│   │   └── validator.ts
│   ├── types/
│   │   └── common.ts
│   └── constants/
│       └── index.ts
│
├── services/                     # API 层
│   ├── api/
│   │   ├── client.ts             # axios 封装
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   └── tools.ts
│   └── types/
│       └── api.ts
│
└── mocks/                        # MSW MOCK 数据
    ├── browser.ts                # MSW 初始化
    ├── handlers/
    │   ├── auth.ts               # 登录 MOCK
    │   ├── chat.ts               # 对话 MOCK
    │   ├── session.ts            # 会话 MOCK
    │   └── tools.ts              # 工具调用 MOCK
    ├── data/
    │   ├── users.ts              # 用户数据
    │   ├── sessions.ts           # 会话数据
    │   ├── messages.ts           # 消息数据
    │   └── generators.ts         # 数据生成器
    └── utils/
        └── streamHelper.ts       # 流式模拟工具
```

**关键改进点**:
1. ✅ `features/` 替代 `modules/`,语义更清晰
2. ✅ `mocks/` 独立目录,便于管理 MOCK 逻辑
3. ✅ `services/` 统一 API 调用层
4. ✅ 每个 feature 内部按 `components/hooks/stores/pages` 分层

---

## 四、核心技术实现

### 4.1 状态管理方案(优化版)

#### 4.1.1 全局状态拆分

```typescript
// stores/authStore.ts
interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// stores/chatStore.ts
interface ChatState {
  // 会话列表
  sessions: Session[];
  currentSessionId: string | null;

  // 流式消息(单独存储,减少渲染)
  streamingMessage: {
    id: string;
    content: string;
    segments: Segment[];
  } | null;

  // 操作方法
  createSession: () => void;
  deleteSession: (id: string) => void;
  updateSessionTitle: (id: string, title: string) => void;
}

// stores/uiStore.ts
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  isMobile: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

#### 4.1.2 React Query 缓存策略

```typescript
// hooks/useMessages.ts
export function useMessages(sessionId: string) {
  return useInfiniteQuery({
    queryKey: ['messages', sessionId],
    queryFn: ({ pageParam = 1 }) => fetchMessages(sessionId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    // 关键配置
    staleTime: 5 * 60 * 1000,     // 5分钟内认为数据新鲜
    cacheTime: 10 * 60 * 1000,    // 10分钟后清除缓存
    refetchOnWindowFocus: false,  // 窗口聚焦不重新请求
  });
}
```

### 4.2 流式对话实现(详细方案)

#### 4.2.1 Hook 封装

```typescript
/**
 * useChatStream
 *
 * 职责:
 * 1. 管理流式连接生命周期(start/abort/complete)
 * 2. 解析流式数据(SSE/逐字符)
 * 3. 通过回调通知上层更新 UI
 * 4. 错误处理与重试
 *
 * 设计要点:
 * - 使用 AbortController 支持中断
 * - 不直接操作 store,通过回调解耦
 * - 支持多种流式协议(SSE/WebSocket/定时器)
 */
export function useChatStream() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startStream = useCallback(async (
    params: ChatRequest,
    callbacks: {
      onStart: () => void;
      onChunk: (delta: string, segments?: Segment[]) => void;
      onComplete: (message: Message) => void;
      onError: (error: Error) => void;
    }
  ) => {
    try {
      abortControllerRef.current = new AbortController();
      setIsStreaming(true);
      setError(null);
      callbacks.onStart();

      // 调用 API(MSW 会拦截)
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.delta) {
              callbacks.onChunk(data.delta, data.segments);
            }

            if (data.finish_reason === 'stop') {
              callbacks.onComplete(data.message);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
        callbacks.onError(err);
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { startStream, abort, isStreaming, error };
}
```

#### 4.2.2 MSW Stream Handler

```typescript
// mocks/handlers/chat.ts
import { http, HttpResponse } from 'msw';

export const chatHandlers = [
  http.post('/api/chat/stream', async ({ request }) => {
    const body = await request.json();
    const userMessage = body.messages[body.messages.length - 1].content;

    // 检测工具调用
    const needWeatherCard = /天气|气温/.test(userMessage);
    const needKpiCard = /指标|订单|GMV/.test(userMessage);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        let text = "这是 AI 的回复内容...";

        // 根据触发词修改回复
        if (needWeatherCard) {
          text = "正在为你查询天气信息...";
        } else if (needKpiCard) {
          text = "正在为你查询今日业务指标...";
        }

        let index = 0;

        const interval = setInterval(() => {
          if (index < text.length) {
            const chunk = {
              delta: text[index],
              segments: null,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
            );
            index++;
          } else {
            // 文本输出完毕,返回卡片
            if (needWeatherCard) {
              const cardChunk = {
                delta: "",
                segments: [
                  {
                    type: "card",
                    cardType: "weather",
                    payload: generateMockWeather("上海")
                  }
                ],
                finish_reason: "stop"
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(cardChunk)}\n\n`)
              );
            } else {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ finish_reason: "stop" })}\n\n`)
              );
            }

            controller.close();
            clearInterval(interval);
          }
        }, 30);
      }
    });

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }),
];
```

### 4.3 卡片系统(扩展性优化)

#### 4.3.1 卡片元数据配置

```typescript
// cards/types.ts
export interface CardMeta {
  type: string;
  title: string;
  icon: string;
  description: string;
  // 卡片能力标识
  capabilities: {
    expandable?: boolean;      // 支持展开/折叠
    interactive?: boolean;      // 支持交互操作
    exportable?: boolean;       // 支持导出
  };
  // 性能优化
  lazyLoad?: boolean;           // 是否延迟渲染
  cacheable?: boolean;          // 是否可缓存
}

export interface CardRegistry {
  [cardType: string]: {
    component: React.LazyExoticComponent<any> | React.ComponentType<any>;
    meta: CardMeta;
  };
}
```

#### 4.3.2 注册表实现

```typescript
// cards/registry.ts
import { lazy } from 'react';

export const cardRegistry: CardRegistry = {
  weather: {
    component: lazy(() => import('./components/WeatherCard')),
    meta: {
      type: 'weather',
      title: '天气卡片',
      icon: 'weather',
      description: '显示城市天气信息',
      capabilities: {
        expandable: true,
        interactive: true,
      },
      lazyLoad: true,
    },
  },

  kpi: {
    component: lazy(() => import('./components/KpiCard')),
    meta: {
      type: 'kpi',
      title: '业务指标卡片',
      icon: 'chart',
      description: '显示业务核心指标',
      capabilities: {
        expandable: true,
        exportable: true,
      },
      lazyLoad: true,
    },
  },

  search: {
    component: lazy(() => import('./components/SearchResultCard')),
    meta: {
      type: 'search',
      title: '搜索结果卡片',
      icon: 'search',
      description: '显示网页搜索结果',
      capabilities: {
        interactive: true,
      },
      lazyLoad: false, // 搜索结果需要即时显示
    },
  },
};

// 新增卡片只需添加一条配置,无需修改渲染逻辑
```

#### 4.3.3 智能渲染器

```typescript
// cards/components/CardRenderer.tsx
import { Suspense } from 'react';
import { useInView } from 'react-intersection-observer';
import { cardRegistry } from '../registry';
import { CardLoading } from './CardLoading';
import { ErrorCard } from './ErrorCard';

export function CardRenderer({ segment }: { segment: CardSegment }) {
  const config = cardRegistry[segment.cardType];

  // 未注册的卡片类型
  if (!config) {
    return <ErrorCard message={`未知卡片类型: ${segment.cardType}`} />;
  }

  const { component: Component, meta } = config;

  // 延迟渲染优化
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    skip: !meta.lazyLoad, // 不需要延迟加载的直接渲染
  });

  return (
    <div ref={ref} className="card-wrapper">
      {(!meta.lazyLoad || inView) && (
        <Suspense fallback={<CardLoading type={meta.type} />}>
          <ErrorBoundary fallback={<ErrorCard />}>
            <Component payload={segment.payload} meta={meta} />
          </ErrorBoundary>
        </Suspense>
      )}
    </div>
  );
}
```

### 4.4 性能优化方案

#### 4.4.1 虚拟滚动实现

```typescript
// components/VirtualMessageList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualMessageList({ messages }: { messages: Message[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // 预估消息高度
    overscan: 5,              // 预渲染5条
  });

  return (
    <div ref={parentRef} className="message-list-container">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MessageBubble message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### 4.4.2 消息渲染优化

```typescript
// MessageBubble.tsx
import { memo } from 'react';

export const MessageBubble = memo(
  ({ message }: { message: Message }) => {
    return (
      <div className={`message-bubble ${message.role}`}>
        {message.segments.map((segment, index) => {
          if (segment.type === 'text') {
            return <MarkdownRenderer key={index} content={segment.text} />;
          }
          return <CardRenderer key={index} segment={segment} />;
        })}
      </div>
    );
  },
  // 自定义比较函数
  (prev, next) => {
    return (
      prev.message.id === next.message.id &&
      prev.message.status === next.message.status &&
      prev.message.segments.length === next.message.segments.length
    );
  }
);
```

### 4.5 移动端适配方案

#### 4.5.1 响应式布局

```typescript
// hooks/useResponsive.ts
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1280) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint,
  };
}
```

#### 4.5.2 软键盘处理

```typescript
// hooks/useSafeArea.ts
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      });
    };

    updateSafeArea();

    // 监听 visual viewport 变化(软键盘弹出/收起)
    window.visualViewport?.addEventListener('resize', updateSafeArea);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return safeArea;
}
```

---

## 五、工程化实践

### 5.1 类型安全

```typescript
// 严格模式配置
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,    // 索引访问必须检查 undefined
    "noImplicitOverride": true,           // 子类覆盖必须显式声明
    "noFallthroughCasesInSwitch": true,  // switch 必须有 break
  }
}

// 使用类型守卫
function isTextSegment(segment: Segment): segment is TextSegment {
  return segment.type === 'text';
}

function isCardSegment(segment: Segment): segment is CardSegment {
  return segment.type === 'card';
}
```

### 5.2 错误处理

```typescript
// shared/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 上报错误
    logger.error('Component Error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorUI />;
    }
    return this.props.children;
  }
}

// 全局错误捕获
window.addEventListener('error', (event) => {
  logger.error('Global Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', {
    reason: event.reason,
  });
});
```

### 5.3 性能监控

```typescript
// utils/performance.ts
export class PerformanceMonitor {
  // 首屏加载时间
  static measureFCP() {
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      logger.info('FCP', { time: fcp.startTime });
    }
  }

  // 组件渲染时间
  static measureComponentRender(componentName: string, startTime: number) {
    const duration = performance.now() - startTime;
    if (duration > 16) { // 超过一帧的时间
      logger.warn('Slow Component Render', {
        component: componentName,
        duration,
      });
    }
  }

  // API 请求时间
  static measureAPI(apiName: string, startTime: number, success: boolean) {
    const duration = performance.now() - startTime;
    logger.info('API Call', {
      api: apiName,
      duration,
      success,
    });
  }
}
```

### 5.4 埋点方案

```typescript
// utils/analytics.ts
export class Analytics {
  // 页面访问
  static trackPageView(pageName: string) {
    this.track('page_view', { page: pageName });
  }

  // 用户操作
  static trackEvent(eventName: string, properties?: Record<string, any>) {
    this.track(eventName, properties);
  }

  // 具体事件
  static trackMessageSent(sessionId: string, messageLength: number) {
    this.track('message_sent', {
      session_id: sessionId,
      message_length: messageLength,
      timestamp: Date.now(),
    });
  }

  static trackCardRendered(cardType: string, loadTime: number) {
    this.track('card_rendered', {
      card_type: cardType,
      load_time: loadTime,
    });
  }

  static trackToolCallSuccess(toolName: string) {
    this.track('tool_call_success', {
      tool_name: toolName,
    });
  }

  private static track(event: string, properties?: Record<string, any>) {
    // 本地开发打印日志
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }

    // 生产环境发送到分析平台
    // navigator.sendBeacon('/api/analytics', JSON.stringify({ event, properties }));
  }
}
```

---

## 六、开发与调试工具

### 6.1 开发工具链

```json
{
  "scripts": {
    "dev": "vite",
    "dev:mock": "vite --mode mock",          // 启用 MSW
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### 6.2 Chrome DevTools 扩展

```typescript
// 开发环境暴露调试 API
if (import.meta.env.DEV) {
  window.__DEBUG__ = {
    // 查看当前状态
    getStore: () => ({
      auth: useAuthStore.getState(),
      chat: useChatStore.getState(),
      ui: useUIStore.getState(),
    }),

    // 清空所有数据
    clearAll: () => {
      localStorage.clear();
      location.reload();
    },

    // 模拟大量消息
    generateMessages: (count: number) => {
      const chatStore = useChatStore.getState();
      for (let i = 0; i < count; i++) {
        chatStore.addMessage({
          id: `msg-${i}`,
          role: i % 2 === 0 ? 'user' : 'assistant',
          segments: [{ type: 'text', text: `测试消息 ${i}` }],
          status: 'done',
          createdAt: new Date().toISOString(),
        });
      }
    },
  };
}
```

### 6.3 MSW DevTools 面板

```typescript
// mocks/devtools.tsx
export function MSWDevtools() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // 监听 MSW 请求
    window.addEventListener('msw:request', (event: any) => {
      setLogs(prev => [...prev, {
        type: 'request',
        url: event.detail.url,
        method: event.detail.method,
        timestamp: Date.now(),
      }]);
    });
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-0 right-0 w-96 h-64 bg-gray-900 text-white overflow-auto">
      <div className="p-2 font-bold border-b">MSW Request Logs</div>
      {logs.map((log, i) => (
        <div key={i} className="p-2 text-xs border-b">
          <span className="text-green-400">{log.method}</span>
          <span className="ml-2">{log.url}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 七、迭代计划(4周)

### Week 1: 基础框架
- [ ] 项目初始化(Vite + React + TS)
- [ ] MSW 配置与基础 handlers
- [ ] 路由 + Layout 搭建
- [ ] 登录页 + 鉴权逻辑
- [ ] 空白 Chat 页面

### Week 2: 核心对话功能
- [ ] 会话列表 CRUD
- [ ] 非流式对话(先跑通流程)
- [ ] SSE 流式对话
- [ ] `useChatStream` Hook 封装
- [ ] Markdown 渲染 + 安全处理

### Week 3: 卡片系统
- [ ] Segment 协议定义
- [ ] CardRenderer + 注册表
- [ ] WeatherCard 实现
- [ ] KpiCard 实现
- [ ] 工具调用 MOCK 逻辑

### Week 4: 优化与完善
- [ ] 虚拟滚动优化
- [ ] 移动端适配
- [ ] 错误边界 + 全局错误处理
- [ ] 性能监控 + 埋点
- [ ] 主题切换
- [ ] 导出功能

---

## 八、代码注释规范

### 8.1 模块级注释(必写)

```typescript
/**
 * useChatStream - 流式对话核心 Hook
 *
 * 职责:
 * - 管理 SSE 连接生命周期
 * - 解析流式数据并通过回调通知 UI 更新
 * - 支持中断当前请求
 *
 * 为什么独立成 Hook:
 * - 流式逻辑与 UI 渲染解耦,便于替换实现(SSE → WebSocket)
 * - 真实项目中可以抽离到独立的 SDK 包
 * - 便于单元测试
 *
 * 未来扩展:
 * - 支持断点续传
 * - 支持多路复用(同时发起多个流式请求)
 * - 支持流式日志记录
 */
export function useChatStream() {
  // ...
}
```

### 8.2 关键逻辑注释

```typescript
// ❌ 不好的注释
const messages = data.map(item => item); // 遍历数据

// ✅ 好的注释
// 合并历史消息与当前流式消息,确保 UI 始终显示完整对话
// 注意: streamingMessage 为 null 时不添加到列表(避免闪烁)
const allMessages = [
  ...historyMessages,
  ...(streamingMessage ? [streamingMessage] : []),
];
```

### 8.3 TODO/FIXME 标记

```typescript
// TODO: [性能优化] 大量消息时考虑分页加载历史记录
// FIXME: [Bug] iOS Safari 软键盘弹出时滚动位置不准确
// HACK: [临时方案] 使用定时器模拟流式,等后端支持 SSE 后移除
```

---

## 九、关键决策记录

### 9.1 为什么选择 Zustand 而非 Redux?

**决策**: 使用 Zustand

**理由**:
- ✅ 轻量(~1KB),学习成本低
- ✅ 无需 Provider 包裹,使用简单
- ✅ 原生支持 TypeScript
- ✅ 与 React Query 配合良好(各司其职)
- ❌ Redux Toolkit 虽然功能更全,但对于本项目过于重量级

### 9.2 为什么使用 MSW 而非自建 Mock Server?

**决策**: 使用 MSW

**理由**:
- ✅ 无侵入式拦截,真实模拟网络请求
- ✅ 支持浏览器和 Node 环境(可用于测试)
- ✅ 与真实 API 调用代码一致,迁移成本低
- ✅ 方便调试(Chrome DevTools 可查看请求)
- ❌ 自建 Mock Server 需要额外端口,增加复杂度

### 9.3 为什么卡片系统使用注册表模式?

**决策**: 卡片注册表 + 动态渲染

**理由**:
- ✅ 新增卡片无需修改核心渲染逻辑(开闭原则)
- ✅ 支持延迟加载(React.lazy)
- ✅ 便于配置化管理(未来可从后端拉取卡片配置)
- ❌ 初期比直接 if-else 判断稍复杂,但扩展性强
