import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export const DESC_MAX_LENGTH = 500;

export class UpdatePostDto {
  @ApiProperty({
    description: `Post description, max length ${DESC_MAX_LENGTH} characters.`,
    type: String,
    minLength: 0,
    maxLength: 500,
    required: false,
  })
  @MaxLength(DESC_MAX_LENGTH)
  description: string;
}
