import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RegistrationEmailResendingSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Resend confirmation registration Email if user exists',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description:
        'A letter will be sent again to the email address you provided during registration.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Email resending failed',
      schema: {
        oneOf: [
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'email_already_confirmated',
              message: 'User with current email already confirmed',
            },
          },
          {
            example: {
              status: HttpStatus.BAD_REQUEST,
              error: 'user_not_found',
              message: 'Restore password failed due to user not found.',
            },
          },
        ],
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
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
