import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export enum StickerType {
  SVG = 'svg',
  PNG = 'png',
  ZPLV = 'zplv',
  ZPLH = 'zplh',
}

export class GetStickersDto {
  @IsArray()
  @IsNotEmpty()
  orders!: number[];

  @IsEnum(StickerType)
  @IsOptional()
  type?: StickerType = StickerType.PNG;

  @IsNumber()
  @IsOptional()
  width?: number = 58;

  @IsNumber()
  @IsOptional()
  height?: number = 40;
}
