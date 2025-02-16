import {
  FailureActionEnum,
  PayeePreferred,
  PayPalCurrencyCodeEnum,
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
  status: 'ACTIVE' | 'INACTIVE';
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
  custom_id: string;
  start_time?: string; // Date, default now
  shipping_amount?: ShippingAmountType;
  subscriber: SubscriberType;
  application_context: ApplicationContext;
  plan: CreateSubscriptionPlanSettingsType;
};

type CreateSubscriptionPlanSettingsType = {
  payment_preferences: CreateSubscriptionPaymentPreferencesType;
};

type CreateSubscriptionPaymentPreferencesType = {
  setup_fee_failure_action: FailureActionEnum;
};

type ShippingAmountType = {
  currency_code: PayPalCurrencyCodeEnum;
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
  custom_id: string; // User id
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
  custom_id: string; // User id
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
  custom_id: string; // User id
  links: PayPalLinksType[];
  id: string; // Sub id +
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
  billing_agreement_id: string; // Sub id
  custom: string; // User id
  amount: WHPaymentSaleAmountType;
  payment_mode: PayPalPaymentModeEnum;
  update_time: Date;
  create_time: Date;
  links: WebHookLinksType[];
  id: string; // Invoice id
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
/*
*
*
*
      Details about subscription
*
*
*
*/
export type SubscriptionDetailsType = {
  status: SubscriptionStatusEnum;
  status_update_time: Date;
  id: string;
  plan_id: string;
  start_time: Date;
  quantity: string;
  shipping_amount: { currency_code: PayPalCurrencyCodeEnum; value: string };
  subscriber: WHSubscriptionActiveSubscriberType;
  billing_info: WHSubscriptionActiveBillingInfoType;
  create_time: Date;
  update_time: Date;
  custom_id: string;
  plan_overridden: boolean;
  links: Omit<PayPalLinksType, 'encType'>[];
};
/*
*
*
*
      Subscription cancel body
*
*
*
*/
export type ManageSubscriptionBodyType = {
  reason: string;
};
/*
*
*
*
      WebHook Event Sub suspended
*
*
*
*/
export type WHSubscriptionSuspendedType = WHSubscriptionActiveType & {
  status_change_note: string; // Reason for suspend
};
/*
*
*
*
      WebHook Event Sub canceled
*
*
*
*/
export type WHSubscriptionCancelledType = WHSubscriptionActiveType;
