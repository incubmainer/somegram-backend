import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CommentAnswersOutputDtoPaginationModel } from '../dto/output-dto/comment-answers.output-dto';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

export function GetCommentAnswersSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get comment answers by comment id',
    }),
    ApiOkResponse({
      description: 'Success',
      type: CommentAnswersOutputDtoPaginationModel,
    }),
    ApiNotFoundResponse({ description: 'Comment not found' }),
    ApiUnprocessableEntityResponse({
      type: UnprocessableExceptionDto,
      description: 'Validation failed',
    }),
  );
}
