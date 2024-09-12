import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function GithubAuthCallbackSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'GitHub Authentication Callback' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `Login successful.
Redirect to home page. ({homePage}/?accessToken={accessToken})
The refreshToken is set in an HTTP-only cookie.
The accessToken set to the query parameter.`,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
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
      status: HttpStatus.INTERNAL_SERVER_ERROR,
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
