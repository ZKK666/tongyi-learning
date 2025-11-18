/**
 * 创建会话 DTO
 *
 * 学习要点：
 * - @IsOptional() 标记可选字段
 * - 可选字段需要默认值处理
 */

import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: '会话标题',
    example: '新对话',
    required: false,
    default: '新对话',
  })
  @IsOptional()
  @IsString({ message: '标题必须是字符串' })
  @MaxLength(100, { message: '标题最多100个字符' })
  title?: string;
}
