import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

export function DisableAutoRenewalSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Disable auto renewal' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiBearerAuth('access-token'),
    ApiNotFoundResponse({ description: 'Subscription not found' }),
    ApiOkResponse({
      description: 'Disable auto renewal',
    }),
  );
}
