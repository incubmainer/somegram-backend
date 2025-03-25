import { Field, InputType } from '@nestjs/graphql';
import { IsIn, IsString } from 'class-validator';
import { QueryStringInput } from '../../common/query-string-input.model';

@InputType()
export class PaymentsQueryStringInput extends QueryStringInput {
  @IsString()
  @IsIn(['username', 'subscriptionType', 'dateOfPayment', 'price'], {
    message:
      'sortBy must be one of the following values: username, subscriptionType, dateOfPayment, price',
  })
  @Field(() => String, { defaultValue: 'dateOfPayment' })
  sortBy: string = 'dateOfPayment';
}
