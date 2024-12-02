import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function TerminateAllDevicesExcludeCurrentSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'End all sessions except the current one' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
    ApiNotFoundResponse({ description: 'Sessions not found' }),
  );
}
