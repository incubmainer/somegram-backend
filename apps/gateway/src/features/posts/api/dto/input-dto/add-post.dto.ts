import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { DESCRIPTION_MAX_LENGTH } from '../../../application/use-cases/add-post.use-case';

export class AddPostDto {
  @ApiProperty({
    description: `Post description, max length ${DESCRIPTION_MAX_LENGTH} characters.`,
    type: String,
    maxLength: DESCRIPTION_MAX_LENGTH,
    required: false,
  })
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description: string;

  @ApiProperty({
    description: 'Array with info about uploaded files',
    type: () => [String],
    isArray: true,
    required: true,
  })
  files: string[];
}
