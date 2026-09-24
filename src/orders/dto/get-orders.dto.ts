import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOrdersDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 100;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  next?: number = 0;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  dateFrom?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  dateTo?: number;
}
