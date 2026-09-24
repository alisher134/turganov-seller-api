import { IsOptional, IsString } from 'class-validator';

export class GetAdvertsDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @IsOptional()
  statuses?: string;

  @IsOptional()
  paymentType?: string;
}
