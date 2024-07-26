import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RestorePasswordConfirmationSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'Restore Password Confirmation' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Restore password confirmation successful',
      schema: {
        example: {
          statusCode: HttpStatus.OK,
          message: 'Restore password confirmation successful',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
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
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Validation error',
      schema: {
        example: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
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
