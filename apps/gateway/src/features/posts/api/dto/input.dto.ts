import { ApiProperty } from '@nestjs/swagger';
import { Length, MaxLength } from 'class-validator';

export class AddPostDto {
  @ApiProperty({
    description: 'Post description, max length 500 characters.',
  })
  @MaxLength(500)
  description: string;
}
