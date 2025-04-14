import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

export function AddAnswerForCommentSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Add answer for comment' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiNotFoundResponse({ description: 'Comment not found' }),
    ApiUnprocessableEntityResponse({
      type: UnprocessableExceptionDto,
      description: 'Validation failed',
    }),
  );
}
