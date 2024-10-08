import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RestorePasswordConfirmationSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Restore Password Confirmation' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Restore password confirmation successful',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Restore password confirmation failed due to expired code',
      schema: {
        oneOf: [
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'restore_password_confirmation_failed',
              message:
                'Restore password confirmation failed due to expired code.',
            },
          },
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
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
          status: HttpStatus.UNPROCESSABLE_ENTITY,
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
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
    }),
  );
}
