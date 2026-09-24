import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceItemDto {
  @IsNumber()
  @IsNotEmpty()
  nmID!: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;
}

export class UploadPricesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceItemDto)
  data!: PriceItemDto[];
}
