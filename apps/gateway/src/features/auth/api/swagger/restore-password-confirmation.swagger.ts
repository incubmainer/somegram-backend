import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RestorePasswordConfirmationSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'Restore Password Confirmation' }),
    ApiResponse({
      status: 200,
      description: 'Restore password confirmation successful',
      schema: {
        example: {
          statusCode: 200,
          message: 'Restore password confirmation successful',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Restore password confirmation failed due to expired code',
      schema: {
        oneOf: [
          {
            example: {
              error: 'restore_password_confirmation_failed',
              message:
                'Restore password confirmation failed due to expired code.',
            },
          },
          {
            example: {
              error: 'restore_password_confirmation_failed',
              message:
                'Restore password confirmation failed due to invalid code.',
            },
          },
        ],
      },
    }),
    ApiResponse({
      status: 422,
      description: 'Validation error',
      schema: {
        example: {
          statusCode: 422,
          message: 'Validation failed',
          errors: [
            {
              property: 'code',
              constraints: {
                IsString: 'some message',
              },
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Transaction error',
      schema: {
        example: {
          statusCode: 500,
          message: 'Transaction error',
        },
      },
    }),
  );
}
