import { ApiProperty } from '@nestjs/swagger';

export class SendVoiceMessageInputDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'A voice message',
  })
  file: Express.Multer.File;
}
