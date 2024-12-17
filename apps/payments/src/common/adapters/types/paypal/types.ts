import {
  PayeePreferred,
  PayPalEventsEnum,
  PayPalLinksRelEnum,
  PayPalPaymentModeEnum,
  ResourceTypeEnum,
  SubscriberPhoneTypeEnum,
  SubscriptionStatusEnum,
  TenureTypeEnum,
  UserAction,
} from './enum';
/*
*
*
*
      Plan response type
*
*
*
*/
export type PayPalPlansResponseType = {
  plans: PayPalPlansType[];
  links: PayPalLinksType[];
};

export type PayPalPlansType = {
  id: string;
  product_id: string;
  name: string;
  status: string;
  usage_type: string;
  create_time: Date;
  links: PayPalLinksType[];
};

export type PayPalLinksType = {
  href: string;
  rel: PayPalLinksRelEnum;
  method: string;
  encType: string;
};
/*
*
*
*
      Subscriptions create data type
*
*
*
*/
export type CreateSubscriptionDataType = {
  plan_id: string;
  quantity?: string;
  auto_renewal?: boolean; // default false.
  custom_id?: string;
  start_time?: string; // Date, default now
  shipping_amount?: ShippingAmountType;
  subscriber: SubscriberType;
  application_context: ApplicationContext;
};

type ShippingAmountType = {
  currency_code: string;
  value: string;
};

type SubscriberType = {
  email_address: string;
  name: SubscriberNameInfoType;
  phone?: SubscriberPhoneInfoType;
};

type SubscriberNameInfoType = {
  given_name?: string;
  surname?: string;
};

type SubscriberPhoneInfoType = {
  phone_type?: SubscriberPhoneTypeEnum;
  phone_number: PhoneNumberViewType;
};

type PhoneNumberViewType = {
  national_number: string;
};

type ApplicationContext = {
  brand_name: string;
  user_action: UserAction;
  return_url: string;
  cancel_url: string;
  locale?: string; // en-US, ru-RU, da-DK, he-IL, id-ID, ja-JP, no-NO, pt-BR,  sv-SE, th-TH, zh-CN, zh-HK, or zh-TW
  payment_method: PaymentMethod;
};

type PaymentMethod = {
  payer_selected: 'PAYPAL';
  payee_preferred: PayeePreferred;
};
/*
*
*
*
      Subscription create response
*
*
*
*/
export type SubscriptionCreatedType = {
  id: string;
  status: SubscriptionStatusEnum;
  create_time: Date;
  links: SubscriptionLinksType[];
  // Shown with extended response from server
  status_update_time?: Date;
  plan_id?: string;
  start_time?: Date;
  quantity?: string;
  subscriber?: SubscriberType;
  plan_overridden?: boolean;
  shipping_amount?: ShippingAmountType;
};

export type SubscriptionLinksType = Omit<PayPalLinksType, 'encType'>;
/*
*
*
*
      WebHook Event
*
*
*
*/
export type PayPalWebHookEventType<T> = {
  id: string; // WH id
  create_time: Date;
  resource_type: ResourceTypeEnum;
  event_type: PayPalEventsEnum;
  summary: string; // summary of the event
  resource: T;
  links: WebHookLinksType[];
};

export type WebHookLinksType = Omit<PayPalLinksType, 'encType'>;
/*
*
*
*
      WebHook Event Sub Created
*
*
*
*/
export type WHSubscriptionEventCreatedType = {
  start_time: Date;
  quantity: string;
  subscriber: SubscriberType;
  create_time: Date;
  links: WebHookLinksType[];
  id: string; // Sub id
  plan_overridden: boolean;
  plan_id: string;
  status: SubscriptionStatusEnum;
};
/*
*
*
*
      WebHook Event Sub Active
*
*
*
*/
export type WHSubscriptionActiveType = {
  start_time: Date;
  quantity: string;
  subscriber: WHSubscriptionActiveSubscriberType;
  create_time: Date;
  update_time: Date;
  links: PayPalLinksType[];
  id: string; // Sub id
  plan_overridden: boolean;
  plan_id: string;
  status: SubscriptionStatusEnum;
  status_update_time: Date;
  shipping_amount: ShippingAmountType;
  billing_info: WHSubscriptionActiveBillingInfoType;
};

export type WHSubscriptionActiveSubscriberType = SubscriberType & {
  payer_id: string;
};

export type WHSubscriptionActiveBillingInfoType = {
  cycle_executions: WHSubscriptionActiveBillingCycleExecutionsInfoType[];
  last_payment: WHSubscriptionActiveBillingLastPaymentInfoType;
  next_billing_time: Date;
  failed_payments_count: number;
};

export type WHSubscriptionActiveBillingLastPaymentInfoType = {
  amount: ShippingAmountType;
  time: Date;
};

export type WHSubscriptionActiveBillingCycleExecutionsInfoType = {
  tenure_type: TenureTypeEnum;
  sequence: number;
  cycles_completed: number;
  cycles_remaining: number;
  current_pricing_scheme_version: number;
  total_cycles: number;
};
/*
*
*
*
      WebHook Event Sub Success paid
*
*
*
*/
export type WHPaymentSaleType = {
  billing_agreement_id: string;
  amount: WHPaymentSaleAmountType;
  payment_mode: PayPalPaymentModeEnum;
  update_time: Date;
  create_time: Date;
  links: WebHookLinksType[];
  id: string;
  state: string;
  invoice_number: string;
};

export type WHPaymentSaleAmountType = {
  total: string;
  currency: string;
  details: WHPaymentSaleDetailsType;
};

export type WHPaymentSaleDetailsType = {
  subtotal: string;
};