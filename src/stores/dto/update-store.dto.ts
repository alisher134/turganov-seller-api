import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateStoreDto {
  @IsString({ message: 'Название магазина должно быть строкой' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'ИНН должен быть строкой' })
  @IsOptional()
  inn?: string;

  @IsString({ message: 'Описание должно быть строкой' })
  @IsOptional()
  description?: string;

  @IsBoolean({ message: 'isActive должно быть булевым значением' })
  @IsOptional()
  isActive?: boolean;
}
