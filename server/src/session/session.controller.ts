/**
 * 会话控制器
 *
 * 学习要点：
 * - RESTful API 设计
 * - CRUD 操作对应 HTTP 方法：
 *   - GET    /sessions      - 获取列表
 *   - POST   /sessions      - 创建
 *   - PATCH  /sessions/:id  - 更新
 *   - DELETE /sessions/:id  - 删除
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { SessionService } from './session.service';
import type { Session, ApiResponse } from '../common/types';

@Controller('api/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * 获取所有会话
   *
   * GET /api/sessions
   *
   * 学习要点：
   * - GET 请求不需要 @Body()
   * - 返回数组类型
   */
  @Get()
  async findAll(): Promise<ApiResponse<Session[]>> {
    const sessions = await this.sessionService.findAll();

    return {
      success: true,
      data: sessions,
    };
  }

  /**
   * 获取单个会话
   *
   * GET /api/sessions/:id
   *
   * 学习要点：
   * - @Param('id') 获取 URL 参数
   * - 找不到时抛出 NotFoundException
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Session>> {
    const session = await this.sessionService.findById(id);

    if (!session) {
      throw new NotFoundException(`会话 ${id} 不存在`);
    }

    return {
      success: true,
      data: session,
    };
  }

  /**
   * 创建会话
   *
   * POST /api/sessions
   *
   * 学习要点：
   * - POST 默认返回 201 Created
   * - @Body() 获取请求体
   */
  @Post()
  async create(
    @Body() body: { title?: string },
  ): Promise<ApiResponse<Session>> {
    const session = await this.sessionService.create(body.title);

    return {
      success: true,
      data: session,
    };
  }

  /**
   * 更新会话标题
   *
   * PATCH /api/sessions/:id
   *
   * 学习要点：
   * - PATCH 用于部分更新
   * - PUT 用于完全替换（本项目不需要）
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { title: string },
  ): Promise<ApiResponse<Session>> {
    const session = await this.sessionService.updateTitle(id, body.title);

    if (!session) {
      throw new NotFoundException(`会话 ${id} 不存在`);
    }

    return {
      success: true,
      data: session,
    };
  }

  /**
   * 删除会话
   *
   * DELETE /api/sessions/:id
   *
   * 学习要点：
   * - @HttpCode(204) 返回 No Content
   * - 删除成功不需要返回数据
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    const result = await this.sessionService.delete(id);

    if (!result) {
      throw new NotFoundException(`会话 ${id} 不存在`);
    }
  }
}
