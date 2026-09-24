import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerFeedbackDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;
}
