export enum PaymentSystem {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export enum SubscriptionType {
  MONTHLY = 'MONTHLY',
  DAY = 'DAY',
  WEEKLY = 'WEEKLY',
}

export class SubscriptionDto {
  userId: string;
  endDateOfSubscription: Date;
  autoRenewal: boolean;
  status: string;
}

export enum AccountType {
  Personal = 'Personal',
  Business = 'Business',
}
