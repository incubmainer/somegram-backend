import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function LoginSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'User Login' }),
    ApiResponse({
      status: 200,
      description: 'Login success',
      schema: {
        example: {
          statusCode: 200,
          message: 'Login successful',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Wrong UserName or Password',
      schema: {
        example: {
          statusCode: 401,
          error: 'login_failed',
          message: 'Login failed.',
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
