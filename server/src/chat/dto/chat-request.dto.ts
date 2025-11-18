/**
 * 聊天请求 DTO
 *
 * 学习要点：
 * - 嵌套对象验证使用 @ValidateNested() + @Type()
 * - 数组验证使用 @IsArray() + @ArrayMinSize()
 * - @Type() 来自 class-transformer，用于类型转换
 */

import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsIn,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 消息项 DTO
 *
 * 学习要点：
 * - @IsIn() 限制枚举值范围
 * - 嵌套类也需要装饰器
 */
export class MessageItemDto {
  @ApiProperty({
    description: '消息角色',
    enum: ['user', 'assistant', 'system'],
    example: 'user',
  })
  @IsString()
  @IsIn(['user', 'assistant', 'system'], { message: '角色必须是 user/assistant/system' })
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({
    description: '消息内容',
    example: '你好',
  })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '消息内容不能为空' })
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({
    description: '会话 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: '会话ID必须是字符串' })
  @IsNotEmpty({ message: '会话ID不能为空' })
  sessionId: string;

  @ApiProperty({
    description: '消息列表',
    type: [MessageItemDto],
  })
  @IsArray({ message: '消息列表必须是数组' })
  @ArrayMinSize(1, { message: '至少需要一条消息' })
  @ValidateNested({ each: true })
  @Type(() => MessageItemDto)
  messages: MessageItemDto[];
}
