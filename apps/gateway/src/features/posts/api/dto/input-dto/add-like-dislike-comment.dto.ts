import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { LikeStatusEnum } from '../../../domain/types';

export class AddLikeDislikeCommentDto {
  @ApiProperty({ enum: LikeStatusEnum })
  @IsEnum(LikeStatusEnum)
  status: LikeStatusEnum;
}
