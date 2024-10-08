import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RestorePasswordSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Restore Password' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Restore password successful',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Restore password failed',
      schema: {
        oneOf: [
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'invalid_recaptcha_token',
              message:
                'Restore password failed due to invalid recaptcha token.',
            },
          },
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'user_not_found',
              message: 'Restore password failed due to user not found.',
            },
          },
        ],
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Validation error',
      schema: {
        example: {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
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
  );
}
