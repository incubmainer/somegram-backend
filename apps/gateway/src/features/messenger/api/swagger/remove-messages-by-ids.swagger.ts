import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

export function RemoveMessagesByIdsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove messages by ids' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiNotFoundResponse({ description: 'Messages not found' }),
    ApiForbiddenResponse({
      description: 'The user is not a participant of the chat',
    }),
  );
}
