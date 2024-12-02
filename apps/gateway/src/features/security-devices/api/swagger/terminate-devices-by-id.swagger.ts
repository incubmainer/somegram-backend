import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function TerminateDevicesByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'End session by ID' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiForbiddenResponse({
      description: 'If the devices do not belong to the current user',
    }),
    ApiNotFoundResponse({ description: 'Session not found' }),
  );
}
