import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '@app/decorators';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export const POST_COMMENT_CONSTRAINTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 300,
};

export class AddPostCommentDto {
  @ApiProperty({
    minItems: POST_COMMENT_CONSTRAINTS.MIN_LENGTH,
    maxLength: POST_COMMENT_CONSTRAINTS.MAX_LENGTH,
  })
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(
    POST_COMMENT_CONSTRAINTS.MIN_LENGTH,
    POST_COMMENT_CONSTRAINTS.MAX_LENGTH,
  )
  body: string;
}
