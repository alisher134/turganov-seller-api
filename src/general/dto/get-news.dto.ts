import { IsOptional, IsString } from 'class-validator';

export class GetNewsDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  fromId?: string;
}
