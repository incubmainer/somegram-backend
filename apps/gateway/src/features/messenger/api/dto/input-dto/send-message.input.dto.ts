import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '@app/decorators';

export const VOICE_MESSAGE_MAX_SIZE = 3;
export const VOICE_MESSAGE_PROPERTY_FILE_NAME = 'file';
export class SendMessageInputDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  participantId: string;
}
