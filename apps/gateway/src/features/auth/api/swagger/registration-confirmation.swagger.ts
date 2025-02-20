import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  BadRequestExceptionDto,
  UnprocessableExceptionDto,
} from '@app/base-types-enum';

export function RegistrationConfirmationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Registration Confirmation' }),
    ApiNoContentResponse({
      description: 'Registration confirmation successful',
    }),
    ApiBadRequestResponse({
      status: HttpStatus.BAD_REQUEST,
      type: BadRequestExceptionDto,
    }),
    ApiNotFoundResponse({
      description: 'User with confirmation token not found',
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation error',
      type: UnprocessableExceptionDto,
    }),
  );
}
