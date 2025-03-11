import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { POST_CONSTRAINTS } from './add-post.dto';
import { Trim } from '@app/decorators';

export class UpdatePostDto {
  @ApiProperty({
    description: `Post description, max length ${POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters.`,
    type: String,
    maxLength: POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @Trim()
  @IsNotEmpty()
  @IsString()
  @MaxLength(POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
  description?: string;
}
