import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionInfoOutputDto } from '../dto/output-dto/subscriptions.output-dto';

export function SubscriptionInfoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Subscription info' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiBearerAuth('access-token'),

    ApiOkResponse({
      description: 'Subscription info',
      type: SubscriptionInfoOutputDto,
    }),
  );
}
