import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

export function AddLikeDislikeForPostSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Add like/unlike for post' }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiNotFoundResponse({ description: 'Post not found' }),
    ApiUnprocessableEntityResponse({
      type: UnprocessableExceptionDto,
      description: 'Validation failed',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
