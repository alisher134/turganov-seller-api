import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { WbTokenCategory } from '@prisma/client';

export class CreateTokenDto {
  @IsString({ message: 'Токен должен быть строкой' })
  @IsNotEmpty({ message: 'Токен Wildberries обязателен' })
  token!: string;

  @IsString({ message: 'Название токена должно быть строкой' })
  @IsOptional()
  tokenName?: string;

  @IsEnum(WbTokenCategory, {
    message: `Категория токена должна быть одной из: ${Object.values(WbTokenCategory).join(', ')}`,
  })
  @IsOptional()
  category?: WbTokenCategory;

  @IsDateString(
    {},
    { message: 'Срок действия должен быть датой в формате ISO-8601' },
  )
  @IsOptional()
  expiresAt?: string;
}
