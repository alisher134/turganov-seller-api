import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerContentDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class AnswerQuestionDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ValidateNested()
  @Type(() => AnswerContentDto)
  @IsNotEmpty()
  answer!: AnswerContentDto;

  @IsString()
  @IsOptional()
  state?: string;
}
