export enum PaymentSystem {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export enum PaymentTime {
  MONTHLY = 'MONTHLY',
  DAY = 'DAY',
  WEEKLY = 'WEEKLY',
}

export class SubscriptionDto {
  userId: string;
  endDateOfSubscription: string;
  autoRenewal: boolean;
  status: string;
}

export enum AccountType {
  Personal = 'Personal',
  Business = 'Business',
}
