import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RegistrationConfirmationSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Registration Confirmation' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Registration confirmation successful',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Registration confirmation failed',
      schema: {
        oneOf: [
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'registration_confirmation_failed',
              message:
                'Registration confirmation failed due to token expiration.',
            },
          },
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'registration_confirmation_failed',
              message: 'Registration confirmation failed due to invalid token.',
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
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Validation error',
      schema: {
        example: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          errors: [
            {
              property: 'token',
              constraints: {
                IsString: 'some message',
              },
            },
          ],
        },
      },
    }),
  );
}
