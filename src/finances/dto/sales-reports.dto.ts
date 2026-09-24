import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SalesReportsListDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @IsString()
  @IsNotEmpty()
  dateFrom!: string;

  @IsString()
  @IsNotEmpty()
  dateTo!: string;

  @IsOptional()
  limit?: number;
}
