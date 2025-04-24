import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

export function ReadMessageSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Read message by id' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiNotFoundResponse({ description: 'Message not found' }),
    ApiForbiddenResponse({
      description: 'The message does not belong to the user',
    }),
  );
}
