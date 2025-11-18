/**
 * 认证模块
 *
 * 学习要点：
 * - @Module() 装饰器定义模块
 * - NestJS 使用模块来组织代码
 * - 每个功能域一个模块，便于维护和测试
 *
 * 模块配置说明：
 * - controllers: 该模块的控制器
 * - providers: 该模块的服务（依赖注入的提供者）
 * - imports: 导入其他模块
 * - exports: 导出供其他模块使用的服务
 */

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],  // 注册控制器
  providers: [AuthService],       // 注册服务到 DI 容器
  exports: [AuthService],         // 导出服务供其他模块使用
})
export class AuthModule {}
