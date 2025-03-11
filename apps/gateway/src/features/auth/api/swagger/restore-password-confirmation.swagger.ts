import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  BadRequestExceptionDto,
  UnprocessableExceptionDto,
} from '@app/base-types-enum';

export function RestorePasswordConfirmationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Restore Password Confirmation' }),
    ApiNoContentResponse({
      description: 'Restore password confirmation successful',
    }),
    ApiBadRequestResponse({
      description: 'Restore password confirmation failed due to expired code',
      type: BadRequestExceptionDto,
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation error',
      type: UnprocessableExceptionDto,
    }),
  );
}
