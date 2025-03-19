import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, MaxLength } from 'class-validator';

import { PaymentsQueryStringInput } from './payments-query-string-input';

@InputType()
export class PaymentsQueryStringInputWithSearch extends PaymentsQueryStringInput {
  @MaxLength(30, { message: 'Size must be less than or equal to 30' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  search?: string;
}
