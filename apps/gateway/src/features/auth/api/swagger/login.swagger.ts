import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function LoginSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'User Login' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `Login successful.
The refreshToken is set in an HTTP-only cookie.`,
      schema: {
        example: {
          accessToken: 'asdoifja3rfjl312r.aoifj23fl.jlwoif',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Wrong email or password or user not confirmed',
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
