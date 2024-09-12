import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RegistrationConfirmationSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Registration Confirmation' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Registration confirmation successful',
      schema: {
        example: {
          statusCode: HttpStatus.OK,
          message: 'Registration confirmation successful',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
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
