import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

export function DeletePostSwagger() {
  return applyDecorators(
    ApiTags('Posts'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Delete user post' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'No Content',
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Validation error',
      schema: {
        example: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          errors: [
            {
              property: 'userId',
              constraints: {
                description: `userId must be a string`,
              },
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User not found or not authorized',
      schema: {
        example: {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Post not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'If user not owner of post or database query errror',
      schema: {
        oneOf: [
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'delete_post_failed',
              message: 'User not owner of post',
            },
          },
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'Transaction error',
            },
          },
        ],
      },
    }),
  );
}
