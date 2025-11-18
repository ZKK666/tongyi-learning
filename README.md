# 通义千问 Web 模拟版

一个模仿阿里通义千问网页端的企业级 AI 助手项目，同时兼容 PC 和移动端。

## 项目定位

- **视觉与交互**：模仿通义千问 Web 端，实现企业级 AI 助手界面
- **学习目标**：通过实践掌握真实项目开发经验
- **技术演练**：流式对话、卡片系统、响应式适配、性能优化

## 功能特性

- 用户认证（Mock 登录）
- 会话管理（创建、删除、重命名）
- 流式对话（SSE 模拟）
- Markdown 渲染（代码高亮）
- 卡片系统（天气、KPI 指标）
- 主题切换（明/暗模式）
- 响应式适配（PC + 移动端）

## 技术栈

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

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 测试账号

- 管理员：`admin` / `admin`
- 普通用户：`user` / `user`

## 项目结构

```
src/
├── app/                    # 应用入口
│   ├── main.tsx           # 入口文件
│   ├── App.tsx            # 根组件
│   └── router.tsx         # 路由配置
├── features/               # 业务功能模块
│   ├── auth/              # 认证模块
│   ├── chat/              # 对话模块
│   ├── cards/             # 卡片系统
│   └── settings/          # 设置模块
├── shared/                 # 共享资源
│   ├── components/        # 通用组件
│   ├── hooks/             # 通用 Hooks
│   ├── utils/             # 工具函数
│   ├── types/             # 类型定义
│   └── constants/         # 常量配置
├── services/               # API 服务层
└── mocks/                  # MSW Mock 数据
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

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # 代码检查
npm run type-check   # 类型检查
```

## 待完善功能

- [ ] 虚拟滚动优化（大量消息）
- [ ] 更多卡片类型（图表、表格、图片）
- [ ] 消息导出功能
- [ ] 性能监控埋点
- [ ] 单元测试
- [ ] E2E 测试

## 代码注释规范

项目注重代码注释，便于学习理解：

- **模块级注释**：说明组件/函数的职责、设计思路
- **关键逻辑注释**：解释"为什么"而非"是什么"
- **TODO/FIXME 标记**：标注待优化和已知问题

## 参考资料

- [通义千问官网](https://tongyi.aliyun.com/qianwen/)
- [React 官方文档](https://react.dev/)
- [Ant Design 组件库](https://ant.design/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MSW 文档](https://mswjs.io/)

## License

MIT
