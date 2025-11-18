/**
 * 登录请求 DTO
 *
 * 学习要点：
 * - 使用 class-validator 装饰器进行数据验证
 * - 使用 class-transformer 进行数据转换
 * - DTO 是数据传输对象，用于接口层数据验证
 *
 * 常用验证装饰器：
 * - @IsString() - 必须是字符串
 * - @IsNotEmpty() - 不能为空
 * - @MinLength() - 最小长度
 * - @MaxLength() - 最大长度
 * - @IsEmail() - 必须是邮箱格式
 * - @IsOptional() - 可选字段
 */

import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    minLength: 2,
    maxLength: 20,
  })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(2, { message: '用户名至少2个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  username: string;

  @ApiProperty({
    description: '密码',
    example: '123456',
    minLength: 6,
  })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;
}
