import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

export function EnableAutoRenewalSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Enable auto renewal' }),
    ApiNotFoundResponse({ description: 'Subscription not found' }),
    ApiNoContentResponse({
      description: 'Enable auto renewal',
    }),
  );
}
