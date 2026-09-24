import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetFeedbacksDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isAnswered?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  nmId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  take?: number = 100;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  skip?: number = 0;

  @IsString()
  @IsOptional()
  order?: 'dateAsc' | 'dateDesc';

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  dateFrom?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  dateTo?: number;
}
