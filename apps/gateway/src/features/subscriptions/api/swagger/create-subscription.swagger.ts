import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { PaymentCreatedOutputDto } from '../dto/output-dto/subscriptions.output-dto';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

export function CreateSubscriptionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create payment-subscriptions' }),
    ApiOkResponse({
      description:
        'The payment-subscriptions has been successfully created with status pending, need to pay',
      type: PaymentCreatedOutputDto,
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation failed',
      type: UnprocessableExceptionDto,
    }),
  );
}
