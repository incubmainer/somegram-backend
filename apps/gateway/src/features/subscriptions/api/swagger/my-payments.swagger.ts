import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function MyPaymentsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get payments' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({
      description: 'Get payments',
    }),
  );
}
