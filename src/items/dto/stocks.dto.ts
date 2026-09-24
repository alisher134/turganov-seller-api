import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StockItemDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;
}

export class UpdateStocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockItemDto)
  stocks!: StockItemDto[];
}
