import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RegistrationSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'User Registration' }),
    ApiResponse({
      status: 200,
      description: 'Registration success',
      schema: {
        example: {
          statusCode: 200,
          message: 'Registration successful',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Email or Username already exists',
      schema: {
        example: {
          error: 'registration_failed',
          message:
            'Registration failed due to conflict with existing email or username.',
          details: {
            email: 'Email address is already in use.',
            username: 'Username is already taken.',
          },
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
    ApiResponse({
      status: 422,
      description: 'Validation error',
      schema: {
        example: {
          statusCode: 422,
          message: 'Validation failed',
          errors: [
            {
              property: 'username',
              constraints: {
                IsUsername: 'Username must be at least 4 characters long',
              },
            },
            {
              property: 'email',
              constraints: {
                isEmail: 'Email must be a valid email address',
              },
            },
            {
              property: 'password',
              constraints: {
                length: 'Password must be at least 6 characters long',
              },
            },
          ],
        },
      },
    }),
  );
}
