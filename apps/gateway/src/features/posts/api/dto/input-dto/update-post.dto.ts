import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

import { DESCRIPTION_MAX_LENGTH } from '../../../application/use-cases/add-post.use-case';

export class UpdatePostDto {
  @ApiProperty({
    description: `Post description, max length ${DESCRIPTION_MAX_LENGTH} characters.`,
    type: String,
    maxLength: DESCRIPTION_MAX_LENGTH,
    required: false,
    nullable: true,
  })
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description?: string;
}
