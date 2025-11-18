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
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { ChatStore } from '../chat/chat.store';
import type { Session, Message } from '../common/types';

/**
 * 消息分页响应格式
 */
interface MessagesPage {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

@Controller('api/sessions')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly chatStore: ChatStore,
  ) {}

  /**
   * 获取会话消息列表
   *
   * GET /api/sessions/:id/messages
   *
   * 学习要点：
   * - @Query() 获取查询参数
   * - 支持游标分页（cursor-based pagination）
   * - 返回分页格式数据
   *
   * 注意：此路由必须在 :id 路由之前定义，否则会被 :id 匹配
   */
  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limitStr?: string,
  ): Promise<MessagesPage> {
    const limit = parseInt(limitStr || '20', 10);
    const allMessages = this.chatStore.getBySessionId(id);

    // 简单实现：返回所有消息（不做真正的分页）
    // 真实项目中应该根据 cursor 和 limit 进行分页
    return {
      messages: allMessages,
      nextCursor: null,
      hasMore: false,
      total: allMessages.length,
    };
  }

  /**
   * 获取所有会话
   *
   * GET /api/sessions
   *
   * 学习要点：
   * - GET 请求不需要 @Body()
   * - 返回格式与前端 MSW Mock 保持一致
   */
  @Get()
  async findAll(): Promise<{ sessions: Session[]; total: number }> {
    const sessions = await this.sessionService.findAll();

    return {
      sessions,
      total: sessions.length,
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
  async findOne(@Param('id') id: string): Promise<Session> {
    const session = await this.sessionService.findById(id);

    if (!session) {
      throw new NotFoundException(`会话 ${id} 不存在`);
    }

    return session;
  }

  /**
   * 创建会话
   *
   * POST /api/sessions
   *
   * 学习要点：
   * - POST 默认返回 201 Created
   * - 返回格式与前端 MSW Mock 保持一致
   */
  @Post()
  async create(
    @Body() body: { title?: string },
  ): Promise<Session> {
    const session = await this.sessionService.create(body.title);

    return session;
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
  ): Promise<Session> {
    const session = await this.sessionService.updateTitle(id, body.title);

    if (!session) {
      throw new NotFoundException(`会话 ${id} 不存在`);
    }

    return session;
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
