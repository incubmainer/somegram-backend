import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiOkResponse,
  ApiUnprocessableEntityResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaymentCreatedOutputDto } from '../dto/output-dto/subscriptions.output-dto';
import { UnprocessableExceptionDto } from '@app/base-types-enum';

// export function CreateSubscriptionSwagger() {
//   return applyDecorators(
//     ApiOperation({ summary: 'Create payment-subscriptions' }),
//     ApiResponse({
//       status: HttpStatus.OK,
//       description:
//         'The payment-subscriptions has been successfully created with status pending, need to pay',
//       schema: {
//         example: {
//           url: 'string',
//         },
//       },
//     }),
//     ApiResponse({
//       status: HttpStatus.UNPROCESSABLE_ENTITY,
//       description: 'Validation failed',
//       schema: {
//         example: {
//           statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
//           message: 'Validation failed',
//           errors: [
//             {
//               property: 'typeSubscription',
//               constraints: {
//                 isEnum:
//                   'typeSubscription must be one of the following values: MONTHLY, DAY, WEEKLY',
//                 isNotEmpty: 'typeSubscription should not be empty',
//               },
//             },
//           ],
//         },
//       },
//     }),
//   );
// }

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
