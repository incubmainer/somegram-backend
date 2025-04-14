import { ApiProperty } from '@nestjs/swagger';
import { CommentAnswerRawModel } from '../../../domain/types';
import { Pagination } from '@app/paginator';
import { Injectable } from '@nestjs/common';
import {
  CommentPostOutputDto,
  CommentPostOutputDtoMapper,
} from './comment-post.output-dto';

export class CommentAnswersOutputDto extends CommentPostOutputDto {
  @ApiProperty()
  answerForCommentId: string;
}

export class CommentAnswersOutputDtoPaginationModel extends Pagination<CommentAnswersOutputDto> {
  @ApiProperty({
    type: CommentAnswersOutputDto,
    isArray: true,
  })
  items: CommentAnswersOutputDto;
}

@Injectable()
export class CommentAnswersOutputDtoMapper extends CommentPostOutputDtoMapper {
  mapAnswer(comment: CommentAnswerRawModel): CommentAnswersOutputDto {
    return {
      ...this.mapComment(comment),
      answerForCommentId: comment.answerForCommentId,
    };
  }

  mapAnswers(comments: CommentAnswerRawModel[]): CommentAnswersOutputDto[] {
    return comments.map((comment) => this.mapAnswer(comment));
  }
}
