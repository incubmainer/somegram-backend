import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { POST_CONSTRAINTS } from '../../../application/use-cases/add-post.use-case';

export class AddPostDto {
  @ApiProperty({
    description: `Post description, max length ${POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters.`,
    type: String,
    maxLength: POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
    required: false,
  })
  @MaxLength(POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
  description: string;
}
