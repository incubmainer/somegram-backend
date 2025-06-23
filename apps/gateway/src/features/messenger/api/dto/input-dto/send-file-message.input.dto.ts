import { Trim } from '@app/decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendFileMessageInputDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'A voice message',
  })
  file: Express.Multer.File;

  @ApiPropertyOptional()
  @IsOptional()
  @Trim()
  @IsNotEmpty()
  @IsString()
  text?: string;
}
