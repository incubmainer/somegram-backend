import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '@app/decorators';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { POST_COMMENT_CONSTRAINTS } from './add-post-comment.dto';

export class AddAnswerForCommentDto {
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
