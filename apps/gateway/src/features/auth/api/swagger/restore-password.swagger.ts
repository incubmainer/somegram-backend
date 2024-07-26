import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RestorePasswordSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'Restore Password' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Restore password successful',
      schema: {
        example: {
          statusCode: HttpStatus.OK,
          message: 'Restore password successful',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Restore password failed',
      schema: {
        oneOf: [
          {
            example: {
              error: 'invalid_recaptcha_token',
              message:
                'Restore password failed due to invalid recaptcha token.',
            },
          },
          {
            example: {
              error: 'user_not_found',
              message: 'Restore password failed due to user not found.',
            },
          },
        ],
      },
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
              property: 'email',
              constraints: {
                IsEmail: 'some message',
              },
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
      schema: {
        example: {
          message: 'Transaction error',
        },
      },
    }),
  );
}
