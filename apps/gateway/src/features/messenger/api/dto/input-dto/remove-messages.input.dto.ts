import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class RemoveMessagesInputDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  messagesIds: string[];
}
