import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

export function TestingCancelSubscriptionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cancel current user subscription' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiBearerAuth('access-token'),
    ApiNotFoundResponse({ description: 'Subscription not found' }),
    ApiNoContentResponse({
      description: 'Success',
    }),
  );
}
