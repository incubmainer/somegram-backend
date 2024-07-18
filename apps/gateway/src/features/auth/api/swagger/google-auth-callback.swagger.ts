import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function GoogleAuthCallbackSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'Google Authentication Callback' }),
    ApiResponse({
      status: 200,
      description:
        'Login successful. The refreshToken is set in an HTTP-only cookie.',
    }),
    ApiResponse({
      status: 400,
      description: 'Login failed due to wrong email',
      schema: {
        example: {
          error: 'login_by_google_failed',
          message: 'Login by google failed due to wrong email.',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Unknown IP address',
      schema: {
        example: {
          error: 'login_failed',
          message: 'Unknown IP address',
          details: {
            ip: 'Invalid IP address',
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
  );
}
