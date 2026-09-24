import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  officeId!: number;
}

export class UpdateWarehouseDto {
  @IsString()
  @IsOptional()
  name?: string;
}
