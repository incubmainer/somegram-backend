import { Trim } from '@app/decorators/transform/trim';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinChatInputDto {
  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty()
  chatId: string;
}
