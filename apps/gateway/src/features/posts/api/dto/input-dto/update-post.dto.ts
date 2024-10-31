import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

import { POST_CONSTRAINTS } from '../../../application/use-cases/add-post.use-case';

export class UpdatePostDto {
  @ApiProperty({
    description: `Post description, max length ${POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters.`,
    type: String,
    maxLength: POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
    required: false,
    nullable: true,
  })
  @IsString()
  @MaxLength(POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
  description?: string;
}
