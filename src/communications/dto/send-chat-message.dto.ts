import { IsNotEmpty, IsString } from 'class-validator';

export class SendChatMessageDto {
  @IsString()
  @IsNotEmpty()
  chatId!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
