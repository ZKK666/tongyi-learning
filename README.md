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
| 认证 | Passport + JWT | 标准 JWT 认证方案 |
| 验证 | class-validator | DTO 数据验证 |
| 配置 | @nestjs/config + Joi | 环境变量管理与验证 |
| 定时 | @nestjs/schedule | Cron 定时任务 |
| 事件 | @nestjs/event-emitter | 事件驱动解耦 |
| 限流 | @nestjs/throttler | API 限流保护 |
| 文档 | Swagger | 自动生成 API 文档 |
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
- 普通用户：`user` / `user`

> 用户名至少2个字符，密码任意

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
│   ├── .env.example           # 环境变量示例
│   └── src/
│       ├── common/            # 共享资源
│       │   ├── types/         # 类型定义
│       │   ├── mock-data/     # Mock 数据
│       │   ├── filters/       # 异常过滤器
│       │   ├── interceptors/  # 拦截器
│       │   ├── services/      # 公共服务（定时任务）
│       │   ├── events/        # 事件定义
│       │   └── listeners/     # 事件监听器
│       ├── config/            # 配置模块
│       │   ├── configuration.ts  # 配置工厂
│       │   └── validation.ts     # Joi 验证
│       ├── auth/              # 认证模块
│       │   ├── dto/           # 数据传输对象
│       │   ├── guards/        # 认证守卫
│       │   └── strategies/    # Passport 策略
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

### API 文档

启动后端后访问 Swagger 文档：http://localhost:3001/api/docs

## NestJS 后端特性

### 已实现功能

#### 核心模块
- **ConfigModule** - 环境变量管理，Joi 验证
- **ScheduleModule** - 定时任务（清理空会话、过期会话）
- **EventEmitterModule** - 事件驱动（首条消息自动生成标题）

#### 认证与安全
- **JWT 认证** - Passport 策略，Bearer Token
- **全局守卫** - 所有路由默认需要认证
- **限流保护** - 多级限流（1秒/10秒/60秒）

#### 数据处理
- **ValidationPipe** - 请求数据自动验证
- **DTO 验证** - class-validator 装饰器
- **异常过滤器** - 统一错误响应格式

#### 开发体验
- **Swagger** - 自动生成 API 文档
- **日志拦截器** - 请求日志记录
- **响应转换** - 统一响应格式

### 定时任务

```typescript
// 每小时清理空会话
@Cron(CronExpression.EVERY_HOUR)
handleCleanupEmptySessions() { ... }

// 每天清理过期会话（30天）
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
handleCleanupOldSessions() { ... }
```

### 事件系统

```typescript
// 发送消息时触发事件
this.eventEmitter.emit(
  EVENTS.MESSAGE_CREATED,
  new MessageCreatedEvent(sessionId, messageId, content, 'user')
);

// 监听事件，自动生成标题
@OnEvent(EVENTS.MESSAGE_CREATED, { async: true })
async handleMessageCreated(event: MessageCreatedEvent) {
  // 根据首条消息生成会话标题
}
```

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

### 前端

```bash
# .env.development（默认）
VITE_USE_MOCK=true      # 使用 MSW Mock

# .env.development.local（联调）
VITE_USE_MOCK=false     # 连接 NestJS 后端
```

### 后端

参考 `server/.env.example`：

```bash
# 基础配置
NODE_ENV=development
PORT=3001

# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 定时任务配置
CLEANUP_CRON=0 * * * *      # 每小时清理
TITLE_MAX_LENGTH=20         # 自动标题最大长度

# 限流配置
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# 流式输出配置
STREAM_INTERVAL=30          # 打字机间隔(ms)
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
- JWT 认证与 Passport 策略
- DTO 验证与数据转换
- 异常过滤器与拦截器
- ConfigModule 配置管理
- Schedule 定时任务
- EventEmitter 事件驱动
- Swagger API 文档自动生成
- 限流与安全防护

## 参考资料

- [通义千问官网](https://tongyi.aliyun.com/qianwen/)
- [React 官方文档](https://react.dev/)
- [NestJS 官方文档](https://nestjs.com/)
- [Ant Design 组件库](https://ant.design/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MSW 文档](https://mswjs.io/)

## License

MIT
