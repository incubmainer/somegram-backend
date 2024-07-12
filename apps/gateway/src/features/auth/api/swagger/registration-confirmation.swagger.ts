import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RegistrationConfirmationSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'Registration Confirmation' }),
    ApiResponse({
      status: 200,
      description: 'Registration confirmation successful',
      schema: {
        example: {
          statusCode: 200,
          message: 'Registration confirmation successful',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Registration confirmation failed',
      schema: {
        oneOf: [
          {
            example: {
              error: 'registration_confirmation_failed',
              message:
                'Registration confirmation failed due to token expiration.',
            },
          },
          {
            example: {
              error: 'registration_confirmation_failed',
              message: 'Registration confirmation failed due to invalid token.',
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
              property: 'token',
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
          message: 'Transaction error',
        },
      },
    }),
  );
}
