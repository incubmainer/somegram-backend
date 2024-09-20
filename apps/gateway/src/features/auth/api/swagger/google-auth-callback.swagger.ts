import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function GoogleAuthCallbackSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Google Authentication Callback' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `Login successful.
Redirect to home page. ({homePage}/?accessToken={accessToken})
The refreshToken is set in an HTTP-only cookie.
The accessToken set to the query parameter.`,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Login failed due to wrong email',
      schema: {
        oneOf: [
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'login_by_google_failed',
              message: 'Login by google failed due to wrong email.',
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
  );
}
