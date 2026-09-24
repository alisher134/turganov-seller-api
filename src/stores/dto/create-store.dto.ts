import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStoreDto {
  @IsString({ message: 'Название магазина должно быть строкой' })
  @IsNotEmpty({ message: 'Название магазина (ИП) обязательно' })
  name!: string;

  @IsString({ message: 'ИНН должен быть строкой' })
  @IsOptional()
  inn?: string;

  @IsString({ message: 'Описание должно быть строкой' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'WB API токен должен быть строкой' })
  @IsOptional()
  token?: string;

  @IsString({ message: 'Название токена должно быть строкой' })
  @IsOptional()
  tokenName?: string;
}
