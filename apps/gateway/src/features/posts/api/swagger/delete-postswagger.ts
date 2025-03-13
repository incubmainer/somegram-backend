import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeletePostSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Delete user post by id' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiUnauthorizedResponse({
      description: 'User not found or not authorized',
    }),
    ApiNotFoundResponse({
      description: 'Post not found',
    }),
    ApiForbiddenResponse({
      description: 'User is not the owner of the post',
    }),
  );
}
