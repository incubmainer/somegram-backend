import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '@app/decorators';

export class SendMessageInputDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  message: string;
}
