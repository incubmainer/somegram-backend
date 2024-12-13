import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

export function CreateSubscriptionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create payment-subscriptions' }),
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'The payment-subscriptions has been successfully created with status pending, need to pay',
      schema: {
        example: {
          url: 'string',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Validation failed',
      schema: {
        example: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          errors: [
            {
              property: 'typeSubscription',
              constraints: {
                isEnum:
                  'typeSubscription must be one of the following values: MONTHLY, DAY, WEEKLY',
                isNotEmpty: 'typeSubscription should not be empty',
              },
            },
          ],
        },
      },
    }),
  );
}
