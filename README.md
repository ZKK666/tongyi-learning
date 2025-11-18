# 通义千问 Web 模拟版

一个模仿阿里通义千问网页端的企业级 AI 助手项目，同时兼容 PC 和移动端。

## 项目定位

- **视觉与交互**：模仿通义千问 Web 端，实现企业级 AI 助手界面
- **学习目标**：通过实践掌握真实项目开发经验
- **技术演练**：流式对话、卡片系统、响应式适配、性能优化

## 功能特性

### 核心功能
- 用户认证（Mock 登录）
- 会话管理（创建、删除、重命名、时间排序）
- 流式对话（SSE 打字机效果）
- Markdown 渲染（代码高亮）
- 卡片系统（天气、KPI 指标）
- 主题切换（明/暗模式）
- 响应式适配（PC + 移动端）

### 已实现功能
- 图片上传（拖拽/粘贴/选择，Canvas 压缩）
- 消息搜索（关键词高亮）
- 消息导出（Markdown/PDF）
- 消息分页加载
- PWA 支持

## 技术栈

### 前端

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 + TypeScript | Hooks + 并发特性 |
| 构建 | Vite | 快速热更新 |
| 路由 | React Router v6 | 标准方案 |
| 状态 | Zustand | 轻量级状态管理 |
| 数据 | TanStack Query | 缓存 + 重试 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 组件 | Ant Design | 企业级组件库 |
| Mock | MSW | 无侵入式拦截 |

### 后端

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | NestJS | 企业级 Node.js 框架 |
| 语言 | TypeScript | 前后端类型统一 |
| 存储 | 内存存储 | Map 结构，便于学习 |
| 流式 | SSE | Server-Sent Events |

## 快速开始

### 前端开发（使用 MSW Mock）

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

### 前后端联调

```bash
# 1. 安装后端依赖
npm run server:install

# 2. 启动后端服务（终端1）
npm run server

# 3. 启动前端（终端2）
npm run dev:api
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001

### 测试账号

- 管理员：`admin` / `admin`
- 普通用户：`user` / `user`（任意账号密码均可登录）

## 项目结构

```
tongyi-learning/
├── src/                        # 前端源码
│   ├── app/                    # 应用入口
│   │   ├── main.tsx           # 入口文件
│   │   ├── App.tsx            # 根组件
│   │   └── router.tsx         # 路由配置
│   ├── features/               # 业务功能模块
│   │   ├── auth/              # 认证模块
│   │   ├── chat/              # 对话模块
│   │   ├── cards/             # 卡片系统
│   │   └── settings/          # 设置模块
│   ├── shared/                 # 共享资源
│   │   ├── components/        # 通用组件
│   │   ├── hooks/             # 通用 Hooks
│   │   ├── utils/             # 工具函数
│   │   ├── types/             # 类型定义
│   │   └── constants/         # 常量配置
│   ├── services/               # API 服务层
│   └── mocks/                  # MSW Mock 数据
├── server/                     # 后端源码 (NestJS)
│   └── src/
│       ├── common/            # 共享类型和 Mock 数据
│       ├── auth/              # 认证模块
│       ├── session/           # 会话模块
│       ├── chat/              # 聊天模块（SSE）
│       ├── app.module.ts      # 根模块
│       └── main.ts            # 入口文件
├── package.json
└── vite.config.ts
```

## 核心模块说明

### 流式对话

使用 `useChatStream` Hook 处理 SSE 流式响应：

```typescript
const { startStream, abort, isStreaming } = useChatStream();

await startStream(params, {
  onStart: (id) => { /* 流开始 */ },
  onChunk: (delta) => { /* 收到文本片段 */ },
  onComplete: (msg) => { /* 流结束 */ },
  onError: (err) => { /* 错误处理 */ },
});
```

### 卡片系统

使用注册表模式实现可扩展的卡片系统：

```typescript
// 在 registry.ts 中注册新卡片
export const cardRegistry = {
  weather: {
    component: lazy(() => import('./WeatherCard')),
    meta: { type: 'weather', title: '天气卡片', ... }
  },
  // 添加新卡片...
};
```

### 状态管理

使用 Zustand 进行状态管理，按功能拆分 Store：

- `authStore` - 认证状态
- `chatStore` - 对话和会话
- `uiStore` - UI 状态（主题、侧边栏）

## API 接口

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 登出 |

### 会话

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/sessions` | 获取会话列表 |
| POST | `/api/sessions` | 创建会话 |
| PATCH | `/api/sessions/:id` | 更新会话标题 |
| DELETE | `/api/sessions/:id` | 删除会话 |

### 聊天

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/chat/:sessionId/messages` | 获取消息列表 |
| POST | `/api/chat/stream` | 流式聊天（SSE） |

## 开发命令

```bash
# 前端
npm run dev          # 启动开发服务器（MSW Mock）
npm run dev:api      # 启动开发服务器（连接后端）
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # 代码检查
npm run type-check   # 类型检查

# 后端
npm run server:install  # 安装后端依赖
npm run server          # 启动后端服务
```

## 环境变量

```bash
# .env.development（默认）
VITE_USE_MOCK=true      # 使用 MSW Mock

# .env.development.local（联调）
VITE_USE_MOCK=false     # 连接 NestJS 后端
```

## 待完善功能

- [ ] 更多卡片类型（图表、表格）
- [ ] 性能监控埋点
- [ ] 单元测试
- [ ] E2E 测试
- [ ] 数据库持久化
- [ ] 真实 AI 接口对接

## 代码注释规范

项目注重代码注释，便于学习理解：

- **模块级注释**：说明组件/函数的职责、设计思路
- **关键逻辑注释**：解释"为什么"而非"是什么"
- **学习要点注释**：标注重要的技术概念
- **TODO/FIXME 标记**：标注待优化和已知问题

## 学习要点

### 前端
- React Hooks 最佳实践
- TypeScript 类型体操
- 状态管理设计模式
- SSE 流式数据处理
- 性能优化（虚拟滚动、懒加载）

### 后端
- NestJS 模块化架构
- 依赖注入（DI）模式
- RESTful API 设计
- SSE 流式输出实现
- 内存存储到数据库的迁移路径

## 参考资料

- [通义千问官网](https://tongyi.aliyun.com/qianwen/)
- [React 官方文档](https://react.dev/)
- [NestJS 官方文档](https://nestjs.com/)
- [Ant Design 组件库](https://ant.design/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MSW 文档](https://mswjs.io/)

## License

MIT
