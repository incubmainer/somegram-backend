import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RestorePasswordSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'Restore Password' }),
    ApiResponse({
      status: 200,
      description: 'Restore password successful',
      schema: {
        example: {
          statusCode: 200,
          message: 'Restore password successful',
        },
      },
    }),
    ApiResponse({
      status: 400,
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
      status: 500,
      description: 'Transaction error',
      schema: {
        example: {
          message: 'Transaction error',
        },
      },
    }),
  );
}
