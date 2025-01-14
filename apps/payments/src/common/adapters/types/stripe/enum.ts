export enum StripeEventsEnum {
  PAYMENT_SUCCEEDED = 'invoice.payment_succeeded',
  PAYMENT_FAILED = 'invoice.payment_failed',
  SUB_DELETED = 'customer.subscription.deleted',
  SESSION_COMPLETED = 'checkout.session.completed',
}
