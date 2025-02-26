import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function TerminateDevicesByIdSwagger() {
  return applyDecorators(
    ApiParam({ name: 'deviceId' }),
    ApiCookieAuth(),
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
