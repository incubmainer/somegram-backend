export enum PayPalProductIdEnum {
  'MONTHLY' = 'monthly_p',
  'DAY' = 'daily_p',
  'WEEKLY' = 'weekly_p',
}

export enum SubscriberPhoneTypeEnum {
  'FAX' = 'FAX',
  'HOME' = 'HOME',
  'MOBILE' = 'MOBILE',
  'OTHER' = 'OTHER',
  'PAGER' = 'PAGER',
}

export enum UserAction {
  CONTINUE = 'CONTINUE', // Use this option if you want to control subscription activation and do not want PayPal to activate the subscription.
  SUBSCRIBE_NOW = 'SUBSCRIBE_NOW', // Use this option if you want PayPal to activate your subscription.
}

export enum PayeePreferred {
  UNRESTRICTED = 'UNRESTRICTED', // Accepts any type of payment from the customer
  IMMEDIATE_PAYMENT_REQUIRED = 'IMMEDIATE_PAYMENT_REQUIRED', // Accepts only immediate payment from the client
}

export enum PayPalLinksRelEnum {
  'APPROVE' = 'approve', // the link is intended to redirect the user to a page where he can approve the subscription or payment.
  'EDIT' = 'edit', // The link is intended for editing the resource.
  'SELF' = 'self', // the link represents the resource itself
}

export enum SubscriptionStatusEnum {
  'APPROVAL_PENDING' = 'APPROVAL_PENDING', //	The subscription is created but not yet approved by the buyer.
  'APPROVED' = 'APPROVED', // The buyer has approved the subscription.
  'ACTIVE' = 'ACTIVE', //	The subscription is active.
  'SUSPENDED' = 'SUSPENDED', //	The subscription is suspended.
  'CANCELLED' = 'CANCELLED', //	The subscription is cancelled.
  'EXPIRED' = 'EXPIRED', // The subscription is expired.
}

export enum PreferEnum {
  minimal = 'return=minimal', // The server returns a minimal response to optimize communication between the API caller and the server. A minimal response includes the id, status and HATEOAS links.
  representation = 'return=representation', // The server returns a complete resource representation, including the current state of the resource.
}

export enum PayPalEventsEnum {
  /**
   * A subscription is created.
   * Example: When a user signs up for a new subscription.
   */
  'SUBSCRIPTION_CREATED' = 'BILLING.SUBSCRIPTION.CREATED',
  /**
   * A subscription is activated.
   * Example: When a user confirms and activates their subscription.
   */
  'SUBSCRIPTION_ACTIVATED' = 'BILLING.SUBSCRIPTION.ACTIVATED',
  /**
   * A subscription is updated.
   * Example: When a subscription plan or billing details are modified.
   */
  'SUBSCRIPTION_UPDATED' = 'BILLING.SUBSCRIPTION.UPDATED',
  /**
   * A subscription expires.
   * Example: When a subscription reaches the end of its term and is not renewed.
   */
  'SUBSCRIPTION_EXPIRED' = 'BILLING.SUBSCRIPTION.EXPIRED',
  /**
   * A subscription is cancelled.
   * Example: When a user or system action cancels a subscription.
   */
  'SUBSCRIPTION_CANCELLED' = 'BILLING.SUBSCRIPTION.CANCELLED',
  /**
   * A subscription is suspended.
   * Example: When a subscription is temporarily paused due to payment issues or user action.
   */
  'SUBSCRIPTION_SUSPENDED' = 'BILLING.SUBSCRIPTION.SUSPENDED',
  /**
   * Payment failed on a subscription.
   * Example: When a payment attempt for a subscription is declined.
   */
  'SUBSCRIPTION_FAILED' = 'BILLING.SUBSCRIPTION.PAYMENT.FAILED',
  /**
   * A payment is made on a subscription.
   * Example: When a user completes a payment for an active subscription.
   */
  'PAYMENT_COMPLETED' = 'PAYMENT.SALE.COMPLETED',
  /**
   * A merchant refunds a sale.
   * Example: When a merchant processes a refund for a subscription payment.
   */
  'PAYMENT_REFUNDED' = 'PAYMENT.SALE.REFUNDED',
  /**
   * A payment is reversed on a subscription.
   * Example: When a payment is disputed and reversed by the system or bank.
   */
  'PAYMENT_REVERSED' = 'PAYMENT.SALE.REVERSED',
}

export enum ResourceTypeEnum {
  'SUBSCRIPTION' = 'subscription',
  'SALE' = 'sale',
}

export enum PayPalPaymentModeEnum {
  /**
   * The payment mode is instant transfer.
   * This means the payment was processed immediately without delay.
   */
  'INSTANT_TRANSFER' = 'INSTANT_TRANSFER',

  /**
   * The payment mode is manual bank transfer.
   * This indicates that the payment was made via manual bank transfer, which may take time for processing.
   */
  'MANUAL_BANK_TRANSFER' = 'MANUAL_BANK_TRANSFER',

  /**
   * The payment mode is delayed transfer.
   * This indicates that the payment was scheduled to transfer at a later time.
   */
  'DELAYED_TRANSFER' = 'DELAYED_TRANSFER',

  /**
   * The payment mode is eCheck.
   * This payment mode is typically used for payments via an electronic check, which may take several days to clear.
   */
  'ECHECK' = 'ECHECK',
}

export enum TenureTypeEnum {
  'REGULAR' = ' REGULAR', // A regular billing cycle.
  'TRIAL' = 'TRIAL', //A trial billing cycle.
}

export enum PayPalCurrencyCodeEnum {
  AUD = 'AUD', // Australian dollar
  BRL = 'BRL', // Brazilian real
  CAD = 'CAD', // Canadian dollar
  CNY = 'CNY', // Chinese Renmenbi
  CZK = 'CZK', // Czech koruna
  DKK = 'DKK', // Danish krone
  EUR = 'EUR', // Euro
  HKD = 'HKD', // Hong Kong dollar
  HUF = 'HUF', // Hungarian forint
  ILS = 'ILS', // Israeli new shekel
  JPY = 'JPY', // Japanese yen
  MYR = 'MYR', // Malaysian ringgit
  MXN = 'MXN', // Mexican peso
  TWD = 'TWD', // New Taiwan dollar
  NZD = 'NZD', // New Zealand dollar
  NOK = 'NOK', // Norwegian krone
  PHP = 'PHP', // Philippine peso
  PLN = 'PLN', // Polish złoty
  GBP = 'GBP', // Pound sterling
  SGD = 'SGD', // Singapore dollar
  SEK = 'SEK', // Swedish krona
  CHF = 'CHF', // Swiss franc
  THB = 'THB', // Thai baht
  USD = 'USD', // United States dollar
}

export enum FailureActionEnum {
  'CONTINUE' = 'CONTINUE',
  'CANCEL' = 'CANCEL',
}
