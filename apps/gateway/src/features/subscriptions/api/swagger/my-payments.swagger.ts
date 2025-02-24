import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SwaggerMyPaymentsDto } from '../dto/output-dto/subscriptions.output-dto';

export function MyPaymentsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get payments' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiBearerAuth('access-token'),
    ApiQuery({
      name: 'pageSize',
      required: false,
      description: 'Number of items per page',
      type: Number,
      example: 8,
    }),
    ApiQuery({
      name: 'pageNumber',
      required: false,
      description: 'Number of page',
      type: Number,
      example: 1,
    }),
    ApiOkResponse({
      description: 'Get payments',
      type: SwaggerMyPaymentsDto,
    }),
  );
}
