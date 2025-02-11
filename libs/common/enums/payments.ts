export enum PaymentSystem {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export enum SubscriptionType {
  MONTHLY = 'MONTHLY',
  DAY = 'DAY',
  WEEKLY = 'WEEKLY',
}

export enum AccountType {
  Personal = 'Personal',
  Business = 'Business',
}

export enum TransactionStatuses {
  PaymentSucceeded = 'Success',
  PaymentFailed = 'Failed',
}

export enum SubscriptionStatuses {
  Active = 'Active',
  Canceled = 'Canceled',
  Suspended = 'Suspended',
  Pending = 'Pending',
}
