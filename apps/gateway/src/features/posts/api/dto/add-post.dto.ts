import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export const DESC_MAX_LENGTH = 500;

export class AddPostDto {
  @ApiProperty({
    type: Array,
  })
  files: string[];

  @ApiProperty({
    description: `Post description, max length ${DESC_MAX_LENGTH} characters.`,
    type: String,
    maxLength: DESC_MAX_LENGTH,
    required: false,
    nullable: true,
  })
  @IsString()
  @MaxLength(DESC_MAX_LENGTH)
  description?: string;
}
