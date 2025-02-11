import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

export function DisableAutoRenewalSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Disable auto renewal' }),
    ApiNotFoundResponse({ description: 'Subscription not found' }),
    ApiNoContentResponse({
      description: 'Disable auto renewal',
    }),
  );
}
