import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CursorDto {
  @IsOptional()
  updatedAt?: string;

  @IsOptional()
  nmID?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  limit?: number = 100;
}

export class FilterDto {
  @IsOptional()
  withPhoto?: number; // -1: all, 0: without photo, 1: with photo

  @IsOptional()
  textSearch?: string;

  @IsOptional()
  tagIDs?: number[];

  @IsOptional()
  allowedCategoriesOnly?: boolean;

  @IsOptional()
  objectIDs?: number[];

  @IsOptional()
  brands?: string[];

  @IsOptional()
  imtID?: number;
}

export class GetCardsDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @ValidateNested()
  @Type(() => CursorDto)
  @IsOptional()
  settings?: {
    cursor?: CursorDto;
    filter?: FilterDto;
    sort?: {
      ascending?: boolean;
    };
  };
}
