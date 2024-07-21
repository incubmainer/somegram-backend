import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function GithubAuthCallbackSwagger() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({ summary: 'GitHub Authentication Callback' }),
    ApiResponse({
      status: 200,
      description: `Login successful.
Redirect to home page. ({homePage}/?accessToken={accessToken})
The refreshToken is set in an HTTP-only cookie.
The accessToken set to the query parameter.`,
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
