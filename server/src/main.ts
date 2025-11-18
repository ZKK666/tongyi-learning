/**
 * NestJS 应用入口
 *
 * 学习要点：
 * - bootstrap() 是 NestJS 约定的启动函数
 * - NestFactory.create() 创建应用实例
 * - 在这里配置全局中间件、管道、过滤器等
 *
 * 全局配置顺序（重要）：
 * 1. Middleware（中间件）
 * 2. Guards（守卫）
 * 3. Interceptors（拦截器）- before
 * 4. Pipes（管道）
 * 5. Controller Handler
 * 6. Interceptors（拦截器）- after
 * 7. Exception Filters（异常过滤器）
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // 创建应用实例
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'], // 日志级别
  });

  const logger = new Logger('Bootstrap');

  /**
   * 全局验证管道
   *
   * 学习要点：
   * - transform: true 自动转换类型
   * - whitelist: true 自动剥离非 DTO 属性
   * - forbidNonWhitelisted: true 非 DTO 属性报错
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,           // 自动类型转换
      whitelist: true,           // 剥离 DTO 中未定义的属性
      forbidNonWhitelisted: true, // 有未定义属性时报错
      transformOptions: {
        enableImplicitConversion: true, // 隐式类型转换
      },
    }),
  );

  /**
   * 全局异常过滤器
   *
   * 学习要点：
   * - 顺序重要：AllExceptionsFilter 放前面作为兜底
   * - HttpExceptionFilter 处理已知 HTTP 异常
   */
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  /**
   * 全局拦截器
   *
   * 学习要点：
   * - LoggingInterceptor 记录请求日志
   * - 可以添加 TransformInterceptor 统一响应格式
   */
  app.useGlobalInterceptors(new LoggingInterceptor());

  /**
   * 配置 CORS（跨域资源共享）
   *
   * 学习要点：
   * - 开发环境允许前端（localhost:5173）访问后端（localhost:3001）
   * - 不同端口视为跨域
   * - 生产环境应该限制 origin
   */
  app.enableCors({
    origin: [
      'http://localhost:5173',  // Vite 开发服务器
      'http://localhost:4173',  // Vite 预览服务器
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  /**
   * Swagger API 文档配置
   *
   * 学习要点：
   * - DocumentBuilder 构建文档配置
   * - SwaggerModule.createDocument 生成文档
   * - SwaggerModule.setup 挂载到路由
   *
   * 访问地址: http://localhost:3001/api-docs
   */
  const config = new DocumentBuilder()
    .setTitle('通义千问 API')
    .setDescription('通义千问聊天应用后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('认证', '用户认证相关接口')
    .addTag('会话', '会话管理相关接口')
    .addTag('聊天', '聊天消息相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 保持 token
    },
  });

  // 监听端口
  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 通义千问后端服务已启动                              ║
║                                                        ║
║   服务地址: http://localhost:${port}                      ║
║   API 文档: http://localhost:${port}/api-docs              ║
║                                                        ║
║   核心功能:                                             ║
║   - JWT 认证 (7天有效期)                                ║
║   - 数据验证 (class-validator)                         ║
║   - 请求限流 (3次/秒, 20次/10秒, 100次/分钟)             ║
║   - 统一异常处理                                        ║
║   - 请求日志                                            ║
║                                                        ║
║   API 接口:                                             ║
║   - POST /api/auth/login     (公开)                     ║
║   - GET  /api/auth/profile   (需认证)                   ║
║   - GET  /api/sessions       (需认证)                   ║
║   - POST /api/chat/stream    (需认证, SSE)              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
