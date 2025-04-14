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

export function RestorePasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Restore Password' }),
    ApiNoContentResponse({
      description: 'Restore password successful',
    }),
    ApiBadRequestResponse({
      description: 'Restore password failed',
      type: BadRequestExceptionDto,
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation error',
      type: UnprocessableExceptionDto,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
