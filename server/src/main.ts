/**
 * NestJS 应用入口
 *
 * 学习要点：
 * - bootstrap() 是 NestJS 约定的启动函数
 * - NestFactory.create() 创建应用实例
 * - 在这里配置全局中间件、管道、过滤器等
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建应用实例
  const app = await NestFactory.create(AppModule);

  /**
   * 配置 CORS（跨域资源共享）
   *
   * 学习要点：
   * - 开发环境允许前端（localhost:5173）访问后端（localhost:3001）
   * - 不同端口视为跨域
   * - 生产环境应该限制 origin
   *
   * CORS 选项说明：
   * - origin: 允许的来源
   * - methods: 允许的 HTTP 方法
   * - credentials: 是否允许携带 cookie
   */
  app.enableCors({
    origin: [
      'http://localhost:5173',  // Vite 开发服务器
      'http://localhost:4173',  // Vite 预览服务器
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,  // 允许携带 cookie
  });

  /**
   * 全局前缀（可选）
   *
   * 如果想要所有路由都加前缀：
   * app.setGlobalPrefix('api');
   *
   * 但我们已经在 Controller 中定义了 /api 前缀，所以这里不需要
   */

  // 监听端口
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🚀 通义千问后端服务已启动                   ║
║                                            ║
║   地址: http://localhost:${port}              ║
║                                            ║
║   API 接口:                                 ║
║   - POST /api/auth/login                   ║
║   - GET  /api/sessions                     ║
║   - POST /api/chat/stream (SSE)            ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
}

bootstrap();
