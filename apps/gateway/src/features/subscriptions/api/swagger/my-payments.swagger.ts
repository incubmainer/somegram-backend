import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

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
      schema: {
        example: {
          pageSize: 8,
          totalCount: 1,
          items: [
            {
              subscriptionType: 'DAY',
              price: 10,
              paymentSystem: 'STRIPE',
              status: 'Success',
              dateOfPayment: '2024-12-23T08:48:02.000Z',
              endDateOfSubscription: '2024-12-24T08:48:02.000Z',
              subscriptionId: 'b25bb8cd-a97c-4505-91e3-03c3f637e814',
            },
          ],
          pagesCount: 1,
        },
      },
    }),
  );
}
