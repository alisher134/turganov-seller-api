import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SalesFunnelDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @IsNotEmpty()
  period!: {
    begin: string;
    end: string;
  };

  @IsOptional()
  page?: number;
}
