import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiUnprocessableEntityResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

export function AddCommentForPostSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Add comment for post by current user' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiUnprocessableEntityResponse({
      type: UnprocessableExceptionDto,
      description: 'Validation failed',
    }),
    ApiNotFoundResponse({ description: 'Post not found' }),
  );
}
