import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiUnprocessableEntityResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

export function UpdatePostSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Update user post by id' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation error',
      type: UnprocessableExceptionDto,
    }),
    ApiUnauthorizedResponse({
      description: 'User not found or not authorized',
    }),
    ApiNotFoundResponse({
      description: 'Post not found',
    }),
    ApiForbiddenResponse({ description: 'Forbidden' }),
  );
}
