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
        'An email with a verification code has been sent to the specified email address',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Transaction error',
      schema: {
        example: {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Transaction error',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User with current email not found',
      schema: {
        example: {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User with current email not found',
        },
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
              property: 'email',
              constraints: {
                isEmail: 'email must be an email',
              },
            },
          ],
        },
      },
    }),
  );
}
