import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentsModel {
  @Field()
  subscriptionId: string;

  @Field()
  subscriptionType: string;

  @Field()
  price: number;

  @Field()
  paymentSystem: string;

  @Field()
  status: string;

  @Field()
  dateOfPayment: string;

  @Field()
  endDateOfSubscription: string;

  @Field()
  userId: string;

  @Field()
  username: string;
}
