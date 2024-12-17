import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

export function EnableAutoRenewalSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Enable auto renewal' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiBearerAuth('access-token'),
    ApiNotFoundResponse({ description: 'Subscription not found' }),
    ApiOkResponse({
      description: 'Enable auto renewal',
    }),
  );
}
