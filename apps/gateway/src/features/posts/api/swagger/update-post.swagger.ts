import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { POST_CONSTRAINTS } from '../dto/input-dto/add-post.dto';

export function UpdatePostSwagger() {
  return applyDecorators(
    ApiTags('Posts'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Update user post by id' }),
    ApiResponse({
      status: HttpStatus.OK,
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
              property: 'description',
              constraints: {
                description: `Post description, max length ${POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters.`,
              },
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User not found or not authorized',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Post not found',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'If user not owner of post',
      schema: {
        oneOf: [
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'update_post_failed',
              message: 'User not owner of post',
            },
          },
        ],
      },
    }),
  );
}
