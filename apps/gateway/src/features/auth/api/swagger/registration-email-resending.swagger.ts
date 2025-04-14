import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnprocessableEntityResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BadRequestExceptionDto,
  UnprocessableExceptionDto,
} from '@app/base-types-enum';

export function RegistrationEmailResendingSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend confirmation registration Email if user exists',
    }),
    ApiNoContentResponse({
      description:
        'A letter will be sent again to the email address you provided during registration.',
    }),
    ApiBadRequestResponse({
      description: 'Email resending failed',
      type: BadRequestExceptionDto,
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation error',
      type: UnprocessableExceptionDto,
    }),
    ApiNotFoundResponse({
      description: 'Token or user not found',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
